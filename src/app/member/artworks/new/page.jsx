    import { wajibPeran } from "@/lib/auth";
    import { ambilBanyak } from "@/lib/query";
    import { kelasLabel } from "@/lib/gaya";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import UnggahGambar from "@/components/ui/UnggahGambar";
    import FormKarya, { TombolFormKarya } from "@/components/member/FormKarya";
    import { unggahKarya } from "../actions";

    export const metadata = { title: "Unggah Karya" };
    export const dynamic = "force-dynamic";

    export default async function HalamanUnggahKarya({ searchParams }) {
    await wajibPeran(["member"]);
    const { galat, sukses } = await searchParams;
    const kategori = await ambilBanyak("SELECT id, name, is_system FROM categories ORDER BY is_system ASC, name ASC");

    return (
        <div className="max-w-4xl space-y-8">
        <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface mb-2">Unggah Karya</h1>
            <p className="text-body-md text-light-on-surface-variant">Terbitkan karya visual Anda ke pameran global Creosphere.</p>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        <form action={unggahKarya} className="space-y-8">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4">
            <span className={kelasLabel}>
                Berkas Gambar Karya <span className="text-danger">*</span>
            </span>
            <UnggahGambar
                nama="file_url"
                jenis="artworks"
                judul="Klik untuk mengunggah gambar karya"
                bantuan="Format didukung: JPG, PNG, WebP, GIF. Ukuran maksimal 5 MB."
            />
            <span className="text-xs text-olive font-medium block">
                Catatan: karya 3D dan instalasi fisik diunggah sebagai foto dokumentasi.
            </span>
            </div>

            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-5">
            <h2 className="font-headline text-title-lg font-bold text-light-on-surface">Informasi Karya</h2>
            <FormKarya kategori={kategori} />
            </div>

            <TombolFormKarya teks="Terbitkan ke Creosphere" teksMemuat="Menerbitkan..." />
        </form>
        </div>
    );
    }
