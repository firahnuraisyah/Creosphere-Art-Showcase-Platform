    import pool from "@/lib/db";

    // Menjalankan SELECT dan mengembalikan array baris.
    // Jika database belum tersambung / tabel belum ada, kembalikan array kosong
    // supaya halaman tetap tampil (dengan keadaan kosong) dan tidak error.
    export async function ambilBanyak(sql, params = []) {
    try {
        const { rows } = await pool.query(sql, params);
        return rows;
    } catch (error) {
        console.error("Query gagal:", error.message);
        return [];
    }
    }

    // Mengambil satu baris saja (atau null bila tidak ada).
    export async function ambilSatu(sql, params = []) {
    const rows = await ambilBanyak(sql, params);
    return rows[0] || null;
    }
