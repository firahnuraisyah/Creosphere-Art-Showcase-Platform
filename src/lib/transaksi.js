    import pool from "@/lib/db";

    export async function jalankanTransaksi(kerja) {
    let klien;
    try {
        klien = await pool.connect();
        await klien.query("BEGIN");
        const hasil = await kerja(klien);
        await klien.query("COMMIT");
        return { ok: true, hasil };
    } catch (error) {
        if (klien) await klien.query("ROLLBACK").catch(() => {});
        console.error("Transaksi gagal:", error.message);
        return {
        ok: false,
        pesan: error.untukPengguna ? error.message : "Terjadi kesalahan pada database. Coba lagi nanti.",
        };
    } finally {
        if (klien) klien.release();
    }
    }

    export function galatPengguna(pesan) {
    return Object.assign(new Error(pesan), { untukPengguna: true });
    }

    export async function jalankanQuery(sql, params = []) {
    try {
        const hasil = await pool.query(sql, params);
        return { ok: true, rowCount: hasil.rowCount, rows: hasil.rows };
    } catch (error) {
        console.error("Query gagal:", error.message);
        return { ok: false, rowCount: 0, rows: [], kode: error.code };
    }
    }
