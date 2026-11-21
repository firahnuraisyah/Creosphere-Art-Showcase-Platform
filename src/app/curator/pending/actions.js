    "use server";

    import { cookies } from "next/headers";
    import { redirect } from "next/navigation";
    import { wajibPeran } from "@/lib/auth";
    import { NAMA_COOKIE } from "@/lib/session";
    import { jalankanQuery } from "@/lib/transaksi";
    import { kembaliGalat } from "@/lib/arah";

    export async function hapusAkunDitolak() {
    const pengguna = await wajibPeran(["curator"]);

    if (pengguna.status !== "rejected") {
        kembaliGalat("/curator/pending", "Akun hanya dapat dihapus jika pendaftaran ditolak.");
    }

    const hasil = await jalankanQuery(
        "DELETE FROM users WHERE id = $1 AND role = 'curator' AND status = 'rejected'",
        [pengguna.id]
    );
    if (!hasil.ok) kembaliGalat("/curator/pending", "Terjadi kesalahan pada database. Coba lagi nanti.");

    const jar = await cookies();
    jar.delete(NAMA_COOKIE);
    redirect("/register");
    }
