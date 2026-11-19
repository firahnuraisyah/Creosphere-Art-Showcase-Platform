    import { NextResponse } from "next/server";
    import bcrypt from "bcryptjs";
    import pool from "@/lib/db";
    import { buatToken, NAMA_COOKIE, opsiCookie } from "@/lib/session";
    import { tujuanDashboard } from "@/lib/auth";
    import { cekEmail } from "@/lib/validasi";

    function tujuanAman(next, role, status) {
    if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return null;
    const dalamAdmin = next.startsWith("/admin");
    const dalamCurator = next.startsWith("/curator");
    if (role === "admin") return dalamAdmin ? next : null;
    if (role === "curator") return dalamCurator && status === "approved" ? next : null;
    return dalamAdmin || dalamCurator ? null : next;
    }

    export async function POST(request) {
    try {
        const { email, password, next } = await request.json();

        const galatEmail = cekEmail(email);
        if (galatEmail || !password) {
        return NextResponse.json({ message: "Email dan kata sandi wajib diisi." }, { status: 400 });
        }

        const hasil = await pool.query(
        "SELECT id, display_name, email, password_hash, role, status FROM users WHERE LOWER(email) = LOWER($1)",
        [email.trim()]
        );
        const pengguna = hasil.rows[0];

        const cocok = pengguna ? await bcrypt.compare(password, pengguna.password_hash) : false;
        if (!cocok) {
        return NextResponse.json({ message: "Email atau kata sandi salah." }, { status: 401 });
        }

        const tujuan =
        tujuanAman(next, pengguna.role, pengguna.status) ||
        tujuanDashboard(pengguna.role, pengguna.status);

        const respons = NextResponse.json({ message: "Berhasil masuk.", tujuan });
        const token = await buatToken({ id: pengguna.id, role: pengguna.role });
        respons.cookies.set(NAMA_COOKIE, token, opsiCookie);
        return respons;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
        { message: "Terjadi kesalahan pada server. Pastikan database sudah tersambung." },
        { status: 500 }
        );
    }
    }
