    "use server";

    import { redirect } from "next/navigation";
    import { revalidatePath } from "next/cache";
    import pool from "@/lib/db";
    import { ambilPengguna } from "@/lib/auth";
    import { bacaTeks, cekWajib, cekPanjang, ubahKeId } from "@/lib/validasi";

    const ALASAN = {
    plagiarisme: "Plagiarisme atau pelanggaran kekayaan intelektual",
    tidak_pantas: "Konten tidak pantas atau eksplisit",
    kebencian: "Ujaran kebencian, pelecehan, atau diskriminasi",
    lainnya: "Pelanggaran lainnya",
    };

    function kembali(id, jenis, pesan) {
    const url = "/artworks/" + id + "?" + jenis + "=" + encodeURIComponent(pesan);
    redirect(jenis === "galat" ? url + "#komentar" : url);
    }

    async function cekAwal(formData) {
    const id = ubahKeId(formData.get("artwork_id"));
    if (!id) redirect("/artworks");

    const pengguna = await ambilPengguna();
    if (!pengguna) redirect("/login?next=" + encodeURIComponent("/artworks/" + id));
    if (pengguna.role !== "member") {
        kembali(id, "galat", "Hanya akun Member yang dapat berinteraksi dengan karya.");
    }
    const ada = await pool.query("SELECT user_id FROM artworks WHERE id = $1", [id]);
    if (ada.rows.length === 0) redirect("/artworks");
    return { id, pengguna, pemilikId: ada.rows[0].user_id };
    }

    export async function toggleSuka(formData) {
    const { id, pengguna } = await cekAwal(formData);
    try {
        const hapus = await pool.query("DELETE FROM likes WHERE user_id = $1 AND artwork_id = $2", [pengguna.id, id]);
        if (hapus.rowCount === 0) {
        await pool.query(
            "INSERT INTO likes (user_id, artwork_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [pengguna.id, id]
        );
        }
    } catch (error) {
        console.error(error);
        kembali(id, "galat", "Gagal memproses suka.");
    }
    revalidatePath("/artworks/" + id);
    redirect("/artworks/" + id);
    }

    export async function toggleFavorit(formData) {
    const { id, pengguna } = await cekAwal(formData);
    try {
        const hapus = await pool.query("DELETE FROM favorites WHERE user_id = $1 AND artwork_id = $2", [pengguna.id, id]);
        if (hapus.rowCount === 0) {
        await pool.query(
            "INSERT INTO favorites (user_id, artwork_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [pengguna.id, id]
        );
        }
    } catch (error) {
        console.error(error);
        kembali(id, "galat", "Gagal memproses favorit.");
    }
    revalidatePath("/artworks/" + id);
    redirect("/artworks/" + id);
    }

    export async function tambahKomentar(formData) {
    const { id, pengguna } = await cekAwal(formData);
    const isi = bacaTeks(formData, "body");
    const galat = cekWajib(isi, "Komentar") || cekPanjang(isi, 500, "Komentar");
    if (galat) kembali(id, "galat", galat);
    try {
        await pool.query("INSERT INTO comments (artwork_id, user_id, body) VALUES ($1, $2, $3)", [id, pengguna.id, isi]);
    } catch (error) {
        console.error(error);
        kembali(id, "galat", "Gagal mengirim komentar.");
    }
    revalidatePath("/artworks/" + id);
    redirect("/artworks/" + id + "?sukses=" + encodeURIComponent("Komentar berhasil dikirim.") + "#komentar");
    }

    export async function hapusKomentar(formData) {
    const idKarya = ubahKeId(formData.get("artwork_id"));
    const idKomentar = ubahKeId(formData.get("comment_id"));
    if (!idKarya || !idKomentar) redirect("/artworks");
    const pengguna = await ambilPengguna();
    if (!pengguna) redirect("/login");
    // kepemilikan dicek di SQL (user_id = pengguna)
    await pool.query("DELETE FROM comments WHERE id = $1 AND user_id = $2 AND artwork_id = $3", [idKomentar, pengguna.id, idKarya]);
    revalidatePath("/artworks/" + idKarya);
    redirect("/artworks/" + idKarya + "#komentar");
    }

    export async function laporKarya(formData) {
    const { id, pengguna, pemilikId } = await cekAwal(formData);
    const alasan = bacaTeks(formData, "reason");
    const catatan = bacaTeks(formData, "note");
    if (!ALASAN[alasan]) kembali(id, "galat", "Alasan laporan tidak valid.");
    const galatCatatan = cekPanjang(catatan, 500, "Catatan");
    if (galatCatatan) kembali(id, "galat", galatCatatan);
    if (pemilikId === pengguna.id) kembali(id, "galat", "Anda tidak dapat melaporkan karya sendiri.");
    try {
        const hasil = await pool.query(
        `INSERT INTO reports (artwork_id, reporter_id, reason, note) VALUES ($1, $2, $3, $4)
        ON CONFLICT (artwork_id, reporter_id) DO NOTHING`,
        [id, pengguna.id, ALASAN[alasan], catatan || null]
        );
        if (hasil.rowCount === 0) kembali(id, "galat", "Anda sudah melaporkan karya ini sebelumnya.");
    } catch (error) {
        if (error?.digest?.startsWith?.("NEXT_REDIRECT")) throw error;
        console.error(error);
        kembali(id, "galat", "Gagal mengirim laporan.");
    }
    kembali(id, "sukses", "Laporan terkirim ke antrean moderasi. Terima kasih.");
    }
