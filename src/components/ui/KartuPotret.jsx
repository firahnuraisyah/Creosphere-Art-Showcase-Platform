import Link from "next/link";
import GambarKarya from "@/components/ui/GambarKarya";

export default function KartuPotret({ href, src, alt, label, nonaktif = false, className = "", children }) {
    return (
        <Link
        href={href}
        className={"group flex flex-col gap-3 transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:outline-none " + className}
        >
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-surface-container group-focus-visible:ring-2 group-focus-visible:ring-primary">
            <GambarKarya src={src} alt={alt} className="w-full h-full object-cover" />
            {label && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface/95 text-on-surface shadow-sm font-label text-label-md">
                {label}
            </span>
            )}
            {nonaktif && (
            <span className="absolute left-2 bottom-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-label-sm font-medium">Akun nonaktif</span>
            )}
        </div>
        <div className="flex flex-col items-center text-center gap-0.5 px-1">{children}</div>
        </Link>
    );
}
