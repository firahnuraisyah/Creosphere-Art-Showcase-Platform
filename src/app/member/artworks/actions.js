"use server";

import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { ambilBanyak } from "@/lib/query";
import { hitungStatus } from "@/lib/challenge";
import { hapusFileLama } from "@/lib/berkas";
import { wajibPeran } from "@/lib/auth";
import { kembaliGalat, kembaliSukses } from "@/lib/arah";
import { bacaTeks, cekUrlUnggahan, ubahKeId } from "@/lib/validasi";
import { periksaIsian, simpanTag } from "@/lib/simpanKarya";

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
        const ada = await pool.query("SELECT file_url FROM artworks WHERE id = $1 AND user_id = $2", [idKarya, pengguna.id]);
        fileLama = ada.rows[0] ? ada.rows[0].file_url : null;

        const hasil = await pool.query("DELETE FROM artworks WHERE id = $1 AND user_id = $2", [idKarya, pengguna.id]);
        jumlah = hasil.rowCount;
    } catch (error) {
        console.error("hapusKarya gagal:", error.message);
        kembaliGalat("/member/artworks", "Karya gagal dihapus. Coba lagi.");
    }
    if (jumlah === 0) kembaliGalat("/member/artworks", "Karya tidak ditemukan atau bukan milik Anda.");

    await hapusFileLama(fileLama);

    revalidatePath("/member");
    revalidatePath("/member/artworks");
    revalidatePath("/artworks");
    kembaliSukses("/member/artworks", "Karya berhasil dihapus.");
}
