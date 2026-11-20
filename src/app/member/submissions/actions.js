    "use server";

    import { revalidatePath } from "next/cache";
    import pool from "@/lib/db";
    import { wajibPeran } from "@/lib/auth";
    import { kembaliGalat, kembaliSukses } from "@/lib/arah";
    import { bacaTeks, ubahKeId } from "@/lib/validasi";
    import { hitungStatus } from "@/lib/challenge";

    const HALAMAN = "/member/submissions";

    export async function tarikSubmisi(formData) {
    const pengguna = await wajibPeran(["member"]);
    const idSubmisi = ubahKeId(bacaTeks(formData, "id"));
    if (!idSubmisi) kembaliGalat(HALAMAN, "Submisi tidak valid.");

    let submisi;
    try {
        const hasil = await pool.query(
        `SELECT s.id, ch.start_date, ch.end_date
        FROM submissions s JOIN challenges ch ON ch.id = s.challenge_id
        WHERE s.id = $1 AND s.user_id = $2`,
        [idSubmisi, pengguna.id]
        );
        submisi = hasil.rows[0];
    } catch (error) {
        console.error("tarikSubmisi gagal:", error.message);
        kembaliGalat(HALAMAN, "Submisi gagal ditarik. Coba lagi.");
    }
    if (!submisi) kembaliGalat(HALAMAN, "Submisi tidak ditemukan atau bukan milik Anda.");
    if (hitungStatus(submisi.start_date, submisi.end_date) === "berakhir") {
        kembaliGalat(HALAMAN, "Challenge sudah berakhir, submisi tidak dapat ditarik.");
    }

    try {
        await pool.query("DELETE FROM submissions WHERE id = $1 AND user_id = $2", [idSubmisi, pengguna.id]);
    } catch (error) {
        console.error("tarikSubmisi gagal:", error.message);
        kembaliGalat(HALAMAN, "Submisi gagal ditarik. Coba lagi.");
    }

    revalidatePath(HALAMAN);
    revalidatePath("/member");
    kembaliSukses(HALAMAN, "Submisi berhasil ditarik.");
    }
