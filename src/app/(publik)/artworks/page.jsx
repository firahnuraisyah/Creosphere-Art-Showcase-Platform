    import Link from "next/link";
    import { Search, ImageOff } from "lucide-react";
    import KartuKarya from "@/components/ui/KartuKarya";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";
    import Paginasi from "@/components/ui/Paginasi";
    import { ambilBanyak } from "@/lib/query";
    import { cariKarya, KARYA_PER_HALAMAN } from "@/lib/karya";

    export const metadata = { title: "Jelajahi Karya" };
    export const dynamic = "force-dynamic";

    const pilBase = "px-4 py-1.5 rounded-full text-label-sm font-medium whitespace-nowrap ";
    const pilAktif = pilBase + "bg-light-primary text-light-on-primary";
    const pilBiasa = pilBase + "bg-light-surface text-light-on-surface border border-light-outline-variant hover:bg-warm-cream";

    export default async function JelajahKarya({ searchParams }) {
    const sp = await searchParams;
    const q = typeof sp.q === "string" ? sp.q : "";
    const kategori = typeof sp.kategori === "string" ? sp.kategori : "";
    const urut = sp.urut === "populer" ? "populer" : "terbaru";

    const daftarKategori = await ambilBanyak("SELECT id, name FROM categories ORDER BY is_system ASC, name ASC");
    const hasil = await cariKarya({ q, kategori, urut, halaman: sp.page });

    const urlKategori = (id) => {
        const p = new URLSearchParams();
        if (q) p.set("q", q);
        if (urut !== "terbaru") p.set("urut", urut);
        if (id) p.set("kategori", id);
        const teks = p.toString();
        return teks ? "/artworks?" + teks : "/artworks";
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="mb-8 space-y-4">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface mb-2">Jelajahi Karya</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Nikmati karya orisinal. Penemuan karya tidak pernah difilter berdasarkan kebangsaan seniman.
            </p>
            </div>

            <form method="GET" action="/artworks" className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
            {kategori && <input type="hidden" name="kategori" value={kategori} />}
            <div className="relative flex-1 max-w-lg">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-on-surface-variant">
                <Search className="w-4 h-4" />
                </span>
                <input
                type="search" name="q" defaultValue={q} maxLength={100}
                placeholder="Cari berdasarkan judul karya atau nama seniman..."
                className="w-full pl-10 pr-4 py-2.5 rounded-DEFAULT bg-light-surface border border-light-outline text-light-on-surface placeholder:text-light-on-surface-variant/60 focus:border-light-primary focus:ring-1 focus:ring-light-primary text-body-md transition-colors"
                />
            </div>
            <div className="flex items-center gap-3 self-end md:self-auto">
                <label htmlFor="urut" className="text-body-sm text-light-on-surface-variant font-medium whitespace-nowrap">Urutkan:</label>
                <select id="urut" name="urut" defaultValue={urut} className="px-3 py-2 rounded-DEFAULT bg-light-surface border border-light-outline text-body-sm text-light-on-surface focus:border-light-primary focus:ring-light-primary">
                <option value="terbaru">Terbaru</option>
                <option value="populer">Terpopuler (Suka)</option>
                </select>
                <button type="submit" className="px-4 py-2 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-[#6e3522] transition-colors">
                Terapkan
                </button>
            </div>
            </form>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
            <Link href={urlKategori("")} className={kategori ? pilBiasa : pilAktif}>Semua Kategori</Link>
            {daftarKategori.map((k) => (
                <Link key={k.id} href={urlKategori(k.id)} className={String(k.id) === kategori ? pilAktif : pilBiasa}>
                {k.name}
                </Link>
            ))}
            </div>
        </div>

        {hasil.karya.length === 0 ? (
            <KeadaanKosong
            ikon={ImageOff}
            judul="Belum ada karya"
            deskripsi={q || kategori ? "Tidak ada karya yang cocok dengan pencarian Anda. Coba kata kunci atau kategori lain." : "Karya yang diunggah seniman akan tampil di galeri ini."}
            />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hasil.karya.map((k) => (
                <KartuKarya key={k.id} karya={k} />
            ))}
            </div>
        )}

        <Paginasi
            halaman={hasil.halaman}
            totalHalaman={hasil.totalHalaman}
            total={hasil.total}
            perHalaman={KARYA_PER_HALAMAN}
            path="/artworks"
            params={{ q, kategori, urut: urut === "populer" ? "populer" : "" }}
        />
        </main>
    );
    }
