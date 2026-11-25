"use server";

import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { kembaliGalat, kembaliSukses } from "@/lib/arah";
import { hapusFileLama } from "@/lib/berkas";
import { bacaTeks, cekWajib, cekPanjang, cekUrlUnggahan } from "@/lib/validasi";
import { bacaTautanForm } from "@/lib/tautan";
import { daftarNegara } from "@/lib/negara";

const HALAMAN = "/member/profile";

export async function simpanProfil(formData) {
    // 1. sesi + peran
    const pengguna = await wajibPeran(["member"]);

    // 2. validasi
    const nama = bacaTeks(formData, "display_name");
    const bio = bacaTeks(formData, "bio");
    const negara = bacaTeks(formData, "country");
    const tautan = bacaTautanForm(formData);
    const avatar = bacaTeks(formData, "avatar_url");

    const galat =
        cekWajib(nama, "Nama tampilan") ||
        cekPanjang(nama, 50, "Nama tampilan") ||
        cekPanjang(bio, 500, "Biografi") ||
        tautan.galat ||
        (avatar ? cekUrlUnggahan(avatar, "avatars") : null) ||
        (negara && !daftarNegara.includes(negara) ? "Negara tidak valid." : null);
    if (galat) kembaliGalat(HALAMAN, galat);

    // 3. SQL berparameter (profil milik sendiri)
    let avatarLama = null;
    try {
        const lama = await pool.query("SELECT avatar_url FROM users WHERE id = $1", [pengguna.id]);
        avatarLama = lama.rows[0] ? lama.rows[0].avatar_url : null;

        await pool.query(
        `UPDATE users
        SET display_name = $1, bio = $2, country = $3, external_links = $4, avatar_url = $5
        WHERE id = $6`,
        [nama, bio || null, negara || null, tautan.teks, avatar || null, pengguna.id]
        );
    } catch (error) {
        console.error("simpanProfil gagal:", error.message);
        kembaliGalat(HALAMAN, "Profil gagal disimpan. Coba lagi.");
    }

    // Foto diganti atau dihapus: buang berkas lama dari disk
    if (avatarLama && avatarLama !== avatar) await hapusFileLama(avatarLama);

    revalidatePath("/member");
    revalidatePath(HALAMAN);
    revalidatePath("/artists/" + pengguna.id);
    kembaliSukses("/artists/" + pengguna.id, "Perubahan profil berhasil disimpan.");
}
