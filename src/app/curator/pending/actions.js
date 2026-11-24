"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { wajibPeran } from "@/lib/auth";
import { NAMA_COOKIE } from "@/lib/session";
import { jalankanQuery } from "@/lib/transaksi";
import { kembaliGalat } from "@/lib/arah";
import { hapusBanyakFile, kumpulkanFilePengguna } from "@/lib/berkas";

// Curator yang ditolak hanya boleh menghapus akunnya sendiri.
export async function hapusAkunDitolak() {
    const pengguna = await wajibPeran(["curator"]);

    if (pengguna.status !== "rejected") {
        kembaliGalat("/curator/pending", "Akun hanya dapat dihapus jika pendaftaran ditolak.");
    }

    const berkas = await kumpulkanFilePengguna(pengguna.id);

    const hasil = await jalankanQuery(
        "DELETE FROM users WHERE id = $1 AND role = 'curator' AND status = 'rejected'",
        [pengguna.id]
    );
    if (!hasil.ok) kembaliGalat("/curator/pending", "Terjadi kesalahan pada database. Coba lagi nanti.");
    if (hasil.rowCount > 0) await hapusBanyakFile(berkas);

    const jar = await cookies();
    jar.delete(NAMA_COOKIE);
    redirect("/register");
}
