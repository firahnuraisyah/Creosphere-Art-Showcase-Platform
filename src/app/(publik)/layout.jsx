import { redirect } from "next/navigation";
import NavbarPublik from "@/components/layout/NavbarPublik";
import FooterPublik from "@/components/layout/FooterPublik";
import { ambilPengguna, tujuanDashboard } from "@/lib/auth";

export default async function LayoutPublik({ children }) {
    const pengguna = await ambilPengguna();
    if (pengguna?.role === "admin") {
        redirect(tujuanDashboard(pengguna.role, pengguna.status, pengguna.is_active));
    }

    return (
        <>
        <NavbarPublik />
        <div className="flex-1 flex flex-col">{children}</div>
        <FooterPublik />
        </>
    );
}