    "use server";

    import { revalidatePath } from "next/cache";
    import pool from "@/lib/db";
    import { wajibPeran } from "@/lib/auth";
    import { kembaliGalat, kembaliSukses } from "@/lib/arah";
    import { bacaTeks, ubahKeId } from "@/lib/validasi";

    export async function hapusFavorit(formData) {
    const pengguna = await wajibPeran(["member"]);
    const idKarya = ubahKeId(bacaTeks(formData, "id"));
    if (!idKarya) kembaliGalat("/member/favorites", "Karya tidak valid.");

    try {
        await pool.query("DELETE FROM favorites WHERE user_id = $1 AND artwork_id = $2", [pengguna.id, idKarya]);
    } catch (error) {
        console.error("hapusFavorit gagal:", error.message);
        kembaliGalat("/member/favorites", "Favorit gagal dihapus. Coba lagi.");
    }

    revalidatePath("/member/favorites");
    revalidatePath("/member");
    kembaliSukses("/member/favorites", "Karya dihapus dari favorit.");
    }
