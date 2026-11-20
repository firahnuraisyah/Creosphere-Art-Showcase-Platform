    "use server";

    import bcrypt from "bcryptjs";
    import { cookies } from "next/headers";
    import { redirect } from "next/navigation";
    import { revalidatePath } from "next/cache";
    import pool from "@/lib/db";
    import { wajibPeran } from "@/lib/auth";
    import { NAMA_COOKIE } from "@/lib/session";
    import { kembaliGalat, kembaliSukses } from "@/lib/arah";
    import { bacaTeks, cekEmail, cekPassword } from "@/lib/validasi";

    const HALAMAN = "/member/account";

    async function passwordBenar(idPengguna, passwordMasukan) {
    if (!passwordMasukan) return false;
    try {
        const hasil = await pool.query("SELECT password_hash FROM users WHERE id = $1", [idPengguna]);
        if (hasil.rows.length === 0) return false;
        return await bcrypt.compare(passwordMasukan, hasil.rows[0].password_hash);
    } catch (error) {
        console.error("passwordBenar gagal:", error.message);
        return false;
    }
    }

    export async function ubahEmail(formData) {
    const pengguna = await wajibPeran(["member"]);
    const emailBaru = bacaTeks(formData, "email").toLowerCase();
    const password = formData.get("password");

    const galat = cekEmail(emailBaru);
    if (galat) kembaliGalat(HALAMAN, galat);
    if (!(await passwordBenar(pengguna.id, typeof password === "string" ? password : ""))) {
        kembaliGalat(HALAMAN, "Kata sandi salah.");
    }

    try {
        const sama = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1 AND id <> $2", [emailBaru, pengguna.id]);
        if (sama.rows.length > 0) kembaliGalat(HALAMAN, "Email sudah dipakai akun lain.");
        await pool.query("UPDATE users SET email = $1 WHERE id = $2", [emailBaru, pengguna.id]);
    } catch (error) {
        if (error && error.digest && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
        console.error("ubahEmail gagal:", error.message);
        kembaliGalat(HALAMAN, "Email gagal diubah. Coba lagi.");
    }

    revalidatePath(HALAMAN);
    kembaliSukses(HALAMAN, "Email berhasil diperbarui.");
    }

    export async function gantiPassword(formData) {
    const pengguna = await wajibPeran(["member"]);
    const lama = formData.get("password_lama");
    const baru = formData.get("password_baru");
    const ulang = formData.get("password_ulang");

    if (!(await passwordBenar(pengguna.id, typeof lama === "string" ? lama : ""))) {
        kembaliGalat(HALAMAN, "Kata sandi lama salah.");
    }
    const galat = cekPassword(typeof baru === "string" ? baru : "");
    if (galat) kembaliGalat(HALAMAN, galat);
    if (baru !== ulang) kembaliGalat(HALAMAN, "Konfirmasi kata sandi baru tidak sama.");

    try {
        const hash = await bcrypt.hash(baru, 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, pengguna.id]);
    } catch (error) {
        console.error("gantiPassword gagal:", error.message);
        kembaliGalat(HALAMAN, "Kata sandi gagal diubah. Coba lagi.");
    }

    kembaliSukses(HALAMAN, "Kata sandi berhasil diubah.");
    }

    export async function hapusAkun(formData) {
    const pengguna = await wajibPeran(["member"]);
    const password = formData.get("password");
    if (!(await passwordBenar(pengguna.id, typeof password === "string" ? password : ""))) {
        kembaliGalat(HALAMAN, "Kata sandi salah. Akun tidak dihapus.");
    }

    try {
        await pool.query("DELETE FROM users WHERE id = $1 AND role = 'member'", [pengguna.id]);
    } catch (error) {
        console.error("hapusAkun gagal:", error.message);
        kembaliGalat(HALAMAN, "Akun gagal dihapus. Coba lagi.");
    }

    const jar = await cookies();
    jar.delete(NAMA_COOKIE);
    redirect("/login?sukses=" + encodeURIComponent("Akun Anda telah dihapus."));
    }
