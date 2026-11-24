import Link from "next/link";
import { Plus } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { ambilBanyak } from "@/lib/query";
import { formatAngka } from "@/lib/format";
import { kelasInput } from "@/lib/gaya";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import TombolKirim from "@/components/ui/TombolKirim";
import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
import { tambahKategori, ubahKategori, hapusKategori } from "../actions";

export const metadata = { title: "Manajemen Kategori" };
export const dynamic = "force-dynamic";

export default async function ManajemenKategori({ searchParams }) {
    await wajibPeran(["admin"]);
    const { galat, sukses, tambah, edit } = await searchParams;
    const idEdit = Number(edit) || 0;

    const daftar = await ambilBanyak(
        `SELECT c.id, c.name, c.is_system,
                (SELECT COUNT(*) FROM artworks a WHERE a.category_id = c.id) AS jumlah_karya,
                (SELECT COUNT(*) FROM challenge_categories cc WHERE cc.category_id = c.id) AS jumlah_challenge
        FROM categories c ORDER BY c.is_system, c.name`
    );

    return (
        <div className="max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-light-outline-variant">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Manajemen Kategori Karya</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Kelola enam medium seni utama dan kategori &ldquo;Lainnya&rdquo; yang dilindungi sistem.
            </p>
            </div>
            <Link href="/admin/categories?tambah=1" className="px-5 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-primary-hover transition-colors text-body-sm shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
            </Link>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        {tambah && (
            <form action={tambahKategori} className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
                <label htmlFor="name" className="block text-label-lg text-light-on-surface font-medium mb-1.5">Nama Kategori Baru</label>
                <input type="text" id="name" name="name" required maxLength={50} placeholder="mis. Fotografi" className={kelasInput} />
            </div>
            <div className="flex items-center gap-3">
                <Link href="/admin/categories" className="px-5 py-2.5 rounded border border-light-outline text-body-sm font-medium hover:bg-warm-cream">Batal</Link>
                <TombolKirim className="px-5 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-primary-hover text-body-sm shadow-sm">
                Simpan
                </TombolKirim>
            </div>
            </form>
        )}

        <div className="bg-light-surface rounded-xl border border-light-outline-variant overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-warm-cream border-b border-light-outline-variant text-label-sm uppercase tracking-wider text-light-on-surface-variant">
                    <th className="p-4">Nama Kategori</th>
                    <th className="p-4">Jenis Kategori</th>
                    <th className="p-4">Karya Aktif</th>
                    <th className="p-4">Challenge Terkait</th>
                    <th className="p-4 text-right">Aksi</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant text-body-sm">
                {daftar.length === 0 && (
                    <tr>
                    <td colSpan={5} className="p-8 text-center text-light-on-surface-variant">Belum ada kategori. Tambahkan kategori pertama Anda.</td>
                    </tr>
                )}
                {daftar.map((k) => {
                    const dipakai = k.jumlah_karya > 0;
                    if (k.is_system) {
                    return (
                        <tr key={k.id} className="bg-amber-50/50 hover:bg-amber-50">
                        <td className="p-4 font-semibold text-light-on-surface">{k.name}</td>
                        <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Wajib Sistem</span>
                        </td>
                        <td className="p-4">{formatAngka(k.jumlah_karya)} karya</td>
                        <td className="p-4">{formatAngka(k.jumlah_challenge)} challenge</td>
                        <td className="p-4 text-right"><span className="text-xs text-light-on-surface-variant italic">Dikunci oleh sistem</span></td>
                        </tr>
                    );
                    }
                    return (
                    <tr key={k.id} className="hover:bg-warm-cream/30">
                        <td className="p-4 font-semibold text-light-on-surface">
                        {idEdit === k.id ? (
                            <form action={ubahKategori} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={k.id} />
                            <input type="text" name="name" required maxLength={50} defaultValue={k.name} className={kelasInput} />
                            <TombolKirim className="px-3 py-2 rounded-DEFAULT bg-light-primary text-light-on-primary text-xs font-medium hover:bg-primary-hover" teksMemuat="...">Simpan</TombolKirim>
                            <Link href="/admin/categories" className="px-3 py-2 text-xs text-light-on-surface-variant hover:underline">Batal</Link>
                            </form>
                        ) : (
                            <span>{k.name}</span>
                        )}
                        </td>
                        <td className="p-4"><span className="px-2 py-0.5 rounded text-xs bg-warm-cream">Standar</span></td>
                        <td className="p-4">{formatAngka(k.jumlah_karya)} karya</td>
                        <td className="p-4">{formatAngka(k.jumlah_challenge)} challenge</td>
                        <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                            <Link href={"/admin/categories?edit=" + k.id} className="px-2.5 py-1 text-xs text-light-primary hover:underline">Ubah</Link>
                            {dipakai ? (
                            <span className="px-2.5 py-1 text-xs text-light-on-surface-variant/40 cursor-not-allowed" title="Kategori yang dipakai karya tidak dapat dihapus">Hapus</span>
                            ) : (
                            <TombolKonfirmasi
                                aksi={hapusKategori}
                                nilai={{ id: k.id }}
                                judulDialog="Hapus Kategori?"
                                item={k.name}
                                pesan="Kategori dihapus permanen. Hanya kategori yang belum dipakai karya yang dapat dihapus."
                                teksAksi="Hapus"
                                className="px-2.5 py-1 text-xs text-danger hover:underline"
                            >
                                Hapus
                            </TombolKonfirmasi>
                            )}
                        </div>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
}
