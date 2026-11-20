    import { ambilBanyak, ambilSatu } from "@/lib/query";
    import { ubahKeId } from "@/lib/validasi";

    export const KARYA_PER_HALAMAN = 12;

    export async function cariKarya({ q = "", kategori = "", urut = "terbaru", halaman = 1 }) {
    const params = [];
    const syarat = [];

    const kata = String(q).trim().slice(0, 100);
    if (kata) {
        params.push("%" + kata + "%");
        syarat.push("(a.title ILIKE $" + params.length + " OR u.display_name ILIKE $" + params.length + ")");
    }
    const idKategori = ubahKeId(kategori);
    if (idKategori) {
        params.push(idKategori);
        syarat.push("a.category_id = $" + params.length);
    }
    const where = syarat.length ? "WHERE " + syarat.join(" AND ") : "";

    const hitung = await ambilSatu(
        "SELECT COUNT(*) AS total FROM artworks a JOIN users u ON u.id = a.user_id " + where,
        params
    );
    const total = hitung ? hitung.total : 0;
    const totalHalaman = Math.max(1, Math.ceil(total / KARYA_PER_HALAMAN));
    const halamanAman = Math.min(Math.max(1, Number(halaman) || 1), totalHalaman);

    const urutan = urut === "populer" ? "jumlah_like DESC, a.created_at DESC" : "a.created_at DESC";
    const batas = params.length;
    const karya = await ambilBanyak(
        `SELECT a.id, a.title, a.file_url,
                CASE WHEN c.is_system AND a.artwork_type IS NOT NULL AND a.artwork_type <> ''
                    THEN c.name || ' (' || a.artwork_type || ')' ELSE c.name END AS kategori,
                u.display_name AS artis, u.avatar_url,
                (SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS jumlah_like
        FROM artworks a
        JOIN users u ON u.id = a.user_id
        JOIN categories c ON c.id = a.category_id
        ${where}
        ORDER BY ${urutan}
        LIMIT ${KARYA_PER_HALAMAN} OFFSET $${batas + 1}`,
        [...params, (halamanAman - 1) * KARYA_PER_HALAMAN]
    );

    return { karya, total, totalHalaman, halaman: halamanAman };
    }
