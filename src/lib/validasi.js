    export function bacaTeks(formData, nama) {
    const nilai = formData.get(nama);
    return typeof nilai === "string" ? nilai.trim() : "";
    }

    export function cekWajib(nilai, namaField) {
    if (!nilai) return namaField + " wajib diisi.";
    return null;
    }

    export function cekPanjang(nilai, maks, namaField) {
    if (nilai && nilai.length > maks) return namaField + " maksimal " + maks + " karakter.";
    return null;
    }

    export function cekEmail(email) {
    if (!email) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Format email tidak valid.";
    if (email.length > 100) return "Email maksimal 100 karakter.";
    return null;
    }

    export function cekPassword(password) {
    if (!password) return "Kata sandi wajib diisi.";
    if (password.length < 8) return "Kata sandi minimal 8 karakter.";
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return "Kata sandi harus berisi huruf dan angka.";
    }
    if (password.length > 72) return "Kata sandi maksimal 72 karakter.";
    return null;
    }

    export function cekUrlOpsional(url, namaField) {
    if (!url) return null;
    try {
        const u = new URL(url);
        if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("protokol");
        return null;
    } catch {
        return namaField + " harus berupa URL yang valid (diawali http:// atau https://).";
    }
    }

    export function bersihkanTag(teks) {
    if (!teks) return [];
    const hasil = [];
    for (const potongan of teks.split(",")) {
        const tag = potongan.trim().replace(/^#+/, "").toLowerCase().slice(0, 30);
        if (tag && !hasil.includes(tag)) hasil.push(tag);
    }
    return hasil.slice(0, 10);
    }

    export function cekUrlUnggahan(url, jenis) {
    const pola = new RegExp("^/uploads/" + jenis + "/[a-f0-9-]{36}\\.(jpg|png|webp|gif)$");
    if (!url || !pola.test(url)) return "Berkas gambar tidak valid. Unggah ulang gambar Anda.";
    return null;
    }

    export function ubahKeId(nilai) {
    const angka = Number(nilai);
    return Number.isInteger(angka) && angka > 0 ? angka : null;
    }
