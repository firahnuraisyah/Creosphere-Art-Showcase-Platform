    "use client";

    import { useState } from "react";
    import { Flag, X } from "lucide-react";
    import TombolKirim from "@/components/ui/TombolKirim";

    const pilihan = [
    ["plagiarisme", "Plagiarisme atau Pelanggaran Kekayaan Intelektual"],
    ["tidak_pantas", "Konten Tidak Pantas atau Eksplisit"],
    ["kebencian", "Ujaran Kebencian, Pelecehan, atau Diskriminasi"],
    ["lainnya", "Pelanggaran Lainnya"],
    ];

    export default function ModalLapor({ aksi, idKarya, dapatLapor }) {
    const [terbuka, setTerbuka] = useState(false);
    return (
        <>
        <button
            type="button"
            onClick={() => setTerbuka(true)}
            className="px-3 py-2 rounded-DEFAULT bg-light-surface text-light-on-surface-variant border border-light-outline text-label-lg font-medium hover:bg-warm-cream transition-colors inline-flex items-center gap-1.5"
        >
            <Flag className="w-4 h-4" /> Laporkan
        </button>
        {terbuka && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-light-surface rounded-xl border border-light-outline max-w-md w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                <h3 className="font-headline text-title-lg font-bold text-light-on-surface flex items-center gap-2">
                    <Flag className="w-5 h-5 text-danger" />
                    <span>Laporkan Karya</span>
                </h3>
                <button type="button" onClick={() => setTerbuka(false)} className="text-light-on-surface-variant hover:text-light-on-surface" aria-label="Tutup">
                    <X className="w-5 h-5" />
                </button>
                </div>
                <p className="text-body-sm text-light-on-surface-variant">
                Pilih alasan melaporkan karya ini kepada administrasi Creosphere.
                </p>
                {dapatLapor ? (
                <form action={aksi} className="space-y-3">
                    <input type="hidden" name="artwork_id" value={idKarya} />
                    {pilihan.map(([nilai, teks], i) => (
                    <label key={nilai} className="flex items-center gap-2.5 p-2.5 rounded border border-light-outline hover:bg-warm-cream cursor-pointer">
                        <input type="radio" name="reason" value={nilai} defaultChecked={i === 0} className="text-light-primary focus:ring-light-primary" />
                        <span className="text-body-sm text-light-on-surface font-medium">{teks}</span>
                    </label>
                    ))}
                    <textarea name="note" rows={2} maxLength={500} placeholder="Keterangan tambahan untuk ditinjau admin (opsional)..." className="w-full p-2.5 rounded border border-light-outline text-body-sm" />
                    <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setTerbuka(false)} className="px-4 py-2 rounded border border-light-outline text-body-sm text-light-on-surface hover:bg-warm-cream">
                        Batal
                    </button>
                    <TombolKirim className="px-4 py-2 rounded bg-danger text-on-danger text-body-sm font-medium hover:bg-red-700 inline-flex items-center gap-2" teksMemuat="Mengirim...">
                        Kirim Laporan
                    </TombolKirim>
                    </div>
                </form>
                ) : (
                <div className="space-y-3">
                    <p className="text-body-sm text-light-on-surface">Anda harus masuk sebagai Member untuk melaporkan karya.</p>
                    <div className="flex justify-end">
                    <a href={"/login?next=/artworks/" + idKarya} className="px-4 py-2 rounded bg-light-primary text-light-on-primary text-body-sm font-medium hover:bg-primary-hover">Masuk</a>
                    </div>
                </div>
                )}
            </div>
            </div>
        )}
        </>
    );
    }
