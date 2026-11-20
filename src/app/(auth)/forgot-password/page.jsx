    import Link from "next/link";
    import { KeyRound, Mail, Send, ChevronLeft } from "lucide-react";
    import HeaderAuth from "@/components/layout/HeaderAuth";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import TombolKirim from "@/components/ui/TombolKirim";
    import { kelasLabel, kelasInputIkon, kelasTombolUtama } from "@/lib/gaya";
    import { kirimTautan } from "./actions";

    export const metadata = { title: "Lupa Kata Sandi" };

    export default async function HalamanLupaSandi({ searchParams }) {
    const { galat, sukses } = await searchParams;
    return (
        <>
        <HeaderAuth />
        <main className="w-full max-w-md mx-auto px-6 py-8">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-light-primary-container text-light-on-primary-container flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-6 h-6 text-light-primary" />
            </div>
            <div className="text-center mb-6">
                <h1 className="font-headline text-headline-md text-light-on-surface mb-2">Lupa Kata Sandi</h1>
                <p className="text-body-sm text-light-on-surface-variant text-pretty">
                Masukkan alamat email terdaftar Anda. Kami akan mengirimkan petunjuk dan tautan pemulihan yang aman.
                </p>
            </div>
            <form action={kirimTautan} className="space-y-5">
                <Pemberitahuan galat={galat} sukses={sukses} />
                <div>
                <label htmlFor="recovery_email" className={kelasLabel}>
                    Alamat Email Terdaftar <span className="text-danger">*</span>
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-on-surface-variant">
                    <Mail className="w-4 h-4" />
                    </span>
                    <input type="email" id="recovery_email" name="email" required placeholder="seniman@creosphere.com" className={kelasInputIkon} />
                </div>
                </div>
                <TombolKirim className={kelasTombolUtama}>
                <span>Kirim Tautan Pemulihan</span>
                <Send className="w-4 h-4" />
                </TombolKirim>
            </form>
            <div className="mt-6 text-center">
                <Link href="/login" className="text-body-sm text-light-on-surface-variant hover:text-light-on-surface inline-flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Ingat kata sandi Anda? Masuk</span>
                </Link>
            </div>
            </div>
        </main>
        </>
    );
    }
