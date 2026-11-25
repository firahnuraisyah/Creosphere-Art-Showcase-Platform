function keTanggal(nilai) {
    if (!nilai) return null;
    if (typeof nilai === "string" && /^\d{4}-\d{2}-\d{2}$/.test(nilai)) {
        return new Date(nilai + "T00:00:00");
    }
    return new Date(nilai);
}

export function formatTanggal(nilai) {
    const tanggal = keTanggal(nilai);
    if (!tanggal) return "-";
    return tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function formatTanggalPendek(nilai) {
    const tanggal = keTanggal(nilai);
    if (!tanggal) return "-";
    return tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function formatTahun(nilai) {
    const tanggal = keTanggal(nilai);
    if (!tanggal) return "-";
    return String(tanggal.getFullYear());
}

export function formatBulanTahun(nilai) {
    const tanggal = keTanggal(nilai);
    if (!tanggal) return "-";
    return tanggal.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

export function formatAngka(nilai) {
    return Number(nilai || 0).toLocaleString("id-ID");
}

export function formatAngkaSingkat(nilai) {
    const angka = Number(nilai || 0);
    if (angka < 10000) return formatAngka(angka);
    const satuan = [
        [1e12, "T"],
        [1e9, "B"],
        [1e6, "M"],
        [1e3, "k"],
    ];
    for (const [batas, huruf] of satuan) {
        if (angka >= batas) {
        const bulat = Math.floor((angka / batas) * 10) / 10;
        return String(bulat).replace(".", ",") + huruf;
        }
    }
    return formatAngka(angka);
}

export function inisial(nama) {
    if (!nama) return "?";
    const kata = nama.trim().split(/\s+/);
    const huruf = kata.length === 1 ? kata[0].slice(0, 2) : kata[0][0] + kata[kata.length - 1][0];
    return huruf.toUpperCase();
}

export function waktuRelatif(nilai) {
    const tanggal = keTanggal(nilai);
    if (!tanggal) return "";
    const selisihDetik = Math.floor((Date.now() - tanggal.getTime()) / 1000);
    if (selisihDetik < 60) return "baru saja";
    if (selisihDetik < 3600) return Math.floor(selisihDetik / 60) + " menit lalu";
    if (selisihDetik < 86400) return Math.floor(selisihDetik / 3600) + " jam lalu";
    if (selisihDetik < 86400 * 30) return Math.floor(selisihDetik / 86400) + " hari lalu";
    return formatTanggalPendek(tanggal);
}
