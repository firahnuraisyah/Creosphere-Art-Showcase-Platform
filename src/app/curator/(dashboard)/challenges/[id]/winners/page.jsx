import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Trophy, Check, Info, Hourglass } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { ambilSatu, ambilBanyak } from "@/lib/query";
import { hitungStatus } from "@/lib/challenge";
import { formatTanggal } from "@/lib/format";
import { ubahKeId } from "@/lib/validasi";
import { kelasInput } from "@/lib/gaya";
import GambarKarya from "@/components/ui/GambarKarya";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import TombolKirim from "@/components/ui/TombolKirim";
import { simpanPemenang } from "../../../actions";

export const metadata = { title: "Pilih Pemenang" };
export const dynamic = "force-dynamic";

const PERINGKAT = [
    {
        nomor: 1,
        kartu: "bg-light-surface rounded-xl border-2 border-amber-300 p-6 shadow-sm space-y-4",
        lencana: "px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1",
        judul: "Juara 1",
        ket: "Penghargaan Tertinggi",
        ikon: true,
        foto: "border-amber-300",
        batas: "border-sand",
    },
    {
        nomor: 2,
        kartu: "bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4",
        lencana: "px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold",
        judul: "Juara 2",
        foto: "border-sand",
        batas: "border-light-outline-variant",
    },
    {
        nomor: 3,
        kartu: "bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4",
        lencana: "px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold",
        judul: "Juara 3",
        foto: "border-sand",
        batas: "border-light-outline-variant",
    },
    ];

    export default async function PilihPemenang({ params, searchParams }) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });
    const { id: idTeks } = await params;
    const { galat, sukses } = await searchParams;
    const id = ubahKeId(idTeks);
    if (!id) notFound();

    const challenge = await ambilSatu(
        "SELECT id, title, start_date, end_date FROM challenges WHERE id = $1 AND curator_id = $2",
        [id, pengguna.id]
    );
    if (!challenge) notFound();

    const berakhir = hitungStatus(challenge.start_date, challenge.end_date) === "berakhir";

    const submisi = await ambilBanyak(
        `SELECT s.id, a.title, a.file_url, u.display_name AS seniman, c.name AS kategori
        FROM submissions s
        JOIN artworks a ON a.id = s.artwork_id
        JOIN users u ON u.id = s.user_id
        JOIN categories c ON c.id = a.category_id
        WHERE s.challenge_id = $1 ORDER BY a.created_at DESC`,
        [id]
    );
    const pemenang = await ambilBanyak(
        "SELECT submission_id, rank, curator_note FROM winners WHERE challenge_id = $1",
        [id]
    );
    const menurutPeringkat = {};
    pemenang.forEach((w) => (menurutPeringkat[w.rank] = w));
    const menurutId = {};
    submisi.forEach((s) => (menurutId[s.id] = s));

    return (
        <div className="max-w-5xl space-y-8">
        <div className="pb-6 border-b border-light-outline-variant">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 inline-flex items-center gap-1.5 mb-2">
            <Award className="w-4 h-4 text-amber-700" />
            <span>Juri Penutup Challenge</span>
            </span>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Pilih Pemenang: {challenge.title}</h1>
            <p className="text-body-md text-light-on-surface-variant">
            Pilih maksimal tiga (3) pemenang (Juara 1, 2, dan 3). Setiap peringkat harus unik dan satu karya hanya menempati satu peringkat.
            </p>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        {!berakhir ? (
            <KeadaanKosong
            ikon={Hourglass}
            judul="Challenge belum berakhir"
            deskripsi={"Pemenang baru dapat dipilih setelah tenggat " + formatTanggal(challenge.end_date) + " terlewati."}
            tombol={{ teks: "Kembali ke Challenge Saya", href: "/curator/challenges" }}
            />
        ) : submisi.length === 0 ? (
            <KeadaanKosong ikon={Trophy} judul="Tidak ada submisi" deskripsi="Challenge ini tidak memiliki karya yang dapat dipilih sebagai pemenang." />
        ) : (
            <form action={simpanPemenang} className="space-y-8">
            <input type="hidden" name="id" value={id} />

            {PERINGKAT.map((p) => {
                const saatIni = menurutPeringkat[p.nomor];
                const karya = saatIni ? menurutId[saatIni.submission_id] : null;
                return (
                <div key={p.nomor} className={p.kartu}>
                    <div className="flex items-center justify-between">
                    <span className={p.lencana}>
                        {p.ikon && <Trophy className="w-4 h-4 text-amber-700" />} {p.judul}
                    </span>
                    {p.ket && <span className="text-xs text-light-on-surface-variant">{p.ket}</span>}
                    </div>
                    <div className={"flex flex-col sm:flex-row sm:items-center gap-5 p-4 bg-warm-cream rounded-lg border " + p.batas}>
                    <GambarKarya src={karya ? karya.file_url : null} alt={karya ? karya.title : "Belum dipilih"} className={"w-20 h-20 rounded object-cover border " + p.foto} />
                    <div className="flex-1 space-y-2">
                        {karya ? (
                        <p className="text-body-sm text-light-on-surface-variant">
                            Dipilih saat ini: <strong className="text-light-on-surface">{karya.title}</strong> — {karya.seniman} • {karya.kategori}
                        </p>
                        ) : (
                        <p className="text-body-sm text-light-on-surface-variant">Belum ada karya dipilih untuk peringkat ini.</p>
                        )}
                        <select name={"submisi_" + p.nomor} defaultValue={saatIni ? saatIni.submission_id : ""} className={kelasInput}>
                        <option value="">— Kosongkan peringkat ini —</option>
                        {submisi.map((s) => (
                            <option key={s.id} value={s.id}>{s.title} — {s.seniman}</option>
                        ))}
                        </select>
                        <input type="text" name={"catatan_" + p.nomor} maxLength={300} defaultValue={saatIni ? saatIni.curator_note || "" : ""} placeholder="Catatan kurator (opsional)" className={kelasInput} />
                    </div>
                    </div>
                </div>
                );
            })}

            <div className="p-4 rounded-lg bg-warm-cream border border-sand text-body-sm text-light-on-surface-variant">
                <p className="flex items-center gap-2 font-medium text-light-on-surface mb-1">
                <Info className="w-4 h-4 text-light-primary" />
                <span>Jaminan Transaksi dan Validasi</span>
                </p>
                <p>
                Hasil disimpan dalam satu transaksi: seluruh daftar pemenang diganti sekaligus, dan akan tampil di halaman challenge serta beranda Creosphere. Anda dapat memperbaruinya kembali kapan saja.
                </p>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-light-outline-variant">
                <Link href="/curator/challenges" className="px-5 py-2.5 rounded border border-light-outline text-body-sm font-medium hover:bg-warm-cream">
                Batal
                </Link>
                <TombolKirim className="px-6 py-2.5 rounded-DEFAULT bg-amber-500 text-slate-900 font-bold hover:bg-amber-600 transition-colors shadow-sm text-body-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Publikasikan Hasil Resmi Challenge</span>
                </TombolKirim>
            </div>
            </form>
        )}
        </div>
    );
}
