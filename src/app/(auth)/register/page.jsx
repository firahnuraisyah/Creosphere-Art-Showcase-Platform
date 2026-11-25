import Link from "next/link";
import { redirect } from "next/navigation";
import HeaderAuth from "@/components/layout/HeaderAuth";
import { ambilPengguna, tujuanDashboard } from "@/lib/auth";
import FormDaftar from "./FormDaftar";
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
        <main className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
                <h1 className="font-headline text-headline-md text-light-on-surface mb-2">Buat Akun Anda</h1>
                <p className="text-body-sm text-light-on-surface-variant text-pretty">
                Pilih peran Anda di ruang kreatif global kami. Negara tidak pernah wajib diisi saat mendaftar.
                </p>
            </div>
            <FormDaftar aksi={daftar} galat={galat} />
            </div>
        </main>
        </>
    );
}
