    "use server";

    import bcrypt from "bcryptjs";
    import { redirect } from "next/navigation";
    import pool from "@/lib/db";
    import { bacaTeks, cekWajib, cekPanjang, cekEmail, cekPassword } from "@/lib/validasi";

    export async function daftar(formData) {
    const role = bacaTeks(formData, "role");
    const nama = bacaTeks(formData, "display_name");
    const email = bacaTeks(formData, "email").toLowerCase();
    const password = String(formData.get("password") || "");

    const galat =
        (role !== "member" && role !== "curator" ? "Peran tidak valid." : null) ||
        cekWajib(nama, "Nama tampilan") ||
        cekPanjang(nama, 50, "Nama tampilan") ||
        cekEmail(email) ||
        cekPassword(password);
    if (galat) redirect("/register?galat=" + encodeURIComponent(galat));

    let tujuan;
    try {
        const ada = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (ada.rows.length > 0) {
        tujuan = "/register?galat=" + encodeURIComponent("Email sudah terdaftar. Silakan masuk.");
        } else {
        const hash = await bcrypt.hash(password, 10);
        const status = role === "curator" ? "pending" : "approved";
        await pool.query(
            "INSERT INTO users (display_name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5)",
            [nama, email, hash, role, status]
        );
        const pesan =
            role === "curator"
            ? "Akun Curator berhasil dibuat. Silakan masuk; akun akan aktif setelah disetujui Admin."
            : "Akun berhasil dibuat. Silakan masuk.";
        tujuan = "/login?sukses=" + encodeURIComponent(pesan);
        }
    } catch (error) {
        console.error(error);
        tujuan = "/register?galat=" + encodeURIComponent("Gagal membuat akun. Pastikan database sudah tersambung.");
    }
    redirect(tujuan);
    }
