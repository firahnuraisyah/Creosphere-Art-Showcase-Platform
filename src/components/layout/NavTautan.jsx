    "use client";

    import Link from "next/link";
    import { usePathname } from "next/navigation";

    export default function NavTautan({ daftar, mobile = false }) {
    const pathname = usePathname();

    return (
        <>
        {daftar.map((item) => {
            const aktif = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const kelas = mobile
            ? aktif
                ? "text-body-sm font-medium text-light-primary border-b-2 border-light-primary pb-0.5 whitespace-nowrap"
                : "text-body-sm text-light-on-surface-variant hover:text-light-on-surface transition-colors whitespace-nowrap"
            : aktif
                ? "text-body-md font-medium text-light-primary border-b-2 border-light-primary pb-0.5"
                : "text-body-md text-light-on-surface-variant hover:text-light-on-surface transition-colors";
            return (
            <Link key={item.href} href={item.href} className={kelas} aria-current={aktif ? "page" : undefined}>
                {item.label}
            </Link>
            );
        })}
        </>
    );
    }
