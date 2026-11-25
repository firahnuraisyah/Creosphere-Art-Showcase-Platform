"use server";

import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { kembaliGalat, kembaliSukses } from "@/lib/arah";
import { bacaTeks, cekUrlUnggahan, ubahKeId } from "@/lib/validasi";
import { hitungStatus } from "@/lib/challenge";
import { periksaIsian, simpanTag } from "@/lib/simpanKarya";
import { jalankanTransaksi, galatPengguna } from "@/lib/transaksi";

export async function kirimSubmisi(formData) {
    const pengguna = await wajibPeran(["member"]);

    const idChallenge = ubahKeId(bacaTeks(formData, "challenge_id"));
    if (!idChallenge) kembaliGalat("/challenges", "Challenge tidak valid.");
    const kembali = "/challenges/" + idChallenge + "/submit";
    const idKarya = ubahKeId(bacaTeks(formData, "selected_artwork"));
    if (!idKarya) kembaliGalat(kembali, "Pilih satu karya terlebih dahulu.");
    if (formData.get("setuju_1") !== "on" || formData.get("setuju_2") !== "on") {
        kembaliGalat(kembali, "Anda harus menyetujui kedua pernyataan konfirmasi.");
    }

    try {
        const ch = await pool.query("SELECT id, start_date, end_date FROM challenges WHERE id = $1", [idChallenge]);
        if (ch.rows.length === 0) kembaliGalat("/challenges", "Challenge tidak ditemukan.");
        if (hitungStatus(ch.rows[0].start_date, ch.rows[0].end_date) !== "aktif") {
        kembaliGalat("/challenges/" + idChallenge, "Challenge ini tidak sedang menerima submisi.");
        }

        const karya = await pool.query(
        `SELECT a.id FROM artworks a
        WHERE a.id = $1 AND a.user_id = $2
            AND (NOT EXISTS (SELECT 1 FROM challenge_categories WHERE challenge_id = $3)
                OR a.category_id IN (SELECT category_id FROM challenge_categories WHERE challenge_id = $3))`,
        [idKarya, pengguna.id, idChallenge]
        );
        if (karya.rows.length === 0) {
        kembaliGalat(kembali, "Karya tidak ditemukan, bukan milik Anda, atau kategorinya tidak sesuai challenge.");
        }

        await pool.query(
        `INSERT INTO submissions (challenge_id, user_id, artwork_id) VALUES ($1, $2, $3)
        ON CONFLICT (challenge_id, user_id) DO UPDATE SET artwork_id = EXCLUDED.artwork_id, created_at = NOW()`,
        [idChallenge, pengguna.id, idKarya]
        );
    } catch (error) {
        if (error && error.digest && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
        console.error("kirimSubmisi gagal:", error.message);
        kembaliGalat(kembali, "Submisi gagal dikirim. Coba lagi.");
    }

    revalidatePath("/member/submissions");
    revalidatePath("/challenges/" + idChallenge);
    kembaliSukses("/member/submissions", "Karya berhasil diikutkan ke challenge.");
}

export async function unggahKaryaChallenge(formData) {
    const pengguna = await wajibPeran(["member"]);

    const idChallenge = ubahKeId(bacaTeks(formData, "challenge_id"));
    if (!idChallenge) kembaliGalat("/challenges", "Challenge tidak valid.");
    const kembali = "/challenges/" + idChallenge + "/submit";
    const urlFile = bacaTeks(formData, "file_url");
    const galatFile = cekUrlUnggahan(urlFile, "artworks");
    if (galatFile) kembaliGalat(kembali, "Gambar karya wajib diunggah. " + galatFile);
    if (formData.get("setuju_1") !== "on") kembaliGalat(kembali, "Anda harus menyetujui pernyataan keaslian karya.");

    let isian;
    let challenge;
    let kategoriChallenge;
    try {
        isian = await periksaIsian(formData);
        const ch = await pool.query("SELECT id, start_date, end_date FROM challenges WHERE id = $1", [idChallenge]);
        challenge = ch.rows[0];
        const kat = await pool.query("SELECT category_id FROM challenge_categories WHERE challenge_id = $1", [idChallenge]);
        kategoriChallenge = kat.rows.map((k) => k.category_id);
    } catch (error) {
        console.error("unggahKaryaChallenge gagal:", error.message);
        kembaliGalat(kembali, "Karya gagal dikirim. Coba lagi.");
    }
    if (isian.galat) kembaliGalat(kembali, isian.galat);
    if (!challenge) kembaliGalat("/challenges", "Challenge tidak ditemukan.");

    if (hitungStatus(challenge.start_date, challenge.end_date) !== "aktif") {
        kembaliGalat("/challenges/" + idChallenge, "Challenge ini tidak sedang menerima submisi.");
    }
    const { judul, deskripsi, idKategori, jenis, tag } = isian.data;
    if (kategoriChallenge.length > 0 && !kategoriChallenge.includes(idKategori)) {
        kembaliGalat(kembali, "Kategori karya tidak diizinkan oleh challenge ini.");
    }

    const hasil = await jalankanTransaksi(async (klien) => {
        const baris = await klien.query(
        `INSERT INTO artworks (user_id, category_id, title, description, artwork_type, file_url)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [pengguna.id, idKategori, judul, deskripsi, jenis, urlFile]
        );
        await simpanTag(klien, baris.rows[0].id, tag);
        const simpan = await klien.query(
        `INSERT INTO submissions (challenge_id, user_id, artwork_id) VALUES ($1, $2, $3)
        ON CONFLICT (challenge_id, user_id) DO UPDATE SET artwork_id = EXCLUDED.artwork_id, created_at = NOW()`,
        [idChallenge, pengguna.id, baris.rows[0].id]
        );
        if (simpan.rowCount === 0) throw galatPengguna("Submisi gagal disimpan.");
    });
    if (!hasil.ok) kembaliGalat(kembali, hasil.pesan);

    revalidatePath("/member");
    revalidatePath("/member/artworks");
    revalidatePath("/member/submissions");
    revalidatePath("/artworks");
    revalidatePath("/challenges/" + idChallenge);
    kembaliSukses("/member/submissions", "Karya berhasil diunggah dan diikutkan ke challenge.");
}
