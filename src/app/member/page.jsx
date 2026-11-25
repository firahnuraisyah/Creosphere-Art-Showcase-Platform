import { redirect } from "next/navigation";
import { wajibPeran } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HalamanIndexMember() {
    const pengguna = await wajibPeran(["member"]);
    redirect("/artists/" + pengguna.id);
}
