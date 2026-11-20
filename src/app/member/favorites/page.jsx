    import Link from "next/link";
    import { BookmarkMinus, Bookmark } from "lucide-react";
    import { wajibPeran } from "@/lib/auth";
    import { ambilBanyak } from "@/lib/query";
    import { formatAngka } from "@/lib/format";
    import GambarKarya from "@/components/ui/GambarKarya";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";
    import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
    import { hapusFavorit } from "./actions";

    export const metadata = { title: "Favorit Saya" };
    export const dynamic = "force-dynamic";

    export default async function HalamanFavorit({ searchParams }) {
    const pengguna = await wajibPeran(["member"]);
    const { galat, sukses } = await searchParams;

    const karya = await ambilBanyak(
        `SELECT a.id, a.title, a.file_url, c.name AS kategori, u.display_name AS artis
        FROM favorites f
        JOIN artworks a ON a.id = f.artwork_id
        JOIN categories c ON c.id = a.category_id
        JOIN users u ON u.id = a.user_id
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC`,
        [pengguna.id]
    );

    return (
        <div className="max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-light-outline-variant">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Favorit Tersimpan ({formatAngka(karya.length)})</h1>
            <p className="text-body-md text-light-on-surface-variant">Karya yang Anda simpan sebagai inspirasi dan referensi.</p>
            </div>
            <Link
            href="/artworks"
            className="px-4 py-2 rounded-DEFAULT bg-warm-cream border border-light-outline text-light-on-surface text-body-sm font-medium hover:bg-sand/30 transition-colors"
            >
            Jelajahi Lebih Banyak
            </Link>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        {karya.length === 0 ? (
            <KeadaanKosong
            ikon={Bookmark}
            judul="Belum ada favorit"
            deskripsi="Simpan karya yang Anda sukai dari halaman detail karya agar mudah ditemukan lagi."
            tombol={{ teks: "Jelajahi Karya", href: "/artworks" }}
            />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {karya.map((item) => (
                <div key={item.id} className="bg-light-surface rounded-md border border-light-outline-variant overflow-hidden shadow-sm group relative">
                <Link href={"/artworks/" + item.id} className="block aspect-[4/3] bg-warm-cream overflow-hidden">
                    <GambarKarya src={item.file_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                </Link>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-light-on-surface-variant">{item.kategori}</span>
                    <TombolKonfirmasi
                        aksi={hapusFavorit}
                        nilai={{ id: item.id }}
                        pesan="Hapus karya ini dari favorit?"
                        judul="Hapus dari favorit"
                        className="text-terracotta hover:text-danger p-1"
                    >
                        <BookmarkMinus className="w-4 h-4" />
                    </TombolKonfirmasi>
                    </div>
                    <h3 className="font-headline text-title-md font-bold text-light-on-surface truncate">
                    <Link href={"/artworks/" + item.id} className="hover:text-light-primary">
                        {item.title}
                    </Link>
                    </h3>
                    <p className="text-xs text-light-on-surface-variant">{item.artis}</p>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
    }
