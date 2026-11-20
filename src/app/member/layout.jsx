    import SidebarDashboard from "@/components/layout/SidebarDashboard";
    import { wajibPeran } from "@/lib/auth";

    export const dynamic = "force-dynamic";

    export default async function LayoutMember({ children }) {
    const pengguna = await wajibPeran(["member"]);
    return (
        <SidebarDashboard tema="member" pengguna={pengguna}>
        {children}
        </SidebarDashboard>
    );
    }
