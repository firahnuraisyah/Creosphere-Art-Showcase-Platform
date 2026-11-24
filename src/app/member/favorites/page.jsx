import Link from "next/link";
import { BookmarkMinus, Bookmark } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { ambilBanyak } from "@/lib/query";
import { formatAngka } from "@/lib/format";
import KartuPotret from "@/components/ui/KartuPotret";
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
        `SELECT a.id, a.title, a.file_url, u.display_name AS artis, u.is_active
        FROM favorites f
        JOIN artworks a ON a.id = f.artwork_id
        JOIN users u ON u.id = a.user_id
        WHERE f.user_id = $1
        ORDER BY a.created_at DESC`,
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8">
            {karya.map((item) => (
                <div key={item.id} className="relative">
                <KartuPotret href={"/artworks/" + item.id} src={item.file_url} alt={item.title + " oleh " + item.artis} nonaktif={!item.is_active}>
                    <span className="font-label text-label-md text-outline truncate max-w-full">{item.artis}</span>
                    <span className="font-title text-title-md text-on-surface truncate max-w-full">{item.title}</span>
                </KartuPotret>
                <div className="absolute right-2 top-2 rounded-full bg-surface/95 shadow-sm">
                    <TombolKonfirmasi
                    aksi={hapusFavorit}
                    nilai={{ id: item.id }}
                    judulDialog="Hapus dari Favorit?"
                    item={item.title}
                    pesan="Karya tidak lagi tersimpan di daftar favorit Anda. Karyanya sendiri tidak dihapus."
                    teksAksi="Hapus"
                    judul="Hapus dari favorit"
                    className="text-on-surface-variant hover:text-danger p-1.5 rounded-full"
                    >
                    <BookmarkMinus className="w-4 h-4" />
                    </TombolKonfirmasi>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
