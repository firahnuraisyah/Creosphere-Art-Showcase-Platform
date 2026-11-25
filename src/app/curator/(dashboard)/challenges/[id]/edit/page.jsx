import { notFound } from "next/navigation";
import { wajibPeran } from "@/lib/auth";
import { ambilSatu, ambilBanyak } from "@/lib/query";
import { hitungStatus } from "@/lib/challenge";
import { ubahKeId } from "@/lib/validasi";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import FormChallenge from "../../../_komponen/FormChallenge";
import LencanaStatus from "../../../_komponen/LencanaStatus";
import { ubahChallenge } from "../../../actions";

export const metadata = { title: "Ubah Challenge" };
export const dynamic = "force-dynamic";

export default async function UbahChallenge({ params, searchParams }) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });
    const { id: idTeks } = await params;
    const { galat } = await searchParams;
    const id = ubahKeId(idTeks);
    if (!id) notFound();

    const challenge = await ambilSatu("SELECT * FROM challenges WHERE id = $1 AND curator_id = $2", [id, pengguna.id]);
    if (!challenge) notFound();

    const kategori = await ambilBanyak("SELECT id, name FROM categories ORDER BY is_system, name");
    const terpilih = await ambilBanyak("SELECT category_id FROM challenge_categories WHERE challenge_id = $1", [id]);
    const status = hitungStatus(challenge.start_date, challenge.end_date);

    return (
        <div className="max-w-4xl space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-light-outline-variant">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Ubah Detail Challenge</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Perbarui panduan, hadiah, jadwal, atau banner challenge sesuai aturan sistem.
            </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-light-on-surface-variant">Status:</span>
            <LencanaStatus status={status} />
            </div>
        </div>
        <Pemberitahuan galat={galat} />
        <FormChallenge
            aksi={ubahChallenge}
            challenge={challenge}
            kategori={kategori}
            kategoriTerpilih={terpilih.map((t) => t.category_id)}
            kunci={status === "berakhir" ? "semua" : status === "aktif" ? "mulai" : ""}
            teksTombol="Simpan Perubahan"
        />
        </div>
    );
}
