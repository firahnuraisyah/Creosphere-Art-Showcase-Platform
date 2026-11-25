import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Globe, PlusCircle, Trophy } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import GambarKarya from "@/components/ui/GambarKarya";
import KartuPotret from "@/components/ui/KartuPotret";
import TombolKembali from "@/components/layout/TombolKembali";
import { ambilBanyak, ambilSatu } from "@/lib/query";
import { ambilPengguna } from "@/lib/auth";
import { ubahKeId } from "@/lib/validasi";
import { hitungStatus, labelStatus } from "@/lib/challenge";
import { formatTanggal, formatAngka, formatAngkaSingkat } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const idAngka = ubahKeId(id);
    const c = idAngka ? await ambilSatu("SELECT title FROM challenges WHERE id = $1", [idAngka]) : null;
    return { title: c ? c.title : "Challenge" };
}

const kelasLencana = {
    aktif: "bg-emerald-500/90 text-white",
    belum_mulai: "bg-sky-500/90 text-white",
    berakhir: "bg-amber-500/90 text-white",
};

const labelLencana = { aktif: "Challenge Aktif", belum_mulai: "Segera Hadir", berakhir: "Challenge Selesai" };
const medali = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function DetailChallenge({ params }) {
    const { id } = await params;
    const idChallenge = ubahKeId(id);
    if (!idChallenge) notFound();

    const c = await ambilSatu(
        `SELECT ch.id, ch.title, ch.tagline, ch.description, ch.rules, ch.prize, ch.banner_url, ch.start_date, ch.end_date,
                ch.curator_id, u.display_name AS curator, u.avatar_url AS curator_avatar, u.affiliation, u.specialization, u.bio AS curator_bio
        FROM challenges ch JOIN users u ON u.id = ch.curator_id WHERE ch.id = $1`,
        [idChallenge]
    );
    if (!c) notFound();

    const status = hitungStatus(c.start_date, c.end_date);
    const pengguna = await ambilPengguna();

    const kategori = await ambilBanyak(
        `SELECT cat.name FROM challenge_categories cc JOIN categories cat ON cat.id = cc.category_id
        WHERE cc.challenge_id = $1 ORDER BY cat.name`,
        [idChallenge]
    );
    const submisi = await ambilBanyak(
        `SELECT s.id, a.id AS artwork_id, a.title, a.file_url, u.display_name AS artis, u.is_active
        FROM submissions s JOIN artworks a ON a.id = s.artwork_id JOIN users u ON u.id = s.user_id
        WHERE s.challenge_id = $1 ORDER BY a.created_at DESC`,
        [idChallenge]
    );
    const pemenang = await ambilBanyak(
        `SELECT w.rank, w.curator_note, a.id AS artwork_id, a.title, a.file_url, u.display_name AS artis, u.is_active,
                (SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS jumlah_like
        FROM winners w JOIN submissions s ON s.id = w.submission_id
        JOIN artworks a ON a.id = s.artwork_id JOIN users u ON u.id = s.user_id
        WHERE w.challenge_id = $1 ORDER BY w.rank ASC`,
        [idChallenge]
    );

    const daftarAturan = c.rules ? c.rules.split("\n").map((r) => r.trim()).filter(Boolean) : [];
    const daftarMedium = kategori.length > 0 ? kategori.map((k) => k.name).join(", ") : "Semua kategori";
    const dapatIkut = status === "aktif" && (!pengguna || pengguna.role === "member");

    return (
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-12 w-full">
        <TombolKembali bawaan={{ href: "/challenges", label: "Challenge" }} />
        <div className="bg-light-surface rounded-xl border border-light-outline-variant overflow-hidden shadow-sm">
            <div className="aspect-[16/6] bg-warm-cream relative overflow-hidden">
            <GambarKarya src={c.banner_url || "/images/placeholder-banner.svg"} alt={"Banner " + c.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex items-end p-6 md:p-10">
                <div className="text-white space-y-2">
                <span className={"px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm " + kelasLencana[status]}>{labelLencana[status]}</span>
                <h1 className="font-headline text-display-mobile md:text-headline-lg font-bold">{c.title}</h1>
                {c.tagline && <p className="text-body-md text-white/90 max-w-2xl">{c.tagline}</p>}
                </div>
            </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-light-outline-variant p-6 bg-warm-cream border-t border-light-outline-variant text-center">
            <div className="p-3">
                <span className="text-xs uppercase tracking-wider text-light-on-surface-variant block">Total Hadiah</span>
                <span className="font-headline text-2xl font-bold text-light-primary">{c.prize || "—"}</span>
            </div>
            <div className="p-3">
                <span className="text-xs uppercase tracking-wider text-light-on-surface-variant block">Batas Submisi</span>
                <span className="font-headline text-2xl font-bold text-light-on-surface">{formatTanggal(c.end_date)}</span>
            </div>
            <div className="p-3">
                <span className="text-xs uppercase tracking-wider text-light-on-surface-variant block">Submisi Diterima</span>
                <span className="font-headline text-2xl font-bold text-olive">{formatAngka(submisi.length)} Karya</span>
            </div>
            <div className="p-3">
                <span className="text-xs uppercase tracking-wider text-light-on-surface-variant block">Medium yang Diizinkan</span>
                <span className="font-headline text-lg md:text-2xl font-bold text-light-on-surface">{daftarMedium}</span>
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
            <section className="bg-light-surface rounded-xl border border-light-outline-variant p-6 space-y-4">
                <h2 className="font-headline text-title-lg font-bold text-light-on-surface">Pernyataan Kuratorial &amp; Tema</h2>
                <div className="text-body-md text-light-on-surface-variant space-y-3 leading-relaxed">
                {c.description ? c.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>) : <p>Deskripsi belum tersedia.</p>}
                </div>
            </section>

            <section className="bg-light-surface rounded-xl border border-light-outline-variant p-6 space-y-4">
                <h2 className="font-headline text-title-lg font-bold text-light-on-surface">Aturan Resmi Challenge</h2>
                <ul className="space-y-2.5 text-body-md text-light-on-surface-variant list-disc pl-5">
                <li><strong>Satu Submisi:</strong> Setiap Member terdaftar hanya dapat mengirim satu (1) karya dari portofolionya.</li>
                <li><strong>Penarikan:</strong> Member dapat menarik submisinya kapan saja sebelum batas waktu ({formatTanggal(c.end_date)}).</li>
                <li><strong>Kategori yang Diizinkan:</strong> {daftarMedium}.</li>
                {daftarAturan.map((r, i) => <li key={i}>{r}</li>)}
                <li><strong>Seleksi Juri:</strong> Setelah batas waktu berakhir, Curator menentukan hingga tiga (3) pemenang.</li>
                </ul>
            </section>

            {pemenang.length > 0 ? (
                <section className="space-y-4">
                <h2 className="font-headline text-title-lg font-bold text-light-on-surface flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-600" /> Para Pemenang
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8">
                    {pemenang.map((p) => (
                    <KartuPotret
                        key={p.rank}
                        href={"/artworks/" + p.artwork_id}
                        src={p.file_url}
                        alt={p.title + " oleh " + p.artis}
                        label={<>{medali[p.rank]} Juara {p.rank}</>}
                        nonaktif={!p.is_active}
                    >
                        <span className="font-label text-label-md text-outline truncate max-w-full">{p.artis}</span>
                        <span className="font-title text-title-md text-on-surface truncate max-w-full">{p.title}</span>
                        <span className="font-body text-body-sm text-on-surface-variant tabular-nums">
                        {Number(p.jumlah_like) > 0 ? "disukai oleh " + formatAngkaSingkat(p.jumlah_like) + " orang" : "belum ada yang menyukai"}
                        </span>
                        {p.curator_note && <span className="text-xs text-on-surface-variant mt-1 italic line-clamp-3">&ldquo;{p.curator_note}&rdquo;</span>}
                    </KartuPotret>
                    ))}
                </div>
                </section>
            ) : (
                <section className="bg-warm-cream rounded-xl border border-sand p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-light-surface border border-sand flex items-center justify-center mx-auto text-amber-700">
                    <Award className="w-5 h-5" />
                </div>
                <h3 className="font-headline text-title-lg font-bold text-light-on-surface">Pengumuman Pemenang</h3>
                <p className="text-body-sm text-light-on-surface-variant max-w-md mx-auto">
                    Pemenang akan dipublikasikan di sini oleh Curator setelah batas waktu challenge berakhir.
                </p>
                </section>
            )}
            </div>

            <div className="lg:col-span-4 space-y-6">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 space-y-4">
                <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-semibold block">Dikurasi oleh</span>
                <div className="flex items-center gap-3.5">
                <Avatar nama={c.curator} src={c.curator_avatar} ukuran="w-12 h-12" teks="font-headline text-lg font-bold" indeksWarna={1} />
                <div>
                    <h3 className="font-headline text-title-md font-bold text-light-on-surface">
                    <Link href={"/curators/" + c.curator_id} className="hover:underline">{c.curator}</Link>
                    </h3>
                    {(c.affiliation || c.specialization) && <p className="text-body-sm text-light-on-surface-variant">{c.affiliation || c.specialization}</p>}
                </div>
                </div>
                {c.curator_bio && <p className="text-body-sm text-light-on-surface-variant">{c.curator_bio}</p>}
                <div className="pt-2 border-t border-light-outline-variant flex items-center gap-3 text-body-sm text-light-on-surface-variant">
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Status: {labelStatus[status]}</span>
                </div>
            </div>

            {dapatIkut && (
                <div className="bg-light-primary-container/30 border border-light-primary/20 rounded-xl p-6 text-center space-y-3">
                <h4 className="font-headline text-title-lg font-bold text-light-on-surface">Siap berpartisipasi?</h4>
                <p className="text-body-sm text-light-on-surface-variant">Kirim karya dari portofolio Creosphere Anda sebelum batas waktu.</p>
                <Link href={"/challenges/" + c.id + "/submit"} className="w-full py-2.5 px-4 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 text-body-sm shadow-sm">
                    <span>Ikuti Challenge</span>
                    <PlusCircle className="w-4 h-4" />
                </Link>
                </div>
            )}
            </div>
        </div>

        <section className="space-y-6 pt-6 border-t border-light-outline-variant">
            <div>
            <h2 className="font-headline text-headline-md text-light-on-surface">Karya yang Dikirim ({formatAngka(submisi.length)})</h2>
            <p className="text-body-sm text-light-on-surface-variant">
                {status === "berakhir" ? "Karya yang diikutsertakan dalam challenge ini." : "Karya yang sedang ditinjau oleh Curator."}
            </p>
            </div>
            {submisi.length === 0 ? (
            <div className="bg-light-surface rounded-xl border border-dashed border-light-outline p-10 text-center text-body-sm text-light-on-surface-variant">
                Belum ada karya yang dikirim ke challenge ini.
            </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8">
                {submisi.map((s) => (
                <KartuPotret key={s.id} href={"/artworks/" + s.artwork_id} src={s.file_url} alt={s.title + " oleh " + s.artis} nonaktif={!s.is_active}>
                    <span className="font-title text-title-md text-on-surface truncate max-w-full">{s.title}</span>
                </KartuPotret>
                ))}
            </div>
            )}
        </section>
        </main>
    );
}
