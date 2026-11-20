    import { notFound } from "next/navigation";
    import { wajibPeran } from "@/lib/auth";
    import { ambilBanyak, ambilSatu } from "@/lib/query";
    import { ubahKeId } from "@/lib/validasi";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import GambarKarya from "@/components/ui/GambarKarya";
    import FormKarya, { TombolFormKarya } from "@/components/member/FormKarya";
    import { ubahKarya } from "../../actions";

    export const metadata = { title: "Edit Karya" };
    export const dynamic = "force-dynamic";

    export default async function HalamanEditKarya({ params, searchParams }) {
    const pengguna = await wajibPeran(["member"]);
    const { id } = await params;
    const { galat, sukses } = await searchParams;
    const idKarya = ubahKeId(id);
    if (!idKarya) notFound();

    const karya = await ambilSatu(
        `SELECT a.id, a.title, a.description, a.category_id, a.artwork_type, a.file_url,
                (SELECT string_agg(t.name, ', ' ORDER BY t.name)
                FROM artwork_tags at JOIN tags t ON t.id = at.tag_id WHERE at.artwork_id = a.id) AS tags
        FROM artworks a WHERE a.id = $1 AND a.user_id = $2`,
        [idKarya, pengguna.id]
    );
    if (!karya) notFound();

    const kategori = await ambilBanyak("SELECT id, name, is_system FROM categories ORDER BY is_system ASC, name ASC");
    const namaBerkas = karya.file_url ? karya.file_url.split("/").pop() : "-";

    return (
        <div className="max-w-4xl space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-light-outline-variant">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Edit Informasi Karya</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Perbarui detail karya &quot;{karya.title}&quot;. Catatan: berkas gambar tidak dapat diganti setelah terbit.
            </p>
            </div>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6">
            <GambarKarya src={karya.file_url} alt={karya.title} className="w-28 h-28 rounded-lg object-cover border border-sand" />
            <div className="space-y-1 min-w-0">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-warm-cream text-light-on-surface border border-light-outline">
                Berkas Terkunci
            </span>
            <h3 className="font-headline text-title-lg font-bold text-light-on-surface truncate">{namaBerkas}</h3>
            <p className="text-xs text-light-on-surface-variant">
                Berkas gambar tidak bisa diubah. Untuk mengganti gambar, hapus karya ini lalu unggah karya baru.
            </p>
            </div>
        </div>

        <form action={ubahKarya} className="space-y-6 bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <input type="hidden" name="id" value={karya.id} />
            <FormKarya kategori={kategori} nilai={karya} selaluTampilJenis />
            <TombolFormKarya teks="Simpan Perubahan" teksMemuat="Menyimpan..." />
        </form>
        </div>
    );
    }
