    import Link from "next/link";
    import { Trash2, ShieldCheck } from "lucide-react";
    import { wajibPeran } from "@/lib/auth";
    import { ambilBanyak } from "@/lib/query";
    import { waktuRelatif } from "@/lib/format";
    import GambarKarya from "@/components/ui/GambarKarya";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
    import { abaikanLaporan, takeDownKarya } from "../actions";

    export const metadata = { title: "Moderasi Karya" };
    export const dynamic = "force-dynamic";

    export default async function Moderasi({ searchParams }) {
    await wajibPeran(["admin"]);
    const { galat, sukses } = await searchParams;

    const karya = await ambilBanyak(
        `SELECT a.id, a.title, a.file_url, u.display_name AS pemilik, c.name AS kategori,
                COUNT(r.id) AS jumlah_laporan, MAX(r.created_at) AS terakhir
        FROM reports r
        JOIN artworks a ON a.id = r.artwork_id
        JOIN users u ON u.id = a.user_id
        JOIN categories c ON c.id = a.category_id
        WHERE r.status = 'pending'
        GROUP BY a.id, a.title, a.file_url, u.display_name, c.name
        ORDER BY MAX(r.created_at) DESC`
    );
    const laporan = await ambilBanyak(
        `SELECT r.artwork_id, r.reason, r.note, r.created_at, p.display_name AS pelapor
        FROM reports r JOIN users p ON p.id = r.reporter_id
        WHERE r.status = 'pending' ORDER BY r.created_at DESC`
    );

    return (
        <div className="max-w-7xl space-y-8">
        <div className="pb-6 border-b border-light-outline-variant">
            <h1 className="font-headline text-headline-lg text-light-on-surface mb-2">Moderasi Karya yang Dilaporkan</h1>
            <p className="text-body-md text-light-on-surface-variant">
            Tinjau pengaduan dari member komunitas. &ldquo;Abaikan&rdquo; menutup laporan tanpa mengubah karya. &ldquo;Take Down&rdquo; menghapus karya secara permanen beserta like, komentar, favorit, dan submisi challenge-nya.
            </p>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        {karya.length === 0 ? (
            <KeadaanKosong ikon={ShieldCheck} judul="Antrean moderasi kosong" deskripsi="Belum ada laporan karya yang perlu ditinjau." />
        ) : (
            <div className="space-y-6">
            {karya.map((k) => {
                const catatan = laporan.filter((l) => l.artwork_id === k.id);
                return (
                <article key={k.id} className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm flex flex-col md:flex-row items-start gap-6">
                    <GambarKarya src={k.file_url} alt={k.title} className="w-32 h-32 rounded-lg object-cover border border-rose-200" />
                    <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-danger border border-rose-200">
                        Alasan: {catatan[0] ? catatan[0].reason : "-"}
                        {k.jumlah_laporan > 1 && " (+" + (k.jumlah_laporan - 1) + " laporan lain)"}
                        </span>
                        <span className="text-xs text-light-on-surface-variant">Dilaporkan {waktuRelatif(k.terakhir)}</span>
                    </div>
                    <h3 className="font-headline text-title-lg font-bold text-light-on-surface">Karya: &ldquo;{k.title}&rdquo;</h3>
                    <p className="text-body-sm text-light-on-surface-variant">
                        Diunggah oleh Member: <strong>{k.pemilik}</strong> • Kategori: {k.kategori} • {k.jumlah_laporan} laporan
                    </p>
                    {catatan.map((l, i) => (
                        <div key={i} className="p-3 bg-warm-cream rounded border border-sand text-body-sm text-light-on-surface-variant">
                        <strong className="text-light-on-surface">Catatan Pelapor ({l.pelapor}) — {l.reason}:</strong>
                        <p>{l.note ? "“" + l.note + "”" : "Tanpa catatan."}</p>
                        </div>
                    ))}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-light-outline-variant flex-wrap">
                        <Link href={"/artworks/" + k.id} className="px-4 py-2 rounded border border-light-outline text-body-sm hover:bg-warm-cream font-medium">
                        Lihat Karya Asli
                        </Link>
                        <TombolKonfirmasi
                        aksi={abaikanLaporan}
                        nilai={{ id: k.id }}
                        pesan="Abaikan laporan? Karya akan tetap tampil di galeri."
                        className="px-4 py-2 rounded bg-warm-cream border border-light-outline text-body-sm font-medium hover:bg-sand/30"
                        >
                        Abaikan Laporan
                        </TombolKonfirmasi>
                        <TombolKonfirmasi
                        aksi={takeDownKarya}
                        nilai={{ id: k.id }}
                        pesan="TINDAKAN PENTING: Jalankan Take Down? Karya akan dihapus permanen beserta like, komentar, dan entri challenge-nya."
                        className="px-4 py-2 rounded bg-danger text-on-danger text-body-sm font-bold hover:bg-red-700 shadow-sm flex items-center gap-1.5"
                        >
                        <Trash2 className="w-4 h-4" />
                        <span>Take Down Karya</span>
                        </TombolKonfirmasi>
                    </div>
                    </div>
                </article>
                );
            })}
            </div>
        )}
        </div>
    );
    }
