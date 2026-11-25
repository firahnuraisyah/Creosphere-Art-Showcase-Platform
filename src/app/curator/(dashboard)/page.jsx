import { redirect } from "next/navigation";
import { wajibPeran } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HalamanIndexCurator() {
    await wajibPeran(["curator"], { harusDisetujui: true });
    redirect("/curator/challenges");
}