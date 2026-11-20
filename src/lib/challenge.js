    export const ZONA_WAKTU = "Asia/Makassar";

    export function hariIni(sekarang = new Date()) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_WAKTU }).format(sekarang);
    }

    export function hitungStatus(mulai, selesai, sekarang = new Date()) {
    const hari = hariIni(sekarang);
    if (hari < mulai) return "belum_mulai";
    if (hari > selesai) return "berakhir";
    return "aktif";
    }

    export const labelStatus = {
    belum_mulai: "Segera Hadir",
    aktif: "Aktif",
    berakhir: "Selesai",
    };

    export function sisaHari(selesai, sekarang = new Date()) {
    const akhir = new Date(selesai + "T00:00:00Z").getTime();
    const awal = new Date(hariIni(sekarang) + "T00:00:00Z").getTime();
    return Math.round((akhir - awal) / 86400000);
    }
