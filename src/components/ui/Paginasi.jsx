    import Link from "next/link";

    export default function Paginasi({ halaman, totalHalaman, total, perHalaman, path, params = {}, satuan = "karya" }) {
    if (total === 0) return null;

    const buatUrl = (nomor) => {
        const parameter = new URLSearchParams();
        Object.entries(params).forEach(([kunci, nilai]) => {
        if (nilai) parameter.set(kunci, nilai);
        });
        if (nomor > 1) parameter.set("page", nomor);
        const teks = parameter.toString();
        return teks ? path + "?" + teks : path;
    };

    const nomor = [];
    for (let i = 1; i <= totalHalaman; i++) {
        if (i === 1 || i === totalHalaman || Math.abs(i - halaman) <= 1) nomor.push(i);
        else if (nomor[nomor.length - 1] !== "...") nomor.push("...");
    }

    const awal = (halaman - 1) * perHalaman + 1;
    const akhir = Math.min(halaman * perHalaman, total);

    return (
        <nav
        aria-label="Navigasi halaman"
        className="mt-12 pt-6 border-t border-light-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 text-body-sm text-light-on-surface-variant"
        >
        <span>
            Menampilkan {awal} – {akhir} dari {total.toLocaleString("id-ID")} {satuan}
        </span>
        {totalHalaman > 1 && (
            <div className="flex items-center gap-1 flex-wrap justify-center">
            {halaman > 1 ? (
                <Link href={buatUrl(halaman - 1)} className="px-3 py-1.5 rounded border border-light-outline hover:bg-warm-cream text-light-on-surface">
                Sebelumnya
                </Link>
            ) : (
                <span className="px-3 py-1.5 rounded border border-light-outline text-light-on-surface-variant/40 cursor-not-allowed">Sebelumnya</span>
            )}
            {nomor.map((n, i) =>
                n === "..." ? (
                <span key={"titik" + i} className="px-2">...</span>
                ) : (
                <Link
                    key={n}
                    href={buatUrl(n)}
                    aria-current={n === halaman ? "page" : undefined}
                    className={
                    n === halaman
                        ? "px-3 py-1.5 rounded bg-light-primary text-light-on-primary font-medium"
                        : "px-3 py-1.5 rounded hover:bg-warm-cream text-light-on-surface"
                    }
                >
                    {n}
                </Link>
                )
            )}
            {halaman < totalHalaman ? (
                <Link href={buatUrl(halaman + 1)} className="px-3 py-1.5 rounded border border-light-outline hover:bg-warm-cream text-light-on-surface">
                Berikutnya
                </Link>
            ) : (
                <span className="px-3 py-1.5 rounded border border-light-outline text-light-on-surface-variant/40 cursor-not-allowed">Berikutnya</span>
            )}
            </div>
        )}
        </nav>
    );
    }
