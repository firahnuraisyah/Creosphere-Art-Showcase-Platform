    import pool from "@/lib/db";

    export async function ambilBanyak(sql, params = []) {
    try {
        const { rows } = await pool.query(sql, params);
        return rows;
    } catch (error) {
        console.error("Query gagal:", error.message);
        return [];
    }
    }

    export async function ambilSatu(sql, params = []) {
    const rows = await ambilBanyak(sql, params);
    return rows[0] || null;
    }
