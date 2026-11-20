    import Link from "next/link";
    import { ArrowRight, Trophy, CheckCircle, Globe, ChevronRight, Award, Heart, Calendar, Layers } from "lucide-react";
    import GambarKarya from "@/components/ui/GambarKarya";
    import { ambilBanyak, ambilSatu } from "@/lib/query";
    import { ikonKategori, kelasWarnaKategori } from "@/lib/kategori";
    import { formatTanggal, formatAngka } from "@/lib/format";
    import { hariIni } from "@/lib/challenge";

    export const dynamic = "force-dynamic";

    const warnaChip = ["text-terracotta", "text-olive", "text-light-on-surface-variant"];

    function KartuHero({ karya, rasio, indeks }) {
    const isi = (
        <>
        <div className={rasio + " bg-warm-cream overflow-hidden"}>
            <GambarKarya
            src={karya?.file_url}
            alt={karya?.title || "Karya segera hadir"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
        </div>
        <div className="p-3.5 bg-light-surface">
            <span className={"text-xs font-medium " + warnaChip[indeks % 3]}>{karya ? karya.kategori : "Segera hadir"}</span>
            <h3 className="font-headline text-title-md font-semibold text-light-on-surface truncate">
            {karya ? karya.title : "Karya pertama Anda"}
            </h3>
            <p className="text-xs text-light-on-surface-variant">{karya ? karya.artis : "Belum ada karya"}</p>
        </div>
        </>
    );
    const kelas = "group block rounded-lg overflow-hidden border border-light-outline-variant bg-light-surface shadow-sm hover:shadow-md transition-shadow";
    return karya ? (
        <Link href={"/artworks/" + karya.id} className={kelas}>{isi}</Link>
    ) : (
        <div className={kelas}>{isi}</div>
    );
    }

    const labelJuara = { 1: "Juara 1", 2: "Juara 2", 3: "Juara 3" };
    const kelasJuara = {
    1: { artikel: "border-2 border-amber-300", lencana: "px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-label-sm font-semibold" },
    2: { artikel: "border border-light-outline-variant", lencana: "px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 text-label-sm font-medium" },
    3: { artikel: "border border-light-outline-variant", lencana: "px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-label-sm font-medium" },
    };

    export default async function Beranda() {
    const tanggal = hariIni();

    const karyaTerbaru = await ambilBanyak(
        `SELECT a.id, a.title, a.file_url, c.name AS kategori, u.display_name AS artis
        FROM artworks a
        JOIN users u ON u.id = a.user_id
        JOIN categories c ON c.id = a.category_id
        ORDER BY a.created_at DESC LIMIT 3`
    );
    const jumlah = await ambilSatu("SELECT COUNT(*) AS total FROM artworks");
    const kategori = await ambilBanyak(
        `SELECT c.id, c.name, COUNT(a.id) AS jumlah
        FROM categories c LEFT JOIN artworks a ON a.category_id = c.id
        GROUP BY c.id, c.name, c.is_system
        ORDER BY c.is_system ASC, c.name ASC`
    );
    const pemenang = await ambilBanyak(
        `SELECT w.rank, a.id, a.title, a.file_url, u.display_name AS artis, ch.title AS challenge,
                (SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS jumlah_like
        FROM winners w
        JOIN submissions s ON s.id = w.submission_id
        JOIN artworks a ON a.id = s.artwork_id
        JOIN users u ON u.id = a.user_id
        JOIN challenges ch ON ch.id = w.challenge_id
        WHERE w.challenge_id = (
        SELECT challenge_id FROM winners ORDER BY created_at DESC LIMIT 1
        )
        ORDER BY w.rank ASC`
    );
    const challenge = await ambilSatu(
        `SELECT ch.id, ch.title, ch.tagline, ch.prize, ch.end_date, u.display_name AS curator,
                (SELECT COUNT(*) FROM submissions s WHERE s.challenge_id = ch.id) AS jumlah_submisi
        FROM challenges ch JOIN users u ON u.id = ch.curator_id
        WHERE ch.start_date <= $1 AND ch.end_date >= $1
        ORDER BY ch.end_date ASC LIMIT 1`,
        [tanggal]
    );

    const totalKarya = jumlah ? jumlah.total : 0;

    return (
        <main>
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm-cream border border-light-outline text-label-sm text-light-on-surface">
                <span className="w-2 h-2 rounded-full bg-terracotta"></span>
                <span>Ruang Global untuk Seni Visual</span>
                </div>
                <h1 className="font-headline text-display-mobile md:text-display text-light-on-surface text-balance leading-tight">
                Tempat jiwa kreatif berpameran tanpa batas.
                </h1>
                <p className="text-body-lg text-light-on-surface-variant max-w-prose text-pretty">
                Creosphere menghubungkan seniman independen, kurator yang cermat, dan para pencinta seni di seluruh dunia. Nikmati lukisan, gambar, karya serat, dan patung yang autentik.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/artworks" className="px-6 py-3 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-[#6e3522] transition-colors inline-flex items-center gap-2 shadow-sm">
                    <span>Jelajahi Galeri</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/challenges" className="px-6 py-3 rounded-DEFAULT bg-light-surface text-light-on-surface border border-light-outline text-label-lg font-medium hover:bg-warm-cream transition-colors inline-flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-olive" />
                    <span>Lihat Challenge Terbuka</span>
                </Link>
                </div>
                <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-light-on-surface-variant">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> Beragam Medium</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> Kanvas Pameran Netral</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> Paparan Setara untuk Seniman</span>
                </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                <KartuHero karya={karyaTerbaru[0]} rasio="aspect-[3/4]" indeks={0} />
                <div className="p-5 rounded-lg bg-warm-cream border border-light-outline flex items-center justify-between">
                    <div>
                    <span className="text-xs uppercase tracking-wider text-light-on-surface-variant">Pameran Saat Ini</span>
                    <h4 className="font-headline text-lg font-bold text-light-on-surface">{formatAngka(totalKarya)} Karya Global</h4>
                    </div>
                    <Globe className="w-8 h-8 text-olive" />
                </div>
                </div>
                <div className="space-y-4 pt-8">
                <KartuHero karya={karyaTerbaru[1]} rasio="aspect-[4/3]" indeks={1} />
                <KartuHero karya={karyaTerbaru[2]} rasio="aspect-[4/3]" indeks={2} />
                </div>
            </div>
            </div>
        </section>

        {/* Kategori */}
        <section className="border-t border-light-outline-variant bg-light-surface py-16">
            <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                <h2 className="font-headline text-headline-md text-light-on-surface mb-2">Jelajahi Menurut Kategori</h2>
                <p className="text-body-md text-light-on-surface-variant">
                    Klasifikasi terstruktur yang merayakan seni rupa, kerajinan tangan, dan media eksperimental.
                </p>
                </div>
                <Link href="/artworks" className="text-label-lg text-light-primary hover:underline flex items-center gap-1 font-medium">
                <span>Lihat semua di galeri</span>
                <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
            {kategori.length === 0 ? (
                <p className="text-body-sm text-light-on-surface-variant">Kategori belum tersedia.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                {kategori.map((k, i) => {
                    const Ikon = ikonKategori(k.name);
                    return (
                    <Link
                        key={k.id}
                        href={"/artworks?kategori=" + k.id}
                        className="p-5 rounded-md border border-light-outline-variant bg-light-background hover:bg-warm-cream hover:border-sand transition-all text-center group"
                    >
                        <div className={"w-12 h-12 rounded-full bg-light-surface border border-light-outline-variant flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform " + kelasWarnaKategori[i % kelasWarnaKategori.length]}>
                        <Ikon className="w-6 h-6" />
                        </div>
                        <h3 className="font-headline text-title-md font-semibold text-light-on-surface mb-1">{k.name}</h3>
                        <span className="text-body-sm text-light-on-surface-variant">{formatAngka(k.jumlah)} karya</span>
                    </Link>
                    );
                })}
                </div>
            )}
            </div>
        </section>

        {/* Karya unggulan: pemenang challenge */}
        <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex items-center justify-between mb-8 gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-700">Penghargaan Curator</span>
                </div>
                <h2 className="font-headline text-headline-md text-light-on-surface">Karya Unggulan — Pemenang Challenge</h2>
            </div>
            <Link href="/challenges" className="text-label-lg text-light-primary hover:underline flex items-center gap-1 font-medium whitespace-nowrap">
                <span>Lihat challenge sebelumnya</span>
                <ArrowRight className="w-4 h-4" />
            </Link>
            </div>
            {pemenang.length === 0 ? (
            <div className="bg-light-surface rounded-xl border border-dashed border-light-outline p-10 text-center text-body-sm text-light-on-surface-variant">
                Belum ada pemenang challenge. Karya unggulan akan tampil di sini setelah Curator menentukan pemenang.
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pemenang.map((p) => (
                <article key={p.id} className={"bg-light-surface rounded-md p-4 shadow-sm relative overflow-hidden group " + kelasJuara[p.rank].artikel}>
                    <span className={"absolute top-3 right-3 z-10 rounded-full flex items-center gap-1 " + kelasJuara[p.rank].lencana}>
                    {p.rank === 1 && <Trophy className="w-3.5 h-3.5 text-amber-700" />} {labelJuara[p.rank]}
                    </span>
                    <Link href={"/artworks/" + p.id} className="block aspect-[4/3] bg-warm-cream rounded overflow-hidden mb-3">
                    <GambarKarya src={p.file_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                    </Link>
                    <span className="text-xs text-light-on-surface-variant block mb-1">Challenge: {p.challenge}</span>
                    <h3 className="font-headline text-title-lg font-bold text-light-on-surface truncate">
                    <Link href={"/artworks/" + p.id} className="hover:text-light-primary">{p.title}</Link>
                    </h3>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-light-outline-variant text-body-sm">
                    <span className="text-light-on-surface-variant">Seniman: <strong>{p.artis}</strong></span>
                    <span className="flex items-center gap-1 text-terracotta"><Heart className="w-4 h-4" /> {p.jumlah_like}</span>
                    </div>
                </article>
                ))}
            </div>
            )}
        </section>

        {/* Challenge unggulan */}
        <section className="max-w-7xl mx-auto px-6 mb-16">
            <div className="rounded-xl bg-warm-cream border border-sand p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            {challenge ? (
                <>
                <div className="max-w-xl space-y-3">
                    <span className="px-3 py-1 rounded-full text-label-sm bg-light-secondary-container text-light-on-secondary-container border border-olive/20 font-medium inline-block">
                    Art Challenge Unggulan
                    </span>
                    <h2 className="font-headline text-headline-md text-light-on-surface">{challenge.title}</h2>
                    <p className="text-body-md text-light-on-surface-variant">
                    Diselenggarakan oleh {challenge.curator}.
                    {challenge.tagline ? " " + challenge.tagline : ""}
                    {challenge.prize ? " Hadiah: " + challenge.prize + "." : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-body-sm text-light-on-surface-variant">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-terracotta" /> Batas waktu: {formatTanggal(challenge.end_date)}</span>
                    <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-olive" /> {challenge.jumlah_submisi} submisi diterima</span>
                    </div>
                </div>
                <div>
                    <Link href={"/challenges/" + challenge.id} className="px-6 py-3 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-[#6e3522] transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap">
                    <span>Lihat Detail Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                </>
            ) : (
                <>
                <div className="max-w-xl space-y-3">
                    <span className="px-3 py-1 rounded-full text-label-sm bg-light-secondary-container text-light-on-secondary-container border border-olive/20 font-medium inline-block">
                    Art Challenge
                    </span>
                    <h2 className="font-headline text-headline-md text-light-on-surface">Belum ada challenge yang aktif</h2>
                    <p className="text-body-md text-light-on-surface-variant">
                    Challenge baru dari para Curator akan muncul di sini. Lihat daftar challenge untuk challenge yang akan datang maupun yang sudah selesai.
                    </p>
                </div>
                <div>
                    <Link href="/challenges" className="px-6 py-3 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-[#6e3522] transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap">
                    <span>Lihat Semua Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                </>
            )}
            </div>
        </section>
        </main>
    );
    }
