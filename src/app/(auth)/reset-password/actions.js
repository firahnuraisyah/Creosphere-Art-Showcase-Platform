    "use server";

    import { redirect } from "next/navigation";
    import { cekPassword } from "@/lib/validasi";

    export async function aturSandiBaru(formData) {
    const baru = String(formData.get("new_password") || "");
    const ulang = String(formData.get("confirm_password") || "");
    const galat = cekPassword(baru) || (baru !== ulang ? "Konfirmasi kata sandi tidak cocok." : null);
    if (galat) redirect("/reset-password?galat=" + encodeURIComponent(galat));
    redirect("/login?sukses=" + encodeURIComponent("Silakan masuk. Untuk mengganti kata sandi, gunakan menu Pengaturan Akun."));
    }
