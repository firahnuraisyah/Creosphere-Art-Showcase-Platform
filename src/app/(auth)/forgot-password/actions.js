    "use server";

    import { redirect } from "next/navigation";
    import { bacaTeks, cekEmail } from "@/lib/validasi";

    export async function kirimTautan(formData) {
    const email = bacaTeks(formData, "email").toLowerCase();
    const galat = cekEmail(email);
    if (galat) redirect("/forgot-password?galat=" + encodeURIComponent(galat));
    redirect(
        "/forgot-password?sukses=" +
        encodeURIComponent("Jika email terdaftar, petunjuk pemulihan akan dikirim ke kotak masuk Anda.")
    );
    }
