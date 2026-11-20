    "use server";

    import { revalidatePath } from "next/cache";
    import pool from "@/lib/db";
    import { wajibPeran } from "@/lib/auth";
    import { kembaliGalat, kembaliSukses } from "@/lib/arah";
    import { bacaTeks, ubahKeId } from "@/lib/validasi";
    import { hitungStatus } from "@/lib/challenge";

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
