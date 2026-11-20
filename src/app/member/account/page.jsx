    import { Mail, KeyRound, AlertTriangle } from "lucide-react";
    import { wajibPeran } from "@/lib/auth";
    import { kelasInput, kelasLabel } from "@/lib/gaya";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import TombolKirim from "@/components/ui/TombolKirim";
    import FormHapusAkun from "@/components/member/FormHapusAkun";
    import { ubahEmail, gantiPassword, hapusAkun } from "./actions";

    export const metadata = { title: "Pengaturan Akun" };
    export const dynamic = "force-dynamic";

    const kelasTombol =
    "px-5 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-[#6e3522] transition-colors shadow-sm text-body-sm inline-flex items-center gap-2";

    export default async function HalamanPengaturanAkun({ searchParams }) {
    const pengguna = await wajibPeran(["member"]);
    const { galat, sukses } = await searchParams;

    return (
        <div className="max-w-4xl space-y-8">
        <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface mb-2">Pengaturan Akun</h1>
            <p className="text-body-md text-light-on-surface-variant">Kelola email, kata sandi, dan keamanan akun Anda.</p>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        <form action={ubahEmail} className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-5">
            <h2 className="font-headline text-title-lg font-bold text-light-on-surface flex items-center gap-2">
            <Mail className="w-5 h-5 text-light-primary" /> Ubah Email
            </h2>
            <div>
            <label htmlFor="email" className={kelasLabel}>
                Email
            </label>
            <input type="email" id="email" name="email" required maxLength={100} defaultValue={pengguna.email} className={kelasInput} />
            </div>
            <div>
            <label htmlFor="password_email" className={kelasLabel}>
                Kata sandi saat ini
            </label>
            <input type="password" id="password_email" name="password" required autoComplete="current-password" className={kelasInput} />
            <p className="text-xs text-light-on-surface-variant mt-1.5">Dibutuhkan untuk memastikan perubahan ini dilakukan oleh Anda.</p>
            </div>
            <TombolKirim teksMemuat="Menyimpan..." className={kelasTombol}>
            Simpan Email
            </TombolKirim>
        </form>

        <form action={gantiPassword} className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-5">
            <h2 className="font-headline text-title-lg font-bold text-light-on-surface flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-light-primary" /> Ganti Kata Sandi
            </h2>
            <div>
            <label htmlFor="password_lama" className={kelasLabel}>
                Kata sandi lama
            </label>
            <input type="password" id="password_lama" name="password_lama" required autoComplete="current-password" className={kelasInput} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="password_baru" className={kelasLabel}>
                Kata sandi baru
                </label>
                <input type="password" id="password_baru" name="password_baru" required minLength={8} autoComplete="new-password" className={kelasInput} />
            </div>
            <div>
                <label htmlFor="password_ulang" className={kelasLabel}>
                Ulangi kata sandi baru
                </label>
                <input type="password" id="password_ulang" name="password_ulang" required minLength={8} autoComplete="new-password" className={kelasInput} />
            </div>
            </div>
            <p className="text-xs text-light-on-surface-variant">Minimal 8 karakter dan mengandung huruf serta angka.</p>
            <TombolKirim teksMemuat="Menyimpan..." className={kelasTombol}>
            Ganti Kata Sandi
            </TombolKirim>
        </form>

        <div className="bg-light-surface rounded-xl border border-rose-200 p-6 shadow-sm space-y-4">
            <h2 className="font-headline text-title-lg font-bold text-danger flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Hapus Akun
            </h2>
            <p className="text-body-sm text-light-on-surface-variant">
            Menghapus akun bersifat permanen. Seluruh karya, komentar, favorit, dan submisi challenge Anda ikut terhapus dan tidak dapat dikembalikan.
            </p>
            <FormHapusAkun aksi={hapusAkun} />
        </div>
        </div>
    );
    }
