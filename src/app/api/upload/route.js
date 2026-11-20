    import { NextResponse } from "next/server";
    import { mkdir, writeFile } from "fs/promises";
    import path from "path";
    import { randomUUID } from "crypto";
    import { ambilSesi } from "@/lib/auth";

    const BATAS_UKURAN = { artworks: 5, banners: 5, avatars: 2 }; // dalam MB

    const PERAN_BOLEH = {
    artworks: ["member", "admin"],
    avatars: ["member", "curator", "admin"],
    banners: ["curator", "admin"],
    };

    function kenaliJenis(bytes) {
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return "gif";
    const kepala = String.fromCharCode(...bytes.slice(0, 4));
    const penanda = String.fromCharCode(...bytes.slice(8, 12));
    if (kepala === "RIFF" && penanda === "WEBP") return "webp";
    return null;
    }

    export async function POST(request) {
    const sesi = await ambilSesi();
    if (!sesi) {
        return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const berkas = formData.get("file");
        const jenis = formData.get("jenis");

        if (!PERAN_BOLEH[jenis]) {
        return NextResponse.json({ message: "Jenis unggahan tidak dikenal." }, { status: 400 });
        }
        if (!PERAN_BOLEH[jenis].includes(sesi.role)) {
        return NextResponse.json({ message: "Anda tidak memiliki akses untuk unggahan ini." }, { status: 403 });
        }
        if (!berkas || typeof berkas === "string") {
        return NextResponse.json({ message: "Pilih berkas gambar terlebih dahulu." }, { status: 400 });
        }

        const maksMB = BATAS_UKURAN[jenis];
        if (berkas.size > maksMB * 1024 * 1024) {
        return NextResponse.json({ message: "Ukuran berkas maksimal " + maksMB + " MB." }, { status: 400 });
        }

        const bytes = new Uint8Array(await berkas.arrayBuffer());
        const ekstensi = kenaliJenis(bytes);
        if (!ekstensi) {
        return NextResponse.json(
            { message: "Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." },
            { status: 400 }
        );
        }

        const namaBerkas = randomUUID() + "." + ekstensi;
        const folder = path.join(process.cwd(), "public", "uploads", jenis);
        await mkdir(folder, { recursive: true });
        await writeFile(path.join(folder, namaBerkas), bytes);

        return NextResponse.json(
        { message: "Gambar berhasil diunggah.", url: "/uploads/" + jenis + "/" + namaBerkas },
        { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Gagal mengunggah gambar." }, { status: 500 });
    }
    }
