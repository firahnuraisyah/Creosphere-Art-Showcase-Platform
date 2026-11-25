import Link from "next/link";
import { redirect } from "next/navigation";
import { Palette, Award, Info, Check } from "lucide-react";
import HeaderAuth from "@/components/layout/HeaderAuth";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import TombolKirim from "@/components/ui/TombolKirim";
import KolomSandi from "@/components/auth/KolomSandi";
import { ambilPengguna, tujuanDashboard } from "@/lib/auth";
import { kelasInput, kelasLabel, kelasTombolUtama } from "@/lib/gaya";
import { daftar } from "./actions";

export const metadata = { title: "Buat Akun" };
export const dynamic = "force-dynamic";

export default async function HalamanRegister({ searchParams }) {
    const { galat } = await searchParams;
    const pengguna = await ambilPengguna();
    if (pengguna) redirect(tujuanDashboard(pengguna.role, pengguna.status, pengguna.is_active));

    return (
        <>
        <HeaderAuth
            kanan={
            <span className="text-body-sm text-light-on-surface-variant">
                Sudah punya akun?
                <Link href="/login" className="text-light-primary font-medium hover:underline ml-1">Masuk</Link>
            </span>
            }
        />
        <main className="w-full max-w-lg mx-auto px-6 py-6">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-8 shadow-sm">
            <div className="text-center mb-6">
                <h1 className="font-headline text-headline-md text-light-on-surface mb-2">Buat Akun Anda</h1>
                <p className="text-body-sm text-light-on-surface-variant text-pretty">
                Pilih peran Anda di ruang kreatif global kami. Negara tidak pernah wajib diisi saat mendaftar.
                </p>
            </div>
            <form action={daftar} className="space-y-5">
                <Pemberitahuan galat={galat} />
                <div>
                <label className="block text-label-lg text-light-on-surface font-medium mb-2">Pilih Peran Anda</label>
                <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex flex-col p-4 border border-light-outline-variant bg-light-surface rounded-md cursor-pointer hover:border-sand transition-colors has-[:checked]:border-2 has-[:checked]:border-light-primary has-[:checked]:bg-light-primary-container/20">
                    <input type="radio" name="role" value="member" defaultChecked className="sr-only" />
                    <div className="flex items-center gap-2 mb-1">
                        <Palette className="w-4 h-4 text-light-primary" />
                        <span className="text-title-md font-semibold text-light-on-surface">Seniman / Member</span>
                    </div>
                    <p className="text-body-sm text-light-on-surface-variant">Unggah karya, ikuti challenge, berinteraksi dengan kreator.</p>
                    </label>
                    <label className="relative flex flex-col p-4 border border-light-outline-variant bg-light-surface rounded-md cursor-pointer hover:border-sand transition-colors has-[:checked]:border-2 has-[:checked]:border-light-primary has-[:checked]:bg-light-primary-container/20">
                    <input type="radio" name="role" value="curator" className="sr-only" />
                    <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-olive" />
                        <span className="text-title-md font-semibold text-light-on-surface">Curator</span>
                    </div>
                    <p className="text-body-sm text-light-on-surface-variant">Buat challenge, tinjau submisi, tentukan pemenang.</p>
                    </label>
                </div>
                <p className="text-body-sm text-light-on-surface-variant mt-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-info" />
                    <span>Akun Curator diverifikasi Admin sebelum dapat mengakses dashboard.</span>
                </p>
                </div>
                <div>
                <label htmlFor="display_name" className={kelasLabel}>
                    Nama Tampilan <span className="text-danger">*</span>
                </label>
                <input type="text" id="display_name" name="display_name" required maxLength={50} placeholder="mis. Maya Lin atau Studio Kroma" className={kelasInput} />
                </div>
                <div>
                <label htmlFor="email" className={kelasLabel}>
                    Alamat Email <span className="text-danger">*</span>
                </label>
                <input type="email" id="email" name="email" required maxLength={100} placeholder="seniman@creosphere.com" className={kelasInput} />
                </div>
                <div>
                <label htmlFor="password" className={kelasLabel}>
                    Kata Sandi <span className="text-danger">*</span>
                </label>
                <KolomSandi id="password" name="password" minLength={8} maxLength={72} placeholder="Minimal 8 karakter, huruf dan angka" />
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer text-body-sm text-light-on-surface-variant pt-1">
                <input type="checkbox" required className="mt-0.5 rounded border-light-outline text-light-primary focus:ring-light-primary" />
                <span>
                    Saya menyetujui <span className="text-light-primary">Pedoman Komunitas</span> dan menyatakan bahwa karya yang saya unggah menghormati hak kekayaan intelektual.
                </span>
                </label>
                <TombolKirim className={kelasTombolUtama}>
                <span>Selesaikan Pendaftaran</span>
                <Check className="w-4 h-4" />
                </TombolKirim>
            </form>
            </div>
        </main>
        </>
    );
}
