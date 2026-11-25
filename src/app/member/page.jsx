import { redirect } from "next/navigation";
import { wajibPeran } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HalamanIndexMember() {
    await wajibPeran(["member"]);
    redirect("/member/artworks");
}