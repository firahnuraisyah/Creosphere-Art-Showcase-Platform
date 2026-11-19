    export const NAMA_COOKIE = "creosphere_sesi";
    const MASA_BERLAKU_DETIK = 60 * 60 * 24 * 7; // 7 hari

    function rahasia() {
    if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
    if (process.env.NODE_ENV === "production") {
        throw new Error("SESSION_SECRET belum diisi di .env.local");
    }
    return "rahasia-pengembangan-jangan-dipakai-di-produksi";
    }

    export const opsiCookie = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MASA_BERLAKU_DETIK,
    };

    function keBase64Url(biner) {
    return btoa(biner).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    function dariBase64Url(teks) {
    const biasa = teks.replace(/-/g, "+").replace(/_/g, "/");
    return atob(biasa + "=".repeat((4 - (biasa.length % 4)) % 4));
    }

    async function tandatangani(data) {
    const encoder = new TextEncoder();
    const kunci = await crypto.subtle.importKey(
        "raw",
        encoder.encode(rahasia()),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const hasil = await crypto.subtle.sign("HMAC", kunci, encoder.encode(data));
    return keBase64Url(String.fromCharCode(...new Uint8Array(hasil)));
    }

    export async function buatToken({ id, role }) {
    const payload = {
        id,
        role,
        exp: Math.floor(Date.now() / 1000) + MASA_BERLAKU_DETIK,
    };
    const data = keBase64Url(JSON.stringify(payload));
    const tanda = await tandatangani(data);
    return data + "." + tanda;
    }

    export async function bacaToken(token) {
    if (!token) return null;
    const [data, tanda] = token.split(".");
    if (!data || !tanda) return null;

    const tandaBenar = await tandatangani(data);
    if (tanda.length !== tandaBenar.length) return null;
    let selisih = 0;
    for (let i = 0; i < tanda.length; i++) {
        selisih |= tanda.charCodeAt(i) ^ tandaBenar.charCodeAt(i);
    }
    if (selisih !== 0) return null;

    try {
        const payload = JSON.parse(dariBase64Url(data));
        if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
        return { id: payload.id, role: payload.role };
    } catch {
        return null;
    }
    }
