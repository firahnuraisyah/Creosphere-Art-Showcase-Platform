    import { wajibPeran } from "@/lib/auth";
    import { ambilBanyak } from "@/lib/query";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import FormChallenge from "../../_komponen/FormChallenge";
    import { buatChallenge } from "../../actions";

    export const metadata = { title: "Buat Challenge" };
    export const dynamic = "force-dynamic";

    export default async function BuatChallenge({ searchParams }) {
    await wajibPeran(["curator"], { harusDisetujui: true });
    const { galat } = await searchParams;
    const kategori = await ambilBanyak("SELECT id, name FROM categories ORDER BY is_system, name");

    return (
        <div className="max-w-4xl space-y-8">
        <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface mb-2">Buat Challenge Baru</h1>
            <p className="text-body-md text-light-on-surface-variant">
            Selenggarakan kompetisi bertema untuk para seniman. Semua kolom wajib diisi.
            </p>
        </div>
        <Pemberitahuan galat={galat} />
        <FormChallenge aksi={buatChallenge} kategori={kategori} teksTombol="Publikasikan Challenge" />
        </div>
    );
    }
