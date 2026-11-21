    import Link from "next/link";
    import { Trophy, Images } from "lucide-react";
    import { notFound } from "next/navigation";
    import { wajibPeran } from "@/lib/auth";
    import { ambilSatu, ambilBanyak } from "@/lib/query";
    import { hitungStatus } from "@/lib/challenge";
    import { formatTanggal, formatAngka } from "@/lib/format";
    import { ubahKeId } from "@/lib/validasi";
    import GambarKarya from "@/components/ui/GambarKarya";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";

    export const metadata = { title: "Submisi Challenge" };
    export const dynamic = "force-dynamic";

    export default async function SubmisiChallenge({ params }) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });
    const { id: idTeks } = await params;
    const id = ubahKeId(idTeks);
    if (!id) notFound();

    const challenge = await ambilSatu(
        "SELECT id, title, start_date, end_date FROM challenges WHERE id = $1 AND curator_id = $2",
        [id, pengguna.id]
    );
    if (!challenge) notFound();

    const submisi = await ambilBanyak(
        `SELECT s.id, s.created_at, a.id AS id_karya, a.title, a.file_url, a.artwork_type,
                u.id AS id_seniman, u.display_name AS seniman, c.name AS kategori
        FROM submissions s
        JOIN artworks a ON a.id = s.artwork_id
        JOIN users u ON u.id = s.user_id
        JOIN categories c ON c.id = a.category_id
        WHERE s.challenge_id = $1
        ORDER BY s.created_at DESC`,
        [id]
    );
    const berakhir = hitungStatus(challenge.start_date, challenge.end_date) === "berakhir";

    return (
        <div className="max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-light-outline-variant">
            <div>
            <div className="flex items-center gap-2 text-xs text-light-on-surface-variant mb-1">
                <Link href="/curator/challenges" className="hover:underline">Challenge Saya</Link>
                <span>/</span>
                <span>{challenge.title}</span>
            </div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Submisi Challenge ({formatAngka(submisi.length)})</h1>
            </div>
            {berakhir ? (
            <Link href={"/curator/challenges/" + id + "/winners"} className="px-5 py-2.5 rounded-DEFAULT bg-amber-500 text-slate-900 font-semibold hover:bg-amber-600 transition-colors text-body-sm shadow-sm flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Lanjut Pilih Pemenang</span>
            </Link>
            ) : (
            <span className="text-body-sm text-light-on-surface-variant">Pemenang dapat dipilih setelah {formatTanggal(challenge.end_date)}.</span>
            )}
        </div>

        {submisi.length === 0 ? (
            <KeadaanKosong ikon={Images} judul="Belum ada submisi" deskripsi="Karya yang didaftarkan member ke challenge ini akan tampil di sini." />
        ) : (
            <div className="bg-light-surface rounded-xl border border-light-outline-variant overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-warm-cream border-b border-light-outline-variant text-label-sm uppercase tracking-wider text-light-on-surface-variant">
                    <th className="p-4">Pratinjau Karya</th>
                    <th className="p-4">Seniman</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Tanggal Submisi</th>
                    <th className="p-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant text-body-sm">
                    {submisi.map((s) => (
                    <tr key={s.id} className="hover:bg-warm-cream/30">
                        <td className="p-4 flex items-center gap-3">
                        <GambarKarya src={s.file_url} alt={s.title} className="w-14 h-14 rounded object-cover border border-sand" />
                        <div>
                            <h4 className="font-headline text-title-md font-bold text-light-on-surface">{s.title}</h4>
                            {s.artwork_type && <span className="text-xs text-light-on-surface-variant">{s.artwork_type}</span>}
                        </div>
                        </td>
                        <td className="p-4">
                        <Link href={"/artists/" + s.id_seniman} className="font-semibold text-light-on-surface hover:text-light-primary">{s.seniman}</Link>
                        </td>
                        <td className="p-4"><span className="px-2.5 py-0.5 rounded text-xs bg-warm-cream font-medium">{s.kategori}</span></td>
                        <td className="p-4 text-light-on-surface-variant">{formatTanggal(s.created_at)}</td>
                        <td className="p-4 text-right">
                        <Link href={"/artworks/" + s.id_karya} className="px-3 py-1.5 rounded border border-light-outline hover:bg-warm-cream text-xs font-medium">
                            Lihat Karya
                        </Link>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        )}
        </div>
    );
    }
