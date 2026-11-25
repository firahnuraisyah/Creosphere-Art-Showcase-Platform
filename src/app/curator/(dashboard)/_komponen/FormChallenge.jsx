import Link from "next/link";
import { Check } from "lucide-react";
import UnggahGambar from "@/components/ui/UnggahGambar";
import TombolKirim from "@/components/ui/TombolKirim";
import { kelasInput, kelasLabel } from "@/lib/gaya";
import { hariIni } from "@/lib/challenge";

export default function FormChallenge({ aksi, challenge = null, kategori = [], kategoriTerpilih = [], kunci = "", teksTombol }) {
    const c = challenge || {};
    const hari = hariIni();
    return (
        <form action={aksi} className="space-y-8">
        {challenge && <input type="hidden" name="id" value={challenge.id} />}

        <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4">
            <label className="block text-label-lg text-light-on-surface font-medium">
            Banner Challenge <span className="text-danger">*</span>
            </label>
            <UnggahGambar
            nama="banner_url"
            jenis="banners"
            nilaiAwal={c.banner_url || ""}
            judul="Klik untuk mengunggah banner challenge"
            bantuan="Rasio disarankan 16:9 atau 16:6 (lanskap). JPG, PNG, atau WebP hingga 5 MB."
            tinggiPratinjau="aspect-[16/6]"
            />
        </div>

        <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-5">
            <h2 className="font-headline text-title-lg font-bold text-light-on-surface">Informasi Umum</h2>
            <div>
            <label htmlFor="title" className={kelasLabel}>Judul Challenge <span className="text-danger">*</span></label>
            <input type="text" id="title" name="title" required maxLength={100} defaultValue={c.title || ""} placeholder="mis. Keindahan Alam, Identitas Budaya, dll." className={kelasInput} />
            </div>
            <div>
            <label htmlFor="tagline" className={kelasLabel}>Tema &amp; Tagline Konsep <span className="text-danger">*</span></label>
            <input type="text" id="tagline" name="tagline" required maxLength={150} defaultValue={c.tagline || ""} placeholder="mis. Menjelajahi keseimbangan ekologi dan tekstur alam liar" className={kelasInput} />
            </div>
            <div>
            <label htmlFor="description" className={kelasLabel}>Deskripsi Challenge &amp; Pernyataan Kuratorial <span className="text-danger">*</span></label>
            <textarea id="description" name="description" rows={4} required defaultValue={c.description || ""} placeholder="Jelaskan latar belakang, visi kuratorial, dan karya seperti apa yang Anda cari..." className="w-full p-3.5 rounded bg-light-surface border border-light-outline text-body-md focus:border-light-primary focus:ring-1 focus:ring-light-primary" />
            </div>

            <div>
            <label className="block text-label-lg text-light-on-surface font-medium mb-2">
                Kategori Karya yang Diizinkan <span className="text-danger">*</span>
            </label>
            {kategori.length === 0 ? (
                <p className="text-body-sm text-light-on-surface-variant">Belum ada kategori. Minta Admin menambahkan kategori terlebih dahulu.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {kategori.map((k) => (
                    <label key={k.id} className="flex items-center gap-2 p-2.5 rounded border border-light-outline hover:bg-warm-cream cursor-pointer">
                    <input type="checkbox" name="kategori" value={k.id} defaultChecked={kategoriTerpilih.includes(k.id)} className="rounded border-light-outline text-light-primary focus:ring-light-primary" />
                    <span className="text-body-sm font-medium">{k.name}</span>
                    </label>
                ))}
                </div>
            )}
            </div>

            <div>
            <label htmlFor="rules" className={kelasLabel}>Aturan &amp; Panduan Submisi <span className="text-danger">*</span></label>
            <textarea id="rules" name="rules" rows={3} required defaultValue={c.rules || ""} placeholder="Tuliskan aturan: maksimal 1 submisi per member, karya orisinal, tenggat waktu..." className="w-full p-3.5 rounded bg-light-surface border border-light-outline text-body-md focus:border-light-primary focus:ring-1 focus:ring-light-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="prize" className={kelasLabel}>Hadiah <span className="text-danger">*</span></label>
                <input type="text" id="prize" name="prize" required maxLength={150} defaultValue={c.prize || ""} placeholder="mis. Rp5.000.000 + Pameran" className={kelasInput} />
            </div>
            <div>
                <label htmlFor="start_date" className={kelasLabel}>Tanggal Mulai <span className="text-danger">*</span></label>
                <input type="date" id="start_date" name="start_date" required min={hari} defaultValue={c.start_date || ""} disabled={kunci !== ""} className={kelasInput} />
            </div>
            <div>
                <label htmlFor="end_date" className={kelasLabel}>Tenggat (Tanggal Selesai) <span className="text-danger">*</span></label>
                <input type="date" id="end_date" name="end_date" required min={hari} defaultValue={c.end_date || ""} disabled={kunci === "semua"} className={kelasInput} />
                <span className="text-xs text-olive mt-1 block">
                {kunci === "semua"
                    ? "Challenge sudah berakhir, tanggal tidak dapat diubah."
                    : kunci === "mulai"
                    ? "Challenge sudah berjalan: tanggal mulai terkunci, tenggat tidak boleh tanggal lampau."
                    : "Tidak boleh tanggal lampau dan harus setelah tanggal mulai."}
                </span>
            </div>
            </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-light-outline-variant">
            <Link href="/curator/challenges" className="px-5 py-2.5 rounded border border-light-outline text-body-sm font-medium hover:bg-warm-cream">
            Batal
            </Link>
            <TombolKirim className="px-6 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-primary-hover transition-colors shadow-sm text-body-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{teksTombol}</span>
            </TombolKirim>
        </div>
        </form>
    );
}
