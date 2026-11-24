"use server";

import { revalidatePath } from "next/cache";
import { wajibPeran } from "@/lib/auth";
import { ambilSatu } from "@/lib/query";
import { jalankanTransaksi, jalankanQuery, galatPengguna } from "@/lib/transaksi";
import { kembaliGalat, kembaliSukses } from "@/lib/arah";
import { hapusFileLama } from "@/lib/berkas";
import { bacaTeks, cekWajib, cekPanjang, ubahKeId } from "@/lib/validasi";

const GALAT_DB = "Terjadi kesalahan pada database. Coba lagi nanti.";

async function ubahStatusCurator(formData, statusBaru, pesan) {
    await wajibPeran(["admin"]);
    const id = ubahKeId(formData.get("id"));
    if (!id) kembaliGalat("/admin/curators", "Curator tidak ditemukan.");

    const hasil = await jalankanQuery(
        "UPDATE users SET status = $1 WHERE id = $2 AND role = 'curator' AND status = 'pending'",
        [statusBaru, id]
    );
    if (!hasil.ok) kembaliGalat("/admin/curators", GALAT_DB);
    if (hasil.rowCount === 0) kembaliGalat("/admin/curators", "Curator tidak ditemukan atau sudah diproses.");

    revalidatePath("/admin", "layout");
    kembaliSukses("/admin/curators", pesan);
}

export async function setujuiCurator(formData) {
    await ubahStatusCurator(formData, "approved", "Akun curator disetujui. Curator kini dapat masuk ke Dashboard Curator.");
}

export async function tolakCurator(formData) {
    await ubahStatusCurator(formData, "rejected", "Pendaftaran curator ditolak.");
}

export async function abaikanLaporan(formData) {
    await wajibPeran(["admin"]);
    const id = ubahKeId(formData.get("id"));
    if (!id) kembaliGalat("/admin/moderation", "Karya tidak ditemukan.");

    const hasil = await jalankanQuery(
        "UPDATE reports SET status = 'dismissed' WHERE artwork_id = $1 AND status = 'pending'",
        [id]
    );
    if (!hasil.ok) kembaliGalat("/admin/moderation", GALAT_DB);
    if (hasil.rowCount === 0) kembaliGalat("/admin/moderation", "Laporan tidak ditemukan atau sudah diproses.");

    revalidatePath("/admin", "layout");
    kembaliSukses("/admin/moderation", "Laporan diabaikan. Karya tetap tampil di galeri.");
}

export async function takeDownKarya(formData) {
    await wajibPeran(["admin"]);
    const id = ubahKeId(formData.get("id"));
    if (!id) kembaliGalat("/admin/moderation", "Karya tidak ditemukan.");

    let fileLama = null;
    const hasil = await jalankanTransaksi(async (klien) => {
        const ada = await klien.query("SELECT id, file_url FROM artworks WHERE id = $1", [id]);
        if (ada.rows.length === 0) throw galatPengguna("Karya tidak ditemukan atau sudah dihapus.");
        fileLama = ada.rows[0].file_url;

        await klien.query("DELETE FROM winners WHERE submission_id IN (SELECT id FROM submissions WHERE artwork_id = $1)", [id]);
        await klien.query("DELETE FROM submissions WHERE artwork_id = $1", [id]);
        await klien.query("DELETE FROM likes WHERE artwork_id = $1", [id]);
        await klien.query("DELETE FROM favorites WHERE artwork_id = $1", [id]);
        await klien.query("DELETE FROM comments WHERE artwork_id = $1", [id]);
        await klien.query("DELETE FROM artwork_tags WHERE artwork_id = $1", [id]);
        await klien.query("DELETE FROM reports WHERE artwork_id = $1", [id]);
        await klien.query("DELETE FROM artworks WHERE id = $1", [id]);
    });
    if (!hasil.ok) kembaliGalat("/admin/moderation", hasil.pesan);

    await hapusFileLama(fileLama);

    revalidatePath("/admin", "layout");
    revalidatePath("/artworks");
    revalidatePath("/");
    kembaliSukses("/admin/moderation", "Karya berhasil diturunkan beserta seluruh data terkaitnya.");
}

function cekNamaKategori(nama) {
    return cekWajib(nama, "Nama kategori") || cekPanjang(nama, 50, "Nama kategori");
}

export async function tambahKategori(formData) {
    await wajibPeran(["admin"]);
    const nama = bacaTeks(formData, "name");
    const galat = cekNamaKategori(nama);
    if (galat) kembaliGalat("/admin/categories?tambah=1", galat);

    const sama = await ambilSatu("SELECT id FROM categories WHERE LOWER(name) = LOWER($1)", [nama]);
    if (sama) kembaliGalat("/admin/categories?tambah=1", "Nama kategori sudah dipakai.");

    const hasil = await jalankanQuery("INSERT INTO categories (name, is_system) VALUES ($1, false)", [nama]);
    if (!hasil.ok) kembaliGalat("/admin/categories?tambah=1", GALAT_DB);

    revalidatePath("/admin", "layout");
    revalidatePath("/");
    kembaliSukses("/admin/categories", "Kategori berhasil ditambahkan.");
}

export async function ubahKategori(formData) {
    await wajibPeran(["admin"]);
    const id = ubahKeId(formData.get("id"));
    const nama = bacaTeks(formData, "name");
    if (!id) kembaliGalat("/admin/categories", "Kategori tidak ditemukan.");
    const kembaliKe = "/admin/categories?edit=" + id;

    const galat = cekNamaKategori(nama);
    if (galat) kembaliGalat(kembaliKe, galat);

    const kategori = await ambilSatu("SELECT id, is_system FROM categories WHERE id = $1", [id]);
    if (!kategori) kembaliGalat("/admin/categories", "Kategori tidak ditemukan.");
    if (kategori.is_system) kembaliGalat("/admin/categories", "Kategori sistem tidak dapat diganti namanya.");

    const sama = await ambilSatu("SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id <> $2", [nama, id]);
    if (sama) kembaliGalat(kembaliKe, "Nama kategori sudah dipakai.");

    const hasil = await jalankanQuery("UPDATE categories SET name = $1 WHERE id = $2 AND is_system = false", [nama, id]);
    if (!hasil.ok) kembaliGalat(kembaliKe, GALAT_DB);

    revalidatePath("/admin", "layout");
    revalidatePath("/");
    kembaliSukses("/admin/categories", "Nama kategori berhasil diperbarui.");
}

export async function hapusKategori(formData) {
    await wajibPeran(["admin"]);
    const id = ubahKeId(formData.get("id"));
    if (!id) kembaliGalat("/admin/categories", "Kategori tidak ditemukan.");

    const kategori = await ambilSatu(
        "SELECT id, is_system, (SELECT COUNT(*) FROM artworks WHERE category_id = categories.id) AS jumlah_karya FROM categories WHERE id = $1",
        [id]
    );
    if (!kategori) kembaliGalat("/admin/categories", "Kategori tidak ditemukan.");
    if (kategori.is_system) kembaliGalat("/admin/categories", "Kategori sistem tidak dapat dihapus.");
    if (kategori.jumlah_karya > 0) kembaliGalat("/admin/categories", "Kategori yang masih dipakai karya tidak dapat dihapus.");

    const hasil = await jalankanTransaksi(async (klien) => {
        await klien.query("DELETE FROM challenge_categories WHERE category_id = $1", [id]);
        await klien.query("DELETE FROM categories WHERE id = $1 AND is_system = false", [id]);
    });
    if (!hasil.ok) kembaliGalat("/admin/categories", hasil.pesan);

    revalidatePath("/admin", "layout");
    revalidatePath("/");
    kembaliSukses("/admin/categories", "Kategori berhasil dihapus.");
}

async function ubahAktif(formData, aktif, pesan) {
    const admin = await wajibPeran(["admin"]);
    const id = ubahKeId(formData.get("id"));
    if (!id) kembaliGalat("/admin/users", "Pengguna tidak ditemukan.");

    if (id === admin.id) kembaliGalat("/admin/users", "Anda tidak dapat menonaktifkan akun sendiri.");

    const target = await ambilSatu("SELECT id, role FROM users WHERE id = $1", [id]);
    if (!target) kembaliGalat("/admin/users", "Pengguna tidak ditemukan.");
    if (target.role === "admin") kembaliGalat("/admin/users", "Akun admin tidak dapat dinonaktifkan.");

    const hasil = await jalankanQuery(
        "UPDATE users SET is_active = $1 WHERE id = $2 AND role IN ('member', 'curator')",
        [aktif, id]
    );
    if (!hasil.ok) kembaliGalat("/admin/users", GALAT_DB);

    revalidatePath("/admin", "layout");
    revalidatePath("/", "layout");
    kembaliSukses("/admin/users", pesan);
}

export async function nonaktifkanPengguna(formData) {
    await ubahAktif(formData, false, "Akun berhasil dinonaktifkan. Pengguna tidak dapat memakai platform sampai diaktifkan kembali.");
}

export async function aktifkanPengguna(formData) {
    await ubahAktif(formData, true, "Akun berhasil diaktifkan kembali.");
}
