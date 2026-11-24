import { unlink } from "fs/promises";
import path from "path";
import { ambilBanyak } from "@/lib/query";

const FOLDER_UPLOAD = path.join(process.cwd(), "public", "uploads");
const POLA_URL = /^\/uploads\/(artworks|avatars|banners)\/[a-f0-9-]{36}\.(jpg|png|webp|gif)$/;

export async function hapusFileLama(url) {
    if (typeof url !== "string" || !POLA_URL.test(url)) return false;

    const lokasi = path.join(process.cwd(), "public", url);
    const relatif = path.relative(FOLDER_UPLOAD, lokasi);
    if (relatif.startsWith("..") || path.isAbsolute(relatif)) return false;

    try {
        await unlink(lokasi);
        return true;
    } catch (error) {
        if (error.code !== "ENOENT") console.error("hapusFileLama gagal:", error.message);
        return false;
    }
}

export async function hapusBanyakFile(daftarUrl) {
    for (const url of new Set(daftarUrl)) {
        await hapusFileLama(url);
    }
}

export async function kumpulkanFilePengguna(idPengguna) {
    const baris = await ambilBanyak(
        `SELECT avatar_url AS url FROM users WHERE id = $1
        UNION ALL SELECT file_url FROM artworks WHERE user_id = $1
        UNION ALL SELECT banner_url FROM challenges WHERE curator_id = $1`,
        [idPengguna]
    );
    return baris.map((b) => b.url).filter(Boolean);
}
