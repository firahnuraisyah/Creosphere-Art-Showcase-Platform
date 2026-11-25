import pool from "@/lib/db";
import { bacaTeks, cekWajib, cekPanjang, bersihkanTag, ubahKeId } from "@/lib/validasi";

export async function periksaIsian(formData) {
    const judul = bacaTeks(formData, "title");
    const deskripsi = bacaTeks(formData, "description");
    const idKategori = ubahKeId(bacaTeks(formData, "category_id"));
    const jenis = bacaTeks(formData, "artwork_type");
    const tag = bersihkanTag(bacaTeks(formData, "tags"));

    const galat =
        cekWajib(judul, "Judul karya") ||
        cekPanjang(judul, 100, "Judul karya") ||
        cekWajib(deskripsi, "Deskripsi karya") ||
        cekPanjang(deskripsi, 2000, "Deskripsi karya") ||
        cekPanjang(jenis, 60, "Jenis karya") ||
        (!idKategori ? "Kategori wajib dipilih." : null) ||
        (tag.length < 1 ? "Minimal 1 tag wajib diisi." : null);
    if (galat) return { galat };

    const kategori = await pool.query("SELECT id, is_system FROM categories WHERE id = $1", [idKategori]);
    if (kategori.rows.length === 0) return { galat: "Kategori tidak ditemukan." };
    if (kategori.rows[0].is_system && !jenis) {
        return { galat: "Kategori Lainnya mewajibkan Anda menyebutkan jenis karya." };
    }
    return { data: { judul, deskripsi, idKategori, jenis: jenis || null, tag } };
}

export async function simpanTag(klien, idKarya, daftarTag) {
    await klien.query("DELETE FROM artwork_tags WHERE artwork_id = $1", [idKarya]);
    for (const nama of daftarTag) {
        const tagBaris = await klien.query(
        "INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
        [nama]
        );
        await klien.query("INSERT INTO artwork_tags (artwork_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
        idKarya,
        tagBaris.rows[0].id,
        ]);
    }
}

