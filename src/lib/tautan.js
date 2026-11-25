import { cekUrlOpsional } from "@/lib/validasi";

export const MAKS_TAUTAN = 10;

export function bacaTautan(teks) {
    let data;
    try {
        data = JSON.parse(teks || "[]");
    } catch {
        return [];
    }
    let daftar = [];
    if (Array.isArray(data)) {
        daftar = data.map((t) => ({ judul: t && t.judul, url: t && t.url }));
    } else if (data && typeof data === "object") {
        const labelLama = { instagram: "Instagram", behance: "Behance", website: "Situs Web" };
        daftar = Object.keys(labelLama).map((k) => ({ judul: labelLama[k], url: data[k] }));
    }
    return daftar.filter((t) => typeof t.judul === "string" && t.judul && typeof t.url === "string" && /^https?:\/\//i.test(t.url));
}

export function bacaTautanForm(formData) {
    const judul = formData.getAll("tautan_judul").map((v) => String(v).trim());
    const url = formData.getAll("tautan_url").map((v) => String(v).trim());
    const daftar = [];
    for (let i = 0; i < judul.length; i++) {
        if (!judul[i] && !url[i]) continue;
        if (!judul[i]) return { galat: "Tautan eksternal nomor " + (i + 1) + " belum diberi judul." };
        if (!url[i]) return { galat: "Tautan eksternal \"" + judul[i] + "\" belum diisi alamatnya." };
        if (judul[i].length > 30) return { galat: "Judul tautan maksimal 30 karakter." };
        if (url[i].length > 300) return { galat: "Alamat tautan maksimal 300 karakter." };
        const galatUrl = cekUrlOpsional(url[i], "Tautan \"" + judul[i] + "\"");
        if (galatUrl) return { galat: galatUrl };
        daftar.push({ judul: judul[i], url: url[i] });
    }
    if (daftar.length > MAKS_TAUTAN) return { galat: "Tautan eksternal maksimal " + MAKS_TAUTAN + " buah." };
    return { teks: JSON.stringify(daftar) };
}
