    import { cookies } from "next/headers";
    import { redirect } from "next/navigation";
    import { NAMA_COOKIE, bacaToken } from "@/lib/session";
    import { ambilSatu } from "@/lib/query";

    export async function ambilSesi() {
    const jar = await cookies();
    return bacaToken(jar.get(NAMA_COOKIE)?.value);
    }

    export async function ambilPengguna() {
    const sesi = await ambilSesi();
    if (!sesi) return null;
    return ambilSatu(
        "SELECT id, display_name, email, role, status, avatar_url FROM users WHERE id = $1",
        [sesi.id]
    );
    }

    export function tujuanDashboard(role, status) {
    if (role === "admin") return "/admin";
    if (role === "curator") return status === "approved" ? "/curator" : "/curator/pending";
    return "/member";
    }

    export async function wajibPeran(peranDiizinkan, { harusDisetujui = false } = {}) {
    const pengguna = await ambilPengguna();
    if (!pengguna) redirect("/login");
    if (!peranDiizinkan.includes(pengguna.role)) redirect("/403");
    if (pengguna.role === "curator" && harusDisetujui && pengguna.status !== "approved") {
        redirect("/curator/pending");
    }
    return pengguna;
    }
