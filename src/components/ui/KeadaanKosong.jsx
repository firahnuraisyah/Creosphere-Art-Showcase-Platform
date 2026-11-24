    import Link from "next/link";

    export default function KeadaanKosong({ ikon: Ikon, judul, deskripsi, tombol }) {
    return (
        <div className="bg-light-surface rounded-xl border border-dashed border-light-outline p-10 text-center">
        {Ikon && (
            <div className="w-14 h-14 rounded-full bg-warm-cream text-light-on-surface-variant flex items-center justify-center mx-auto mb-4">
            <Ikon className="w-7 h-7" />
            </div>
        )}
        <h3 className="font-headline text-title-lg font-bold text-light-on-surface mb-1">{judul}</h3>
        {deskripsi && <p className="text-body-sm text-light-on-surface-variant max-w-md mx-auto text-pretty">{deskripsi}</p>}
        {tombol && (
            <Link
            href={tombol.href}
            className="mt-5 px-5 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-primary-hover transition-colors shadow-sm inline-flex items-center gap-2"
            >
            {tombol.teks}
            </Link>
        )}
        </div>
    );
    }
