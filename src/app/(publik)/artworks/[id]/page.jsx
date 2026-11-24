import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronRight, Heart, Bookmark, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import TombolKembali from "@/components/layout/TombolKembali";
import GambarKarya from "@/components/ui/GambarKarya";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import TombolKirim from "@/components/ui/TombolKirim";
import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
import ModalLapor from "@/components/karya/ModalLapor";
import PencatatTayang from "@/components/karya/PencatatTayang";
import { ambilBanyak, ambilSatu } from "@/lib/query";
import { ambilPengguna } from "@/lib/auth";
import { ubahKeId } from "@/lib/validasi";
import { formatTanggal, waktuRelatif } from "@/lib/format";
import { toggleSuka, toggleFavorit, tambahKomentar, hapusKomentar, laporKarya } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const idAngka = ubahKeId(id);
    const karya = idAngka ? await ambilSatu("SELECT title FROM artworks WHERE id = $1", [idAngka]) : null;
    return { title: karya ? karya.title : "Karya" };
}

export default async function DetailKarya({ params, searchParams }) {
    const { id } = await params;
    const { galat, sukses } = await searchParams;
    const idKarya = ubahKeId(id);
    if (!idKarya) notFound();

    const karya = await ambilSatu(
        `SELECT a.id, a.title, a.description, a.artwork_type, a.file_url, a.view_count, a.created_at, a.user_id,
                c.name AS kategori, c.is_system,
                u.display_name AS artis, u.is_active AS artis_aktif, u.avatar_url, u.headline, u.bio
        FROM artworks a
        JOIN users u ON u.id = a.user_id
        JOIN categories c ON c.id = a.category_id
        WHERE a.id = $1`,
        [idKarya]
    );
    if (!karya) notFound();

    const pengguna = await ambilPengguna();
    const tag = await ambilBanyak(
        "SELECT t.name FROM tags t JOIN artwork_tags at ON at.tag_id = t.id WHERE at.artwork_id = $1 ORDER BY t.name",
        [idKarya]
    );
    const komentar = await ambilBanyak(
        `SELECT cm.id, cm.body, cm.created_at, cm.user_id, u.display_name, u.avatar_url
        FROM comments cm JOIN users u ON u.id = cm.user_id
        WHERE cm.artwork_id = $1 ORDER BY cm.created_at DESC`,
        [idKarya]
    );
    const suka = await ambilSatu(
        `SELECT COUNT(*) AS jumlah, COALESCE(BOOL_OR(user_id = $2), false) AS saya
        FROM likes WHERE artwork_id = $1`,
        [idKarya, pengguna ? pengguna.id : 0]
    );
    const favorit = pengguna
        ? await ambilSatu("SELECT 1 AS ada FROM favorites WHERE user_id = $1 AND artwork_id = $2", [pengguna.id, idKarya])
        : null;
    const challenge = await ambilSatu(
        `SELECT ch.id, ch.title FROM submissions s JOIN challenges ch ON ch.id = s.challenge_id
        WHERE s.artwork_id = $1 ORDER BY s.created_at DESC LIMIT 1`,
        [idKarya]
    );

    const adalahMember = pengguna && pengguna.role === "member";
    const jenis = karya.is_system && karya.artwork_type ? karya.artwork_type : null;

    return (
        <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <PencatatTayang idKarya={karya.id} />
        <div className="mb-6"><TombolKembali bawaan={{ href: "/artworks", label: "Jelajahi" }} /></div>
        <div className="mb-6"><Pemberitahuan galat={galat} sukses={sukses} /></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-4">
            <div className="rounded-xl overflow-hidden bg-warm-cream border border-sand p-2 md:p-4 shadow-sm flex items-center justify-center">
                <GambarKarya src={karya.file_url} alt={karya.title + " oleh " + karya.artis} className="w-full max-h-[720px] object-contain rounded-lg shadow-sm" />
            </div>
            <div className="flex items-center justify-between text-body-sm text-light-on-surface-variant px-2">
                <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Dipublikasikan {formatTanggal(karya.created_at)}
                </span>
            </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-5">
                <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-light-primary-container text-light-on-primary-container">{karya.kategori}</span>
                    {jenis && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-warm-cream text-light-on-surface border border-light-outline">{jenis}</span>
                    )}
                </div>
                <h1 className="font-headline text-headline-md text-light-on-surface leading-snug">{karya.title}</h1>
                </div>
                {karya.description && (
                <div className="text-body-md text-light-on-surface-variant leading-relaxed space-y-3">
                    {karya.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
                </div>
                )}
                {tag.length > 0 && (
                <div>
                    <span className="text-label-sm uppercase tracking-wider text-light-on-surface-variant block mb-2 font-medium">Tag</span>
                    <div className="flex flex-wrap gap-1.5">
                    {tag.map((t) => (
                        <Link key={t.name} href={"/search?q=" + encodeURIComponent(t.name)} className="px-2.5 py-1 rounded bg-warm-cream hover:bg-sand/30 text-xs text-light-on-surface transition-colors">
                        #{t.name}
                        </Link>
                    ))}
                    </div>
                </div>
                )}
                
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-light-outline-variant">
                <form action={toggleSuka}>
                    <input type="hidden" name="artwork_id" value={karya.id} />
                    <button type="submit" className={"px-3 py-2 rounded-DEFAULT border text-label-lg font-medium transition-colors inline-flex items-center gap-1.5 " + (suka?.saya ? "bg-light-primary-container text-light-on-primary-container border-light-primary/30" : "bg-light-surface text-light-on-surface border-light-outline hover:bg-warm-cream")}>
                    <Heart className={"w-4 h-4 text-terracotta " + (suka?.saya ? "fill-current" : "")} /> {suka ? suka.jumlah : 0}
                    </button>
                </form>
                <form action={toggleFavorit}>
                    <input type="hidden" name="artwork_id" value={karya.id} />
                    <button type="submit" className={"px-3 py-2 rounded-DEFAULT border text-label-lg font-medium transition-colors inline-flex items-center gap-1.5 " + (favorit ? "bg-light-secondary-container text-light-on-secondary-container border-olive/30" : "bg-light-surface text-light-on-surface border-light-outline hover:bg-warm-cream")}>
                    <Bookmark className={"w-4 h-4 text-olive " + (favorit ? "fill-current" : "")} /> {favorit ? "Tersimpan" : "Favorit"}
                    </button>
                </form>
                <ModalLapor aksi={laporKarya} idKarya={karya.id} dapatLapor={Boolean(adalahMember)} />
                </div>
            </div>

            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
                <div className="flex items-center gap-3.5 mb-4">
                <Avatar nama={karya.artis} src={karya.avatar_url} ukuran="w-14 h-14" teks="text-lg" />
                <div>
                    <h3 className="font-headline text-title-lg font-bold text-light-on-surface">
                    <Link href={"/artists/" + karya.user_id} className="hover:underline underline-offset-4">{karya.artis}</Link>
                    </h3>
                    {!karya.artis_aktif && (
                    <span className="inline-flex mb-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-label-sm font-medium">Akun nonaktif</span>
                    )}
                    {karya.headline && <p className="text-body-sm text-light-on-surface-variant">{karya.headline}</p>}
                </div>
                </div>
                {karya.bio && <p className="text-body-sm text-light-on-surface-variant line-clamp-4">{karya.bio}</p>}
            </div>

            {challenge && (
                <div className="p-4 rounded-xl bg-light-secondary-container/40 border border-olive/20 flex items-center justify-between">
                <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-olive uppercase tracking-wider">Challenge Terkait</span>
                    <h4 className="font-headline text-title-md font-semibold text-light-on-surface">{challenge.title}</h4>
                </div>
                <Link href={"/challenges/" + challenge.id} className="p-2 rounded bg-light-surface border border-olive/30 text-olive hover:bg-light-secondary-container transition-colors" aria-label="Lihat challenge">
                    <ChevronRight className="w-5 h-5" />
                </Link>
                </div>
            )}
            </div>
        </div>

        <section id="komentar" className="max-w-4xl mt-16 pt-10 border-t border-light-outline-variant space-y-8">
            <div>
            <h2 className="font-headline text-headline-md text-light-on-surface mb-2">Apresiasi &amp; Komentar Komunitas ({komentar.length})</h2>
            <p className="text-body-sm text-light-on-surface-variant">Bagikan pengamatan yang bijak kepada seniman.</p>
            </div>

            {adalahMember ? (
            <form action={tambahKomentar} className="bg-light-surface rounded-xl border border-light-outline p-4 space-y-3">
                <input type="hidden" name="artwork_id" value={karya.id} />
                <textarea name="body" rows={3} required maxLength={500} placeholder={"Tulis komentar yang membangun atau apresiasi untuk " + karya.artis + "..."} className="w-full p-3 rounded-DEFAULT bg-light-background border border-light-outline text-body-md text-light-on-surface placeholder:text-light-on-surface-variant/50 focus:border-light-primary focus:ring-1 focus:ring-light-primary" />
                <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-light-on-surface-variant">Masuk sebagai <strong>{pengguna.display_name}</strong></span>
                <TombolKirim className="px-4 py-2 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-2" teksMemuat="Mengirim...">
                    Kirim Komentar
                </TombolKirim>
                </div>
            </form>
            ) : (
            <div className="bg-light-surface rounded-xl border border-light-outline p-4 text-body-sm text-light-on-surface-variant">
                {pengguna ? "Hanya akun Member yang dapat menulis komentar." : (
                <>
                    <Link href={"/login?next=/artworks/" + karya.id} className="text-light-primary font-medium hover:underline">Masuk</Link> sebagai Member untuk menyukai, menyimpan, dan berkomentar.
                </>
                )}
            </div>
            )}

            <div className="space-y-4">
            {komentar.length === 0 && <p className="text-body-sm text-light-on-surface-variant">Belum ada komentar. Jadilah yang pertama.</p>}
            {komentar.map((k, i) => (
                <div key={k.id} className="p-4 rounded-lg bg-light-surface border border-light-outline-variant">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                    <Avatar nama={k.display_name} src={k.avatar_url} ukuran="w-8 h-8" teks="text-xs" indeksWarna={i} />
                    <div>
                        <span className="text-title-md font-semibold text-light-on-surface">{k.display_name}</span>
                        <span className="text-xs text-light-on-surface-variant ml-2">{waktuRelatif(k.created_at)}</span>
                    </div>
                    </div>
                    {pengguna && pengguna.id === k.user_id && (
                    <TombolKonfirmasi aksi={hapusKomentar} nilai={{ artwork_id: karya.id, comment_id: k.id }} judulDialog="Hapus Komentar?" item={k.body.length > 80 ? k.body.slice(0, 80) + "…" : k.body} pesan="Komentar dihapus permanen." teksAksi="Hapus" judul="Hapus komentar" className="text-light-on-surface-variant hover:text-danger p-1">
                        <Trash2 className="w-4 h-4" />
                    </TombolKonfirmasi>
                    )}
                </div>
                <p className="text-body-md text-light-on-surface-variant whitespace-pre-line">{k.body}</p>
                </div>
            ))}
            </div>
        </section>
        </main>
    );
}
