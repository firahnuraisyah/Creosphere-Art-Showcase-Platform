"use server";

import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { ambilBanyak } from "@/lib/query";
import { hitungStatus } from "@/lib/challenge";
import { hapusFileLama } from "@/lib/berkas";
import { wajibPeran } from "@/lib/auth";
import { kembaliGalat, kembaliSukses } from "@/lib/arah";
import { bacaTeks, cekWajib, cekPanjang, cekUrlUnggahan, bersihkanTag, ubahKeId } from "@/lib/validasi";

// Validasi isian karya yang sama untuk unggah dan edit. 
async function periksaIsian(formData) {
    const judul = bacaTeks(formData, "title");
    const deskripsi = bacaTeks(formData, "description");
    const idKategori = ubahKeId(bacaTeks(formData, "category_id"));
    const jenis = bacaTeks(formData, "artwork_type");
    const tag = bersihkanTag(bacaTeks(formData, "tags"));

    const galat =
        cekWajib(judul, "Judul karya") ||
        cekPanjang(judul, 100, "Judul karya") ||
        cekWajib(deskripsi, "Deskripsi karya") ||
        cekPanjang(deskripsi, 2000, "Deskripsi karya") ||
        cekPanjang(jenis, 60, "Jenis karya") ||
        (!idKategori ? "Kategori wajib dipilih." : null) ||
        (tag.length < 1 ? "Minimal 1 tag wajib diisi." : null);
    if (galat) return { galat };

    const kategori = await pool.query("SELECT id, is_system FROM categories WHERE id = $1", [idKategori]);
    if (kategori.rows.length === 0) return { galat: "Kategori tidak ditemukan." };
    if (kategori.rows[0].is_system && !jenis) {
        return { galat: "Kategori Lainnya mewajibkan Anda menyebutkan jenis karya." };
    }
    return { data: { judul, deskripsi, idKategori, jenis: jenis || null, tag } };
}

// Menyimpan tag karya (hapus yang lama, tambah yang baru). 
async function simpanTag(klien, idKarya, daftarTag) {
    await klien.query("DELETE FROM artwork_tags WHERE artwork_id = $1", [idKarya]);
    for (const nama of daftarTag) {
        const tagBaris = await klien.query(
        "INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
        [nama]
        );
        await klien.query("INSERT INTO artwork_tags (artwork_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
        idKarya,
        tagBaris.rows[0].id,
        ]);
    }
}

export async function unggahKarya(formData) {
    const pengguna = await wajibPeran(["member"]);
    const kembali = "/member/artworks/new";

    const urlFile = bacaTeks(formData, "file_url");
    const galatFile = cekUrlUnggahan(urlFile, "artworks");
    if (galatFile) kembaliGalat(kembali, galatFile);

    let isian;
    try {
        isian = await periksaIsian(formData);
    } catch (error) {
        console.error("unggahKarya gagal:", error.message);
        kembaliGalat(kembali, "Karya gagal diterbitkan. Coba lagi.");
    }
    if (isian.galat) kembaliGalat(kembali, isian.galat);
    const { judul, deskripsi, idKategori, jenis, tag } = isian.data;

    const klien = await pool.connect().catch(() => null);
    if (!klien) kembaliGalat(kembali, "Database belum tersambung. Coba lagi nanti.");
    let berhasil = false;
    try {
        await klien.query("BEGIN");
        const baris = await klien.query(
        `INSERT INTO artworks (user_id, category_id, title, description, artwork_type, file_url)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [pengguna.id, idKategori, judul, deskripsi, jenis, urlFile]
        );
        await simpanTag(klien, baris.rows[0].id, tag);
        await klien.query("COMMIT");
        berhasil = true;
    } catch (error) {
        await klien.query("ROLLBACK").catch(() => {});
        console.error("unggahKarya gagal:", error.message);
    } finally {
        klien.release();
    }
    if (!berhasil) kembaliGalat(kembali, "Karya gagal diterbitkan. Coba lagi.");

    revalidatePath("/member");
    revalidatePath("/member/artworks");
    revalidatePath("/artworks");
    kembaliSukses("/member/artworks", "Karya berhasil diterbitkan.");
}

export async function ubahKarya(formData) {
    const pengguna = await wajibPeran(["member"]);
    const idKarya = ubahKeId(bacaTeks(formData, "id"));
    if (!idKarya) kembaliGalat("/member/artworks", "Karya tidak valid.");
    const kembali = "/member/artworks/" + idKarya + "/edit";

    // Kepemilikan: hanya pemilik karya yang boleh mengubah
    const milik = await pool.query("SELECT id FROM artworks WHERE id = $1 AND user_id = $2", [idKarya, pengguna.id]).catch(() => null);
    if (!milik || milik.rows.length === 0) kembaliGalat("/member/artworks", "Karya tidak ditemukan atau bukan milik Anda.");

    let isian;
    try {
        isian = await periksaIsian(formData);
    } catch (error) {
        console.error("ubahKarya gagal:", error.message);
        kembaliGalat(kembali, "Perubahan gagal disimpan. Coba lagi.");
    }
    if (isian.galat) kembaliGalat(kembali, isian.galat);
    const { judul, deskripsi, idKategori, jenis, tag } = isian.data;

    const bentrok = await ambilBanyak(
        `SELECT ch.title, ch.start_date, ch.end_date
        FROM submissions s JOIN challenges ch ON ch.id = s.challenge_id
        WHERE s.artwork_id = $1
        AND EXISTS (SELECT 1 FROM challenge_categories cc WHERE cc.challenge_id = ch.id)
        AND NOT EXISTS (SELECT 1 FROM challenge_categories cc WHERE cc.challenge_id = ch.id AND cc.category_id = $2)`,
        [idKarya, idKategori]
    );
    const challengeAktif = bentrok.find((c) => hitungStatus(c.start_date, c.end_date) !== "berakhir");
    if (challengeAktif) {
        kembaliGalat(
        kembali,
        'Karya ini sedang diikutkan di challenge "' + challengeAktif.title + '" yang tidak menerima kategori tersebut. Tarik submisi terlebih dahulu sebelum mengganti kategori.'
        );
    }

    const klien = await pool.connect().catch(() => null);
    if (!klien) kembaliGalat(kembali, "Database belum tersambung. Coba lagi nanti.");
    let berhasil = false;
    try {
        await klien.query("BEGIN");
        // file_url tidak diubah: gambar tidak bisa diganti setelah terbit
        await klien.query(
        `UPDATE artworks SET title = $1, description = $2, category_id = $3, artwork_type = $4
        WHERE id = $5 AND user_id = $6`,
        [judul, deskripsi, idKategori, jenis, idKarya, pengguna.id]
        );
        await simpanTag(klien, idKarya, tag);
        await klien.query("COMMIT");
        berhasil = true;
    } catch (error) {
        await klien.query("ROLLBACK").catch(() => {});
        console.error("ubahKarya gagal:", error.message);
    } finally {
        klien.release();
    }
    if (!berhasil) kembaliGalat(kembali, "Perubahan gagal disimpan. Coba lagi.");

    revalidatePath("/member/artworks");
    revalidatePath("/artworks/" + idKarya);
    kembaliSukses("/member/artworks", "Perubahan karya berhasil disimpan.");
    }

    export async function hapusKarya(formData) {
    const pengguna = await wajibPeran(["member"]);
    const idKarya = ubahKeId(bacaTeks(formData, "id"));
    if (!idKarya) kembaliGalat("/member/artworks", "Karya tidak valid.");

    let jumlah = 0;
    let fileLama = null;
    try {
        // Simpan lokasi gambar 
        const ada = await pool.query("SELECT file_url FROM artworks WHERE id = $1 AND user_id = $2", [idKarya, pengguna.id]);
        fileLama = ada.rows[0] ? ada.rows[0].file_url : null;

        // Kepemilikan dicek 
        const hasil = await pool.query("DELETE FROM artworks WHERE id = $1 AND user_id = $2", [idKarya, pengguna.id]);
        jumlah = hasil.rowCount;
    } catch (error) {
        console.error("hapusKarya gagal:", error.message);
        kembaliGalat("/member/artworks", "Karya gagal dihapus. Coba lagi.");
    }
    if (jumlah === 0) kembaliGalat("/member/artworks", "Karya tidak ditemukan atau bukan milik Anda.");

    // Hapus berkas gambar dari disk (hanya yang berada di /uploads/)
    await hapusFileLama(fileLama);

    revalidatePath("/member");
    revalidatePath("/member/artworks");
    revalidatePath("/artworks");
    kembaliSukses("/member/artworks", "Karya berhasil dihapus.");
}
