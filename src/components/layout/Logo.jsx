    import Link from "next/link";

    export default function Logo({ warnaTitik = "bg-terracotta", teks = "text-light-on-surface", ukuran = "text-2xl" }) {
    return (
        <Link href="/" className="flex items-center gap-2.5 group">
        <span className={"w-3.5 h-3.5 rounded-full transition-transform group-hover:scale-110 " + warnaTitik}></span>
        <span className={"font-headline font-bold tracking-tight lowercase " + ukuran + " " + teks}>creosphere</span>
        </Link>
    );
    }
