import SidebarDashboard from "@/components/layout/SidebarDashboard";
import { wajibPeran } from "@/lib/auth";
import { ambilSatu } from "@/lib/query";

export const dynamic = "force-dynamic";

// Kerangka Dashboard Admin
export default async function LayoutAdmin({ children }) {
    const pengguna = await wajibPeran(["admin"]);

    const angka = await ambilSatu(
        `SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'curator' AND status = 'pending') AS curator,
        (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS laporan,
        (SELECT COUNT(*) FROM categories) AS kategori`
    );

    return (
        <SidebarDashboard tema="admin" pengguna={pengguna} lencana={angka || {}}>
        {children}
        </SidebarDashboard>
    );
}
