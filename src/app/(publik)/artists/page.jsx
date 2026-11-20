    import Link from "next/link";
    import { Search, ArrowRight, Users } from "lucide-react";
    import Avatar from "@/components/ui/Avatar";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";
    import Paginasi from "@/components/ui/Paginasi";
    import { ambilBanyak, ambilSatu } from "@/lib/query";
    import { formatAngka } from "@/lib/format";

    export const metadata = { title: "Temukan Seniman" };
    export const dynamic = "force-dynamic";

    const PER_HALAMAN = 12;

    export default async function TemukanSeniman({ searchParams }) {
    const sp = await searchParams;
    const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 50) : "";
    const pola = "%" + q + "%";

    const hitung = await ambilSatu(
        "SELECT COUNT(*) AS total FROM users WHERE role = 'member' AND display_name ILIKE $1",
        [pola]
    );
    const total = hitung ? hitung.total : 0;
    const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));
    const halaman = Math.min(Math.max(1, Number(sp.page) || 1), totalHalaman);

    const seniman = await ambilBanyak(
        `SELECT u.id, u.display_name, u.avatar_url, u.headline, u.bio,
                (SELECT COUNT(*) FROM artworks a WHERE a.user_id = u.id) AS jumlah_karya,
                (SELECT COUNT(*) FROM likes l JOIN artworks a ON a.id = l.artwork_id WHERE a.user_id = u.id) AS jumlah_like,
                (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id) AS jumlah_challenge
        FROM users u
        WHERE u.role = 'member' AND u.display_name ILIKE $1
        ORDER BY jumlah_like DESC, u.display_name ASC
        LIMIT ${PER_HALAMAN} OFFSET $2`,
        [pola, (halaman - 1) * PER_HALAMAN]
    );

    return (
        <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="mb-8 space-y-4">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface mb-2">Temukan Seniman</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Terhubung dengan pelukis, pematung, dan pengrajin tekstil dari komunitas global.
            </p>
            </div>
            <form method="GET" action="/artists" className="flex items-center justify-between gap-4 max-w-lg">
            <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-on-surface-variant">
                <Search className="w-4 h-4" />
                </span>
                <input type="search" name="q" defaultValue={q} maxLength={50} placeholder="Cari seniman berdasarkan nama tampilan..." className="w-full pl-10 pr-4 py-2.5 rounded-DEFAULT bg-light-surface border border-light-outline text-light-on-surface placeholder:text-light-on-surface-variant/60 focus:border-light-primary focus:ring-1 focus:ring-light-primary text-body-md" />
            </div>
            <button type="submit" className="px-4 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-[#6e3522] transition-colors">Cari</button>
            </form>
        </div>

        {seniman.length === 0 ? (
            <KeadaanKosong ikon={Users} judul="Belum ada seniman" deskripsi={q ? "Tidak ada seniman yang cocok dengan pencarian Anda." : "Seniman yang bergabung akan tampil di sini."} />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {seniman.map((s, i) => (
                <article key={s.id} className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm hover:border-sand transition-all flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                    <Avatar nama={s.display_name} src={s.avatar_url} ukuran="w-16 h-16" teks="text-xl font-headline font-bold" indeksWarna={i + 1} />
                    <div className="min-w-0">
                        <h3 className="font-headline text-title-lg font-bold text-light-on-surface truncate">{s.display_name}</h3>
                        {s.headline && <p className="text-body-sm text-light-on-surface-variant truncate">{s.headline}</p>}
                    </div>
                    </div>
                    <p className="text-body-sm text-light-on-surface-variant mb-4 line-clamp-2 min-h-10">{s.bio || "Belum ada bio."}</p>
                    <div className="flex items-center gap-4 text-xs text-light-on-surface-variant pb-4 border-b border-light-outline-variant">
                    <span><strong>{formatAngka(s.jumlah_karya)}</strong> Karya</span>
                    <span>•</span>
                    <span><strong>{formatAngka(s.jumlah_like)}</strong> Total Suka</span>
                    <span>•</span>
                    <span><strong>{formatAngka(s.jumlah_challenge)}</strong> Challenge</span>
                    </div>
                </div>
                <div className="pt-4">
                    <Link href={"/artists/" + s.id} className="w-full py-2 px-3 rounded-DEFAULT bg-warm-cream hover:bg-sand/30 border border-light-outline text-body-sm font-medium text-light-on-surface flex items-center justify-center gap-1.5 transition-colors">
                    <span>Lihat Profil Publik</span>
                    <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                </article>
            ))}
            </div>
        )}
        <Paginasi halaman={halaman} totalHalaman={totalHalaman} total={total} perHalaman={PER_HALAMAN} path="/artists" params={{ q }} satuan="seniman" />
        </main>
    );
    }
