    import SidebarDashboard from "@/components/layout/SidebarDashboard";
    import { wajibPeran } from "@/lib/auth";

    export const dynamic = "force-dynamic";

    export default async function LayoutCurator({ children }) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });
    return (
        <SidebarDashboard tema="curator" pengguna={pengguna}>
        {children}
        </SidebarDashboard>
    );
    }
