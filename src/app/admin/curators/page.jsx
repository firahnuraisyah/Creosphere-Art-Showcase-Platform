import { Check, UserCheck } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { ambilBanyak } from "@/lib/query";
import { formatTanggal } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
import { bacaTautan } from "@/lib/tautan";
import { setujuiCurator, tolakCurator } from "../actions";

export const metadata = { title: "Persetujuan Curator" };
export const dynamic = "force-dynamic";

export default async function PersetujuanCurator({ searchParams }) {
    await wajibPeran(["admin"]);
    const { galat, sukses } = await searchParams;

    const daftar = await ambilBanyak(
        `SELECT id, display_name, email, country, bio, external_links, avatar_url, created_at
        FROM users WHERE role = 'curator' AND status = 'pending' ORDER BY display_name ASC`
    );

    return (
        <div className="max-w-7xl space-y-8">
        <div className="pb-6 border-b border-light-outline-variant">
            <h1 className="font-headline text-headline-lg text-light-on-surface mb-2">Persetujuan Pendaftaran Curator</h1>
            <p className="text-body-md text-light-on-surface-variant">
            Curator harus disetujui administrator sebelum dapat mengakses fitur pembuatan challenge.
            </p>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        {daftar.length === 0 ? (
            <KeadaanKosong ikon={UserCheck} judul="Tidak ada pendaftaran yang menunggu" deskripsi="Pendaftaran curator baru akan muncul di sini untuk ditinjau." />
        ) : (
            <div className="space-y-6">
            {daftar.map((c) => {
                const tautan = bacaTautan(c.external_links);
                return (
                <article key={c.id} className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                    <Avatar nama={c.display_name} src={c.avatar_url} ukuran="w-14 h-14" teks="text-xl" indeksWarna={1} />
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-headline text-title-lg font-bold text-light-on-surface">{c.display_name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-warning border border-amber-200">Status: Menunggu</span>
                        </div>
                        <p className="text-body-sm text-light-on-surface-variant">
                        Email: <strong>{c.email}</strong>
                        {c.country && <> • Negara: {c.country}</>}
                        {tautan.length > 0 && <> • Tautan: {tautan.map((t) => t.judul + " (" + t.url + ")").join(", ")}</>}
                        {" "}• Mendaftar {formatTanggal(c.created_at)}
                        </p>
                        {c.bio && <p className="text-body-md text-light-on-surface-variant pt-1 max-w-2xl">&ldquo;{c.bio}&rdquo;</p>}
                    </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-center">
                    <TombolKonfirmasi
                        aksi={tolakCurator}
                        nilai={{ id: c.id }}
                        judulDialog="Tolak Curator?"
                        item={c.display_name}
                        pesan="Akun ditandai Ditolak dan pemiliknya hanya dapat menghapus akun."
                        teksAksi="Tolak"
                        className="px-4 py-2 rounded bg-rose-50 text-danger border border-rose-200 text-body-sm font-semibold hover:bg-rose-100 transition-colors"
                    >
                        Tolak
                    </TombolKonfirmasi>
                    <TombolKonfirmasi
                        aksi={setujuiCurator}
                        nilai={{ id: c.id }}
                        judulDialog="Setujui Curator?"
                        item={c.display_name}
                        pesan="Curator dapat langsung membuat challenge dan tampil di daftar publik."
                        teksAksi="Setujui"
                        bahaya={false}
                        className="px-5 py-2 rounded-DEFAULT bg-success text-on-success text-body-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        <Check className="w-4 h-4" />
                        <span>Setujui Curator</span>
                    </TombolKonfirmasi>
                    </div>
                </article>
                );
            })}
            </div>
        )}
        </div>
    );
}
