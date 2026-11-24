import Link from "next/link";
import { redirect } from "next/navigation";
import HeaderAuth from "@/components/layout/HeaderAuth";
import FormLogin from "@/components/auth/FormLogin";
import { ambilPengguna, tujuanDashboard } from "@/lib/auth";

export const metadata = { title: "Masuk" };
export const dynamic = "force-dynamic";

export default async function HalamanLogin({ searchParams }) {
    const { next, sukses } = await searchParams;

    const pengguna = await ambilPengguna();
    if (pengguna) redirect(tujuanDashboard(pengguna.role, pengguna.status, pengguna.is_active));

    return (
        <>
        <HeaderAuth
            kanan={
            <span className="text-body-sm text-light-on-surface-variant">
                Baru di Creosphere?
                <Link href="/register" className="text-light-primary font-medium hover:underline ml-1">Buat akun</Link>
            </span>
            }
        />
        <main className="w-full max-w-md mx-auto px-6 py-8">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-8 shadow-sm">
            <div className="text-center mb-8">
                <h1 className="font-headline text-headline-md text-light-on-surface mb-2">Selamat Datang Kembali</h1>
                <p className="text-body-sm text-light-on-surface-variant text-pretty">
                Masukkan data Anda untuk mengakses portofolio seniman, challenge, atau dashboard kurasi.
                </p>
            </div>
            <FormLogin next={typeof next === "string" ? next : ""} pesanAwal={typeof sukses === "string" ? sukses : ""} />
            <div className="mt-8 pt-6 border-t border-light-outline-variant text-center">
                <p className="text-body-sm text-light-on-surface-variant">
                Ingin melihat-lihat dulu?{" "}
                <Link href="/" className="text-light-primary font-medium hover:underline">Masuk sebagai tamu (Guest)</Link>
                </p>
            </div>
            </div>
        </main>
        </>
    );
}
