import Link from "next/link";

export default function Logo({ teks = "text-on-surface", ukuran = "text-xl" }) {
    return (
        <Link
        href="/"
        className="inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
        <span className={"font-headline font-bold tracking-tight " + ukuran + " " + teks}>Creosphere</span>
        </Link>
    );
}
