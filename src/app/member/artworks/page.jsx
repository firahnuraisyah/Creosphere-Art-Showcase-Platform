import Link from "next/link";
import { Eye, Edit3, Trash2, Palette } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { ambilBanyak } from "@/lib/query";
import { formatAngka, formatAngkaSingkat, formatTanggalPendek } from "@/lib/format";
import GambarKarya from "@/components/ui/GambarKarya";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
import { hapusKarya } from "./actions";

export const metadata = { title: "Karya Saya" };
export const dynamic = "force-dynamic";

export default async function HalamanKaryaSaya({ searchParams }) {
    const pengguna = await wajibPeran(["member"]);
    const { galat, sukses } = await searchParams;

    const karya = await ambilBanyak(
        `SELECT a.id, a.title, a.artwork_type, a.file_url, a.created_at, c.name AS kategori, c.is_system,
                (SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS jumlah_like
        FROM artworks a JOIN categories c ON c.id = a.category_id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC`,
        [pengguna.id]
    );

    return (
        <div className="max-w-7xl space-y-8">
        <div className="pb-6 border-b border-light-outline-variant">
            <h1 className="font-headline text-headline-lg text-light-on-surface">Edit Karya ({formatAngka(karya.length)})</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Kelola karya yang Anda unggah, ubah deskripsi dan tag, atau hapus karya.
            </p>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        {karya.length === 0 ? (
            <KeadaanKosong
            ikon={Palette}
            judul="Belum ada karya"
            deskripsi="Mulai bangun portofolio Anda melalui menu Unggah Karya di subnavbar."
            />
        ) : (
            <div className="bg-light-surface rounded-xl border border-light-outline-variant overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-warm-cream border-b border-light-outline-variant text-label-sm uppercase tracking-wider text-light-on-surface-variant">
                    <th className="p-4">Karya</th>
                    <th className="p-4">Kategori &amp; Jenis</th>
                    <th className="p-4">Suka</th>
                    <th className="p-4">Tanggal Unggah</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant text-body-sm">
                    {karya.map((item) => (
                    <tr key={item.id} className="hover:bg-warm-cream/40 transition-colors">
                        <td className="p-4">
                        <div className="flex items-center gap-3">
                            <GambarKarya src={item.file_url} alt={item.title} className="w-14 h-14 rounded object-cover border border-sand" />
                            <h4 className="font-headline text-title-md font-bold text-light-on-surface">{item.title}</h4>
                        </div>
                        </td>
                        <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-light-primary-container text-light-on-primary-container block w-fit mb-1">
                            {item.kategori}
                        </span>
                        <span className="text-xs text-light-on-surface-variant">{item.artwork_type || "-"}</span>
                        </td>
                        <td className="p-4 font-semibold text-terracotta">{formatAngkaSingkat(item.jumlah_like)}</td>
                        <td className="p-4 text-light-on-surface-variant">{formatTanggalPendek(item.created_at)}</td>
                        <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-success border border-emerald-200">
                            Terbit
                        </span>
                        </td>
                        <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Link href={"/artworks/" + item.id} className="p-2 text-light-on-surface-variant hover:text-light-on-surface" title="Lihat Halaman Publik">
                            <Eye className="w-4 h-4" />
                            </Link>
                            <Link href={"/member/artworks/" + item.id + "/edit"} className="p-2 text-light-primary hover:bg-light-primary-container rounded" title="Edit Karya">
                            <Edit3 className="w-4 h-4" />
                            </Link>
                            <TombolKonfirmasi
                            aksi={hapusKarya}
                            nilai={{ id: item.id }}
                            judulDialog="Hapus Karya?"
                            item={item.title}
                            pesan="Karya dihapus permanen beserta like, komentar, dan keikutsertaannya di challenge. Tindakan ini tidak dapat dibatalkan."
                            teksAksi="Hapus"
                            judul="Hapus Karya"
                            className="p-2 text-danger hover:bg-rose-50 rounded"
                            >
                            <Trash2 className="w-4 h-4" />
                            </TombolKonfirmasi>
                        </div>
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
