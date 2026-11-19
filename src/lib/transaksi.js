    import pool from "@/lib/db";

    // Menjalankan beberapa query sebagai satu transaksi (BEGIN ... COMMIT, ROLLBACK bila gagal),
    // seperti pola transaksi di modul. Fungsi "kerja" menerima koneksi (klien) dan
    // boleh melempar galat berpesan lewat galatPengguna("...").
    //
    //   const hasil = await jalankanTransaksi(async (klien) => { await klien.query(...); });
    //   if (!hasil.ok) kembaliGalat("/halaman", hasil.pesan);
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

    // Galat yang pesannya aman ditampilkan ke pengguna
    export function galatPengguna(pesan) {
    return Object.assign(new Error(pesan), { untukPengguna: true });
    }

    // Menjalankan satu query tulis (INSERT/UPDATE/DELETE). Mengembalikan { ok, rowCount, rows }.
    export async function jalankanQuery(sql, params = []) {
    try {
        const hasil = await pool.query(sql, params);
        return { ok: true, rowCount: hasil.rowCount, rows: hasil.rows };
    } catch (error) {
        console.error("Query gagal:", error.message);
        return { ok: false, rowCount: 0, rows: [], kode: error.code };
    }
    }
