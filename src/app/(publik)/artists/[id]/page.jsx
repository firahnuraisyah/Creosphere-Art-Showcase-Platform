    import Link from "next/link";
    import { notFound } from "next/navigation";
    import { Globe, Calendar, AtSign, Palette, Link2, Heart } from "lucide-react";
    import Avatar from "@/components/ui/Avatar";
    import GambarKarya from "@/components/ui/GambarKarya";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";
    import { ambilBanyak, ambilSatu } from "@/lib/query";
    import { ubahKeId } from "@/lib/validasi";
    import { formatBulanTahun, formatAngka } from "@/lib/format";

    export const dynamic = "force-dynamic";

    export async function generateMetadata({ params }) {
    const { id } = await params;
    const idAngka = ubahKeId(id);
    const s = idAngka ? await ambilSatu("SELECT display_name FROM users WHERE id = $1 AND role = 'member'", [idAngka]) : null;
    return { title: s ? s.display_name : "Profil Seniman" };
    }

    function bacaTautan(teks) {
    try {
        const data = JSON.parse(teks || "{}");
        return data && typeof data === "object" ? data : {};
    } catch {
        return {};
    }
    }

    export default async function ProfilSeniman({ params }) {
    const { id } = await params;
    const idSeniman = ubahKeId(id);
    if (!idSeniman) notFound();

    const s = await ambilSatu(
        `SELECT id, display_name, avatar_url, headline, bio, country, external_links, created_at,
                (SELECT COUNT(*) FROM artworks a WHERE a.user_id = users.id) AS jumlah_karya,
                (SELECT COUNT(*) FROM likes l JOIN artworks a ON a.id = l.artwork_id WHERE a.user_id = users.id) AS jumlah_like,
                (SELECT COUNT(*) FROM submissions sb WHERE sb.user_id = users.id) AS jumlah_challenge
        FROM users WHERE id = $1 AND role = 'member'`,
        [idSeniman]
    );
    if (!s) notFound();

    const karya = await ambilBanyak(
        `SELECT a.id, a.title, a.file_url, a.created_at, c.name AS kategori,
                (SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS jumlah_like
        FROM artworks a JOIN categories c ON c.id = a.category_id
        WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
        [idSeniman]
    );
    const tautan = bacaTautan(s.external_links);
    const daftarTautan = [
        { kunci: "instagram", judul: "Instagram", Ikon: AtSign },
        { kunci: "behance", judul: "Behance", Ikon: Palette },
        { kunci: "website", judul: "Situs Pribadi", Ikon: Link2 },
    ].filter((t) => typeof tautan[t.kunci] === "string" && /^https?:\/\//.test(tautan[t.kunci]));

    return (
        <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="bg-light-surface rounded-xl border border-light-outline-variant p-8 md:p-10 shadow-sm mb-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-light-outline-variant">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar nama={s.display_name} src={s.avatar_url} ukuran="w-24 h-24 md:w-28 md:h-28" teks="text-3xl" />
                <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-headline text-headline-md font-bold text-light-on-surface">{s.display_name}</h1>
                    <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-success border border-emerald-200">Member Aktif</span>
                </div>
                {s.headline && <p className="text-body-md text-light-on-surface-variant">{s.headline}</p>}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-light-on-surface-variant pt-1">
                    {s.country && (
                    <>
                        <span className="flex items-center gap-1.5 font-medium text-light-on-surface">
                        <Globe className="w-4 h-4 text-olive" />
                        <span>Negara: {s.country}</span>
                        </span>
                        <span>•</span>
                    </>
                    )}
                    <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-terracotta" />
                    <span>Bergabung {formatBulanTahun(s.created_at)}</span>
                    </span>
                </div>
                </div>
            </div>
            {daftarTautan.length > 0 && (
                <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                {daftarTautan.map(({ kunci, judul, Ikon }) => (
                    <a key={kunci} href={tautan[kunci]} target="_blank" rel="noopener noreferrer" title={judul} className="p-2.5 rounded-DEFAULT bg-warm-cream border border-light-outline text-light-on-surface hover:text-light-primary hover:border-light-primary transition-colors">
                    <Ikon className="w-4 h-4" />
                    </a>
                ))}
                </div>
            )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
            <div className="md:col-span-8 text-body-md text-light-on-surface-variant space-y-3">
                {s.bio ? s.bio.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>) : <p>Seniman ini belum menulis bio.</p>}
            </div>
            <div className="md:col-span-4 grid grid-cols-3 gap-3 bg-warm-cream rounded-lg p-4 border border-sand text-center">
                <div>
                <span className="block font-headline text-2xl font-bold text-light-on-surface">{formatAngka(s.jumlah_karya)}</span>
                <span className="text-xs text-light-on-surface-variant">Karya</span>
                </div>
                <div>
                <span className="block font-headline text-2xl font-bold text-terracotta">{formatAngka(s.jumlah_like)}</span>
                <span className="text-xs text-light-on-surface-variant">Suka</span>
                </div>
                <div>
                <span className="block font-headline text-2xl font-bold text-olive">{formatAngka(s.jumlah_challenge)}</span>
                <span className="text-xs text-light-on-surface-variant">Challenge</span>
                </div>
            </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-light-outline-variant pb-4">
            <h2 className="font-headline text-headline-md text-light-on-surface">Karya Pameran ({karya.length})</h2>
            <div className="text-body-sm text-light-on-surface-variant">Menampilkan semua karya yang diunggah</div>
            </div>
            {karya.length === 0 ? (
            <KeadaanKosong judul="Belum ada karya" deskripsi="Seniman ini belum mengunggah karya." />
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {karya.map((k) => (
                <Link key={k.id} href={"/artworks/" + k.id} className="group block bg-light-surface rounded-md border border-light-outline-variant overflow-hidden hover:border-sand transition-all shadow-sm">
                    <div className="aspect-[4/3] bg-warm-cream overflow-hidden">
                    <GambarKarya src={k.file_url} alt={k.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                    </div>
                    <div className="p-3.5">
                    <span className="text-xs text-terracotta font-medium">{k.kategori}</span>
                    <h3 className="font-headline text-title-md font-semibold text-light-on-surface truncate">{k.title}</h3>
                    <div className="flex items-center justify-between text-xs text-light-on-surface-variant pt-2 mt-2 border-t border-light-outline-variant">
                        <span>{formatBulanTahun(k.created_at)}</span>
                        <span className="flex items-center gap-1 text-terracotta"><Heart className="w-3.5 h-3.5" /> {k.jumlah_like}</span>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
            )}
        </div>
        </main>
    );
    }
