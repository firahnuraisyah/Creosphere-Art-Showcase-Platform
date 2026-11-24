import Link from "next/link";
import { Plus, Edit3, Trophy } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { ambilBanyak } from "@/lib/query";
import { hitungStatus, sisaHari } from "@/lib/challenge";
import { formatTanggalPendek, formatAngka } from "@/lib/format";
import GambarKarya from "@/components/ui/GambarKarya";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
import LencanaStatus from "../_komponen/LencanaStatus";
import { hapusChallenge } from "../actions";

export const metadata = { title: "Challenge Saya" };
export const dynamic = "force-dynamic";

export default async function ChallengeSaya({ searchParams }) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });
    const { galat, sukses } = await searchParams;

    const daftar = await ambilBanyak(
        `SELECT c.id, c.title, c.prize, c.banner_url, c.start_date, c.end_date,
                (SELECT COUNT(*) FROM submissions s WHERE s.challenge_id = c.id) AS jumlah_submisi,
                (SELECT COUNT(*) FROM challenge_categories cc WHERE cc.challenge_id = c.id) AS jumlah_kategori,
                (SELECT COUNT(*) FROM winners w WHERE w.challenge_id = c.id) AS jumlah_pemenang
        FROM challenges c WHERE c.curator_id = $1 ORDER BY c.start_date DESC`,
        [pengguna.id]
    );

    return (
        <div className="max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-light-outline-variant">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Challenge yang Saya Buat ({daftar.length})</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Pantau status challenge, lihat karya yang masuk, dan pilih hingga 3 pemenang setelah challenge selesai.
            </p>
            </div>
            <Link href="/curator/challenges/new" className="px-5 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-primary-hover transition-colors text-body-sm shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Buat Challenge Baru</span>
            </Link>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        {daftar.length === 0 ? (
            <KeadaanKosong
            ikon={Trophy}
            judul="Belum ada challenge"
            deskripsi="Buat challenge pertama Anda untuk mengundang para seniman berkarya."
            tombol={{ teks: "Buat Challenge", href: "/curator/challenges/new" }}
            />
        ) : (
            <div className="bg-light-surface rounded-xl border border-light-outline-variant overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-warm-cream border-b border-light-outline-variant text-label-sm uppercase tracking-wider text-light-on-surface-variant">
                    <th className="p-4">Challenge</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Jadwal</th>
                    <th className="p-4">Submisi</th>
                    <th className="p-4">Hadiah</th>
                    <th className="p-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant text-body-sm">
                    {daftar.map((c) => {
                    const status = hitungStatus(c.start_date, c.end_date);
                    const sisa = sisaHari(c.end_date);
                    return (
                        <tr key={c.id} className="hover:bg-warm-cream/40 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                            <GambarKarya src={c.banner_url || "/images/placeholder-banner.svg"} alt={c.title} className="w-16 h-10 rounded object-cover" />
                            <div>
                            <h4 className="font-headline text-title-md font-bold text-light-on-surface">{c.title}</h4>
                            <span className="text-xs text-light-on-surface-variant">
                                {c.jumlah_kategori > 0 ? c.jumlah_kategori + " Kategori Diizinkan" : "Semua Kategori"}
                            </span>
                            </div>
                        </td>
                        <td className="p-4"><LencanaStatus status={status} /></td>
                        <td className="p-4 text-light-on-surface-variant">
                            <span>{formatTanggalPendek(c.start_date)} – {formatTanggalPendek(c.end_date)}</span>
                            {status === "aktif" && <span className="text-xs text-olive block mt-0.5 font-medium">{sisa} hari lagi</span>}
                            {status === "berakhir" && <span className="text-xs text-light-on-surface-variant block mt-0.5">Telah berakhir</span>}
                        </td>
                        <td className="p-4">
                            <Link href={"/curator/challenges/" + c.id + "/submissions"} className="text-light-primary font-bold hover:underline">
                            {formatAngka(c.jumlah_submisi)} karya
                            </Link>
                        </td>
                        <td className="p-4 font-semibold text-terracotta">{c.prize}</td>
                        <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                            {status === "berakhir" ? (
                                <Link href={"/curator/challenges/" + c.id + "/winners"} className="px-3 py-1.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-200" title="Pilih atau perbarui pemenang">
                                Pemenang ({c.jumlah_pemenang} Ditetapkan)
                                </Link>
                            ) : (
                                <Link href={"/curator/challenges/" + c.id + "/submissions"} className="px-3 py-1.5 rounded bg-warm-cream border border-light-outline text-xs font-medium hover:bg-sand/30" title="Kelola submisi">
                                Tinjau
                                </Link>
                            )}
                            <Link href={"/curator/challenges/" + c.id + "/edit"} className="p-1.5 text-light-on-surface-variant hover:text-light-on-surface" title="Ubah challenge">
                                <Edit3 className="w-4 h-4" />
                            </Link>
                            <TombolKonfirmasi
                                aksi={hapusChallenge}
                                nilai={{ id: c.id }}
                                judulDialog="Hapus Challenge?"
                                item={c.title}
                                pesan="Challenge dihapus permanen beserta semua submisi dan pemenangnya. Tindakan ini tidak dapat dibatalkan."
                                teksAksi="Hapus"
                                className="px-2 py-1.5 text-xs text-danger hover:bg-rose-50 rounded"
                                judul="Hapus challenge"
                            >
                                Hapus
                            </TombolKonfirmasi>
                            </div>
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </div>
            </div>
        )}
        </div>
    );
}
