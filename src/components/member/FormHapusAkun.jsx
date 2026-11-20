    "use client";

    import TombolKirim from "@/components/ui/TombolKirim";
    import { kelasInput, kelasLabel } from "@/lib/gaya";
    import { Trash2 } from "lucide-react";

    export default function FormHapusAkun({ aksi }) {
    return (
        <form
        action={aksi}
        className="space-y-4"
        onSubmit={(e) => {
            if (!confirm("Hapus akun Anda secara permanen? Semua karya, komentar, dan submisi Anda ikut terhapus.")) {
            e.preventDefault();
            }
        }}
        >
        <div>
            <label htmlFor="hapus_password" className={kelasLabel}>
            Kata sandi untuk konfirmasi
            </label>
            <input type="password" id="hapus_password" name="password" required autoComplete="current-password" className={kelasInput} />
        </div>
        <TombolKirim
            teksMemuat="Menghapus..."
            className="px-4 py-2 rounded-DEFAULT bg-danger text-on-danger text-body-sm font-medium hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"
        >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Akun Saya</span>
        </TombolKirim>
        </form>
    );
    }
