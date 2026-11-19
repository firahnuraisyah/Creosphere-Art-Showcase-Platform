    import Link from "next/link";
    import Logo from "@/components/layout/Logo";
    import { ambilBanyak } from "@/lib/query";

    export default async function FooterPublik() {
    const kategori = await ambilBanyak("SELECT id, name FROM categories ORDER BY id LIMIT 3");

    return (
        <footer className="border-t border-light-outline-variant bg-light-surface py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
            <Logo ukuran="text-xl" />
            <p className="text-body-sm text-light-on-surface-variant">
                Ruang global bagi seniman untuk berbagi, memamerkan, dan mengapresiasi kreativitas.
            </p>
            </div>
            <div>
            <h4 className="font-headline text-title-md font-semibold text-light-on-surface mb-3">Jelajahi</h4>
            <ul className="space-y-2 text-body-sm text-light-on-surface-variant">
                <li><Link href="/artworks" className="hover:text-light-primary">Semua Karya</Link></li>
                {kategori.map((k) => (
                <li key={k.id}>
                    <Link href={"/artworks?kategori=" + k.id} className="hover:text-light-primary">{k.name}</Link>
                </li>
                ))}
            </ul>
            </div>
            <div>
            <h4 className="font-headline text-title-md font-semibold text-light-on-surface mb-3">Komunitas</h4>
            <ul className="space-y-2 text-body-sm text-light-on-surface-variant">
                <li><Link href="/artists" className="hover:text-light-primary">Temukan Seniman</Link></li>
                <li><Link href="/challenges" className="hover:text-light-primary">Challenge Seni</Link></li>
                <li><Link href="/login" className="hover:text-light-primary">Portal Member</Link></li>
            </ul>
            </div>
            <div>
            <h4 className="font-headline text-title-md font-semibold text-light-on-surface mb-3">Curator &amp; Lembaga</h4>
            <ul className="space-y-2 text-body-sm text-light-on-surface-variant">
                <li><Link href="/register" className="hover:text-light-primary">Daftar sebagai Curator</Link></li>
                <li><Link href="/login" className="hover:text-light-primary">Dashboard Curator</Link></li>
            </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-light-outline-variant flex flex-col sm:flex-row items-center justify-between text-body-sm text-light-on-surface-variant gap-4">
            <p>© 2026 Creosphere. Proyek Akhir — Praktikum Pemrograman Web. Hak cipta dilindungi.</p>
            <div className="flex items-center gap-6">
            <span>Kebijakan Privasi</span>
            <span>Ketentuan Komunitas</span>
            <span>Pedoman Konten</span>
            </div>
        </div>
        </footer>
    );
    }
