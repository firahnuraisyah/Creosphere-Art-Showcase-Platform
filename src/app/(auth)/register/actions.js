"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import pool from "@/lib/db";
import { bacaTeks, cekWajib, cekPanjang, cekEmail, cekPassword, cekUrlOpsional } from "@/lib/validasi";

const MAKS_CV_BYTES = 5 * 1024 * 1024;

function kenaliEkstensiCv(namaBerkas, bytes) {
    const ext = path.extname(namaBerkas || "").toLowerCase();
    const isPdf = bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
    if (ext === ".pdf" && isPdf) return "pdf";

    const isDoc = bytes.length >= 4 && bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
    if (ext === ".doc" && isDoc) return "doc";

    const isDocx = bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
    if (ext === ".docx" && isDocx) return "docx";

    return null;
}

export async function daftar(formData) {
    const role = bacaTeks(formData, "role");
    const nama = bacaTeks(formData, "display_name");
    const email = bacaTeks(formData, "email").toLowerCase();
    const password = String(formData.get("password") || "");
    const portfolioUrl = bacaTeks(formData, "portfolio_url");
    const berkasCv = formData.get("cv");

    let galat =
        (role !== "member" && role !== "curator" ? "Peran tidak valid." : null) ||
        cekWajib(nama, "Nama tampilan") ||
        cekPanjang(nama, 50, "Nama tampilan") ||
        cekEmail(email) ||
        cekPassword(password);

    if (!galat && role === "curator") {
        galat =
            cekWajib(portfolioUrl, "Link portofolio") ||
            cekPanjang(portfolioUrl, 255, "Link portofolio") ||
            cekUrlOpsional(portfolioUrl, "Link portofolio");

        if (!galat) {
            if (!berkasCv || typeof berkasCv === "string" || berkasCv.size === 0) {
                galat = "CV wajib diunggah (format PDF atau Word).";
            } else if (berkasCv.size > MAKS_CV_BYTES) {
                galat = "Ukuran berkas CV maksimal 5 MB.";
            }
        }
    }

    if (galat) redirect("/register?galat=" + encodeURIComponent(galat));

    let cvUrl = null;
    if (role === "curator") {
        const bytes = new Uint8Array(await berkasCv.arrayBuffer());
        const ekstensi = kenaliEkstensiCv(berkasCv.name, bytes);
        if (!ekstensi) {
            redirect("/register?galat=" + encodeURIComponent("Format CV harus PDF, DOC, atau DOCX yang valid."));
        }
        const namaBerkas = randomUUID() + "." + ekstensi;
        const folder = path.join(process.cwd(), "public", "uploads", "cv");
        await mkdir(folder, { recursive: true });
        await writeFile(path.join(folder, namaBerkas), bytes);
        cvUrl = "/uploads/cv/" + namaBerkas;
    }

    let tujuan;
    try {
        const ada = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (ada.rows.length > 0) {
        tujuan = "/register?galat=" + encodeURIComponent("Email sudah terdaftar. Silakan masuk.");
        } else {
        const hash = await bcrypt.hash(password, 10);
        const status = role === "curator" ? "pending" : "approved";
        await pool.query(
            "INSERT INTO users (display_name, email, password_hash, role, status, cv_url, portfolio_url) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [nama, email, hash, role, status, cvUrl, role === "curator" ? portfolioUrl : null]
        );
        const pesan =
            role === "curator"
            ? "Akun Curator berhasil dibuat. Silakan masuk; akun akan aktif setelah disetujui Admin."
            : "Akun berhasil dibuat. Silakan masuk.";
        tujuan = "/login?sukses=" + encodeURIComponent(pesan);
        }
    } catch (error) {
        console.error(error);
        if (error.code === "23505") {
        tujuan = "/register?galat=" + encodeURIComponent("Email sudah terdaftar. Silakan masuk.");
        } else {
        tujuan = "/register?galat=" + encodeURIComponent("Gagal membuat akun. Pastikan database sudah tersambung.");
        }
    }
    redirect(tujuan);
}
