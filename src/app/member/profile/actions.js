    "use server";

    import { revalidatePath } from "next/cache";
    import pool from "@/lib/db";
    import { wajibPeran } from "@/lib/auth";
    import { kembaliGalat, kembaliSukses } from "@/lib/arah";
    import { bacaTeks, cekWajib, cekPanjang, cekUrlOpsional, cekUrlUnggahan } from "@/lib/validasi";
    import { daftarNegara } from "@/lib/negara";

    const HALAMAN = "/member/profile";

    export async function simpanProfil(formData) {
    const pengguna = await wajibPeran(["member"]);

    const nama = bacaTeks(formData, "display_name");
    const headline = bacaTeks(formData, "headline");
    const bio = bacaTeks(formData, "bio");
    const negara = bacaTeks(formData, "country");
    const instagram = bacaTeks(formData, "instagram");
    const behance = bacaTeks(formData, "behance");
    const website = bacaTeks(formData, "website");
    const avatar = bacaTeks(formData, "avatar_url");

    const galat =
        cekWajib(nama, "Nama tampilan") ||
        cekPanjang(nama, 50, "Nama tampilan") ||
        cekPanjang(headline, 100, "Judul singkat") ||
        cekPanjang(bio, 500, "Biografi") ||
        cekUrlOpsional(instagram, "Tautan Instagram") ||
        cekUrlOpsional(behance, "Tautan Behance") ||
        cekUrlOpsional(website, "Tautan situs web") ||
        (avatar ? cekUrlUnggahan(avatar, "avatars") : null) ||
        (negara && !daftarNegara.includes(negara) ? "Negara tidak valid." : null);
    if (galat) kembaliGalat(HALAMAN, galat);

    const tautan = JSON.stringify({ instagram, behance, website });
    try {
        await pool.query(
        `UPDATE users
        SET display_name = $1, headline = $2, bio = $3, country = $4, external_links = $5, avatar_url = $6
        WHERE id = $7`,
        [nama, headline || null, bio || null, negara || null, tautan, avatar || null, pengguna.id]
        );
    } catch (error) {
        console.error("simpanProfil gagal:", error.message);
        kembaliGalat(HALAMAN, "Profil gagal disimpan. Coba lagi.");
    }

    revalidatePath("/member");
    revalidatePath(HALAMAN);
    kembaliSukses(HALAMAN, "Perubahan profil berhasil disimpan.");
    }
