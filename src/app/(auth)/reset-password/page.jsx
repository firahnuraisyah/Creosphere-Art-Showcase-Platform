    import { ShieldCheck, Check, Circle, ArrowRight } from "lucide-react";
    import HeaderAuth from "@/components/layout/HeaderAuth";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import TombolKirim from "@/components/ui/TombolKirim";
    import { kelasLabel, kelasInput, kelasTombolUtama } from "@/lib/gaya";
    import { aturSandiBaru } from "./actions";

    export const metadata = { title: "Atur Kata Sandi Baru" };

    export default async function HalamanResetSandi({ searchParams }) {
    const { galat } = await searchParams;
    return (
        <>
        <HeaderAuth />
        <main className="w-full max-w-md mx-auto px-6 py-8">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-success border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-center mb-6">
                <h1 className="font-headline text-headline-md text-light-on-surface mb-2">Atur Kata Sandi Baru</h1>
                <p className="text-body-sm text-light-on-surface-variant text-pretty">
                Pilih kata sandi yang kuat untuk melindungi profil seniman, challenge, dan submisi Anda.
                </p>
            </div>
            <form action={aturSandiBaru} className="space-y-5">
                <Pemberitahuan galat={galat} />
                <div>
                <label htmlFor="new_password" className={kelasLabel}>
                    Kata Sandi Baru <span className="text-danger">*</span>
                </label>
                <input type="password" id="new_password" name="new_password" required maxLength={72} placeholder="Minimal 8 karakter" className={kelasInput} />
                </div>
                <div>
                <label htmlFor="confirm_password" className={kelasLabel}>
                    Konfirmasi Kata Sandi <span className="text-danger">*</span>
                </label>
                <input type="password" id="confirm_password" name="confirm_password" required maxLength={72} placeholder="Ulangi kata sandi baru" className={kelasInput} />
                </div>
                <div className="p-3 bg-warm-cream rounded-md border border-light-outline text-body-sm text-light-on-surface-variant space-y-1">
                <p className="font-medium text-light-on-surface">Persyaratan kata sandi:</p>
                <p className="flex items-center gap-1.5 text-xs text-success">
                    <Check className="w-3.5 h-3.5" /> Minimal 8 karakter
                </p>
                <p className="flex items-center gap-1.5 text-xs text-light-on-surface-variant">
                    <Circle className="w-2.5 h-2.5" /> Kombinasi huruf dan angka
                </p>
                </div>
                <TombolKirim className={kelasTombolUtama}>
                <span>Perbarui Kata Sandi &amp; Masuk</span>
                <ArrowRight className="w-4 h-4" />
                </TombolKirim>
            </form>
            </div>
        </main>
        </>
    );
    }
