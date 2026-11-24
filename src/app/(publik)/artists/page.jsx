import Link from "next/link";
import { Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import { ambilBanyak } from "@/lib/query";
import { formatAngka } from "@/lib/format";

export const metadata = { title: "Komunitas" };
export const dynamic = "force-dynamic";

const chip = "inline-flex items-center gap-1.5 h-9 px-4 rounded-full font-label text-label-lg shrink-0 transition-colors duration-state-change ";
const chipAktif = chip + "bg-primary text-on-primary";
const chipBiasa = chip + "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container";

export default async function Komunitas({ searchParams }) {
    const sp = await searchParams;
    const tabCurator = sp.peran === "curator";
    const syarat = tabCurator ? "u.role = 'curator' AND u.status = 'approved'" : "u.role = 'member'";

    const daftar = tabCurator
        ? await ambilBanyak(
            `SELECT u.id, u.display_name, u.is_active, u.avatar_url, u.headline, u.bio, u.affiliation,
                    (SELECT COUNT(*) FROM challenges ch WHERE ch.curator_id = u.id) AS jumlah_challenge,
                    (SELECT COUNT(*) FROM submissions s JOIN challenges ch ON ch.id = s.challenge_id WHERE ch.curator_id = u.id) AS jumlah_submisi
            FROM users u
            WHERE ${syarat}
            ORDER BY LOWER(u.display_name) ASC
            `
        )
        : await ambilBanyak(
            `SELECT u.id, u.display_name, u.is_active, u.avatar_url, u.headline, u.bio,
                    (SELECT COUNT(*) FROM artworks a WHERE a.user_id = u.id) AS jumlah_karya,
                    (SELECT COUNT(*) FROM likes l JOIN artworks a ON a.id = l.artwork_id WHERE a.user_id = u.id) AS jumlah_like,
                    (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id) AS jumlah_challenge
            FROM users u
            WHERE ${syarat}
            ORDER BY LOWER(u.display_name) ASC
            `
        );

    return (
        <main className="flex-1 bg-surface">
        <section aria-label="Judul halaman" className="bg-surface/95 border-b border-outline-variant">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
                <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface">Komunitas Creosphere</h1>
                <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
                {tabCurator
                    ? "Kenali para Curator yang menyelenggarakan challenge dan memilih karya terbaik."
                    : "Terhubung dengan pelukis, pematung, dan pengrajin tekstil dari komunitas global."}
                </p>
            </div>
            <div className="flex items-center gap-2" aria-label="Pilih daftar">
                <Link href="/artists" aria-current={!tabCurator ? "true" : undefined} className={!tabCurator ? chipAktif : chipBiasa}>Seniman</Link>
                <Link href="/artists?peran=curator" aria-current={tabCurator ? "true" : undefined} className={tabCurator ? chipAktif : chipBiasa}>Curator</Link>
            </div>
            </div>
        </section>

        <section aria-label={tabCurator ? "Daftar curator" : "Daftar seniman"} className="py-10 lg:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {daftar.length === 0 ? (
                <KeadaanKosong
                ikon={Users}
                judul={tabCurator ? "Belum ada Curator" : "Belum ada seniman"}
                deskripsi={tabCurator ? "Curator yang sudah disetujui Admin akan tampil di sini." : "Seniman yang bergabung akan tampil di sini."}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {daftar.map((s, i) => (
                    <Link
                    key={s.id}
                    href={(tabCurator ? "/curators/" : "/artists/") + s.id}
                    className="group flex items-start gap-5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                    <Avatar nama={s.display_name} src={s.avatar_url} ukuran="w-20 h-20 sm:w-24 sm:h-24 shrink-0" teks="text-2xl" indeksWarna={i + 1} />
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <h2 className="font-headline text-title-lg text-on-surface truncate group-hover:underline">{s.display_name}</h2>
                        {!s.is_active && (
                        <span className="self-start px-2 py-0.5 rounded-full bg-slate-900 text-white text-label-sm font-medium">Akun nonaktif</span>
                        )}
                        {(s.headline || s.affiliation) && (
                        <p className="font-body text-body-md text-outline truncate">{s.headline || s.affiliation}</p>
                        )}
                        <p className="font-body text-body-sm text-on-surface-variant line-clamp-2">{s.bio || "Belum ada bio."}</p>
                        <p className="font-label text-label-md text-outline tabular-nums pt-1">
                        {tabCurator
                            ? formatAngka(s.jumlah_challenge) + " challenge · " + formatAngka(s.jumlah_submisi) + " submisi diterima"
                            : formatAngka(s.jumlah_karya) + " karya · " + formatAngka(s.jumlah_like) + " suka · " + formatAngka(s.jumlah_challenge) + " challenge"}
                        </p>
                    </div>
                    </Link>
                ))}
                </div>
            )}
            </div>
        </section>
        </main>
    );
}
