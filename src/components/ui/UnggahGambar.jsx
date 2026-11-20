    "use client";

    import { useState } from "react";
    import { ImagePlus, Loader2 } from "lucide-react";

    export default function UnggahGambar({
    nama,
    jenis,
    nilaiAwal = "",
    bentuk = "kotak",
    judul = "Klik untuk memilih gambar",
    bantuan = "Format: JPG, PNG, WebP, GIF.",
    tinggiPratinjau = "aspect-[4/3]",
    }) {
    const [url, setUrl] = useState(nilaiAwal);
    const [memuat, setMemuat] = useState(false);
    const [galat, setGalat] = useState("");

    async function pilihBerkas(e) {
        const berkas = e.target.files[0];
        if (!berkas) return;

        setMemuat(true);
        setGalat("");
        try {
        const data = new FormData();
        data.append("file", berkas);
        data.append("jenis", jenis);
        const respons = await fetch("/api/upload", { method: "POST", body: data });
        const hasil = await respons.json();
        if (!respons.ok) {
            setGalat(hasil.message);
        } else {
            setUrl(hasil.url);
        }
        } catch {
        setGalat("Gagal mengunggah gambar. Coba lagi.");
        }
        setMemuat(false);
        e.target.value = "";
    }

    const idInput = "unggah-" + nama;

    if (bentuk === "bulat") {
        return (
        <div className="flex items-center gap-6">
            <input type="hidden" name={nama} value={url} />
            {url ? (
            <img src={url} alt="Pratinjau foto profil" className="w-24 h-24 rounded-full object-cover border-2 border-sand" />
            ) : (
            <div className="w-24 h-24 rounded-full bg-warm-cream border-2 border-dashed border-sand flex items-center justify-center text-light-on-surface-variant">
                <ImagePlus className="w-6 h-6" />
            </div>
            )}
            <div className="space-y-2">
            <div className="flex items-center gap-3">
                <label
                htmlFor={idInput}
                className="px-4 py-2 rounded-DEFAULT bg-warm-cream border border-light-outline text-body-sm font-medium text-light-on-surface hover:bg-sand/30 transition-colors cursor-pointer"
                >
                {memuat ? "Mengunggah..." : "Ganti Foto"}
                </label>
                {url && (
                <button type="button" onClick={() => setUrl("")} className="px-4 py-2 rounded-DEFAULT text-body-sm text-danger hover:bg-rose-50 transition-colors">
                    Hapus
                </button>
                )}
            </div>
            <input id={idInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={pilihBerkas} className="sr-only" />
            <p className="text-xs text-light-on-surface-variant">{bantuan}</p>
            {galat && <p role="alert" className="text-xs text-danger">{galat}</p>}
            </div>
        </div>
        );
    }

    return (
        <div>
        <input type="hidden" name={nama} value={url} />
        <label
            htmlFor={idInput}
            className="block border-2 border-dashed border-light-outline rounded-lg p-8 text-center hover:border-light-primary hover:bg-warm-cream transition-colors cursor-pointer bg-light-background"
        >
            {url ? (
            <img src={url} alt="Pratinjau gambar" className={"mx-auto max-h-72 w-full object-contain rounded-md " + tinggiPratinjau} />
            ) : (
            <>
                <div className="w-12 h-12 rounded-full bg-light-primary-container text-light-primary flex items-center justify-center mx-auto mb-3">
                {memuat ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
                </div>
                <span className="font-headline text-title-md font-bold text-light-on-surface block">{judul}</span>
                <p className="text-body-sm text-light-on-surface-variant mt-1">{bantuan}</p>
            </>
            )}
        </label>
        <input id={idInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={pilihBerkas} className="sr-only" />
        {url && (
            <div className="mt-2 flex items-center gap-3 text-body-sm">
            <label htmlFor={idInput} className="text-light-primary font-medium hover:underline cursor-pointer">
                {memuat ? "Mengunggah..." : "Ganti gambar"}
            </label>
            <button type="button" onClick={() => setUrl("")} className="text-danger hover:underline">Hapus gambar</button>
            </div>
        )}
        {galat && <p role="alert" className="mt-2 text-body-sm text-danger">{galat}</p>}
        </div>
    );
    }
