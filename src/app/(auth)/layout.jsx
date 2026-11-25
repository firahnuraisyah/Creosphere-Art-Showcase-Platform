import { redirect } from "next/navigation";
import FooterAuth from "@/components/layout/FooterAuth";
import { ambilPengguna, tujuanDashboard } from "@/lib/auth";

// Kerangka halaman login dan daftar.
export default async function LayoutAuth({ children }) {
    const pengguna = await ambilPengguna();
    if (pengguna?.role === "admin") {
        redirect(tujuanDashboard(pengguna.role, pengguna.status, pengguna.is_active));
    }

    return (
        <div className="flex-1 flex flex-col justify-between">
        {children}
        <FooterAuth />
        </div>
    );
}