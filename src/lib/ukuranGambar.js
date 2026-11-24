import fs from "fs";
import path from "path";

const cache = new Map();
const RASIO_CADANGAN = 0.8; 

function bacaUkuran(buf) {
  // PNG
    if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
        return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
    // GIF
    if (buf.length > 10 && buf.toString("ascii", 0, 3) === "GIF") {
        return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
    }
    // WebP
    if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
        const jenis = buf.toString("ascii", 12, 16);
        if (jenis === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
        if (jenis === "VP8L") {
        const b = buf.readUInt32LE(21);
        return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
        }
        if (jenis === "VP8X") return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
    }
    // JPEG: cari penanda SOF
    if (buf[0] === 0xff && buf[1] === 0xd8) {
        let i = 2;
        while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const penanda = buf[i + 1];
        if (penanda >= 0xc0 && penanda <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(penanda)) {
            return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        }
        i += 2 + buf.readUInt16BE(i + 2);
        }
    }
    return null;
}

export function rasioGambar(url) {
    if (!url || typeof url !== "string" || !url.startsWith("/") || url.includes("..")) return RASIO_CADANGAN;
    if (cache.has(url)) return cache.get(url);
    let rasio = RASIO_CADANGAN;
    try {
        const berkas = path.join(process.cwd(), "public", url);
        const fd = fs.openSync(berkas, "r");
        try {
        // Cukup kepala berkas; JPEG dengan metadata besar dibaca lebih panjang
        const buf = Buffer.alloc(262144);
        const n = fs.readSync(fd, buf, 0, buf.length, 0);
        const u = bacaUkuran(buf.subarray(0, n));
        if (u && u.w > 0 && u.h > 0) rasio = u.w / u.h;
        } finally {
        fs.closeSync(fd);
        }
    } catch {
        // berkas tidak ada: pakai rasio cadangan 
        return RASIO_CADANGAN;
    }
    cache.set(url, rasio);
    return rasio;
}

// Menambahkan properti rasio (lebar/tinggi) ke tiap karya.
export function denganRasio(daftar) {
    return daftar.map((k) => ({ ...k, rasio: rasioGambar(k.file_url) }));
}
