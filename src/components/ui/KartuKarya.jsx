    import Link from "next/link";
    import { Heart } from "lucide-react";
    import GambarKarya from "@/components/ui/GambarKarya";
    import Avatar from "@/components/ui/Avatar";

    export default function KartuKarya({ karya }) {
    return (
        <Link
        href={"/artworks/" + karya.id}
        className="group block bg-light-surface rounded-md border border-light-outline-variant overflow-hidden hover:border-sand transition-all duration-surface-enter shadow-sm hover:shadow-md"
        >
        <div className="aspect-[4/3] bg-warm-cream overflow-hidden relative">
            <GambarKarya
            src={karya.file_url}
            alt={karya.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            />
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-light-surface/90 backdrop-blur-sm text-light-on-surface">
            {karya.kategori}
            </span>
        </div>
        <div className="p-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-headline text-title-md font-semibold text-light-on-surface truncate group-hover:text-light-primary transition-colors">
                {karya.title}
            </h3>
            <span className="flex items-center gap-1 text-xs text-light-on-surface-variant">
                <Heart className="w-3.5 h-3.5 text-terracotta" /> {karya.jumlah_like}
            </span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-light-outline-variant text-xs text-light-on-surface-variant">
            <Avatar nama={karya.artis} src={karya.avatar_url} ukuran="w-5 h-5" teks="text-[10px]" />
            <span className="truncate">{karya.artis}</span>
            </div>
        </div>
        </Link>
    );
    }
