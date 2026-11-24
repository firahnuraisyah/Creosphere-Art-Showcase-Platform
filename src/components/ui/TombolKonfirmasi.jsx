"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { TriangleAlert, CircleCheck, X } from "lucide-react";

export default function TombolKonfirmasi({
    aksi, nilai = {}, pesan, judulDialog = "Lanjutkan tindakan ini?", item, teksAksi = "Ya, Lanjutkan",
    bahaya = true, className, children, judul,
}) {
    const [terbuka, setTerbuka] = useState(false);
    const siapPortal = useSyncExternalStore(() => () => {}, () => true, () => false);
    const idForm = useId();
    const tombolBatal = useRef(null);

    useEffect(() => {
        if (!terbuka) return;
        const lama = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        tombolBatal.current?.focus();
        const tekan = (e) => { if (e.key === "Escape") setTerbuka(false); };
        document.addEventListener("keydown", tekan);
        return () => {
        document.body.style.overflow = lama;
        document.removeEventListener("keydown", tekan);
        };
    }, [terbuka]);

    const Ikon = bahaya ? TriangleAlert : CircleCheck;

    const dialog = (
        <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        onMouseDown={(e) => { if (e.target === e.currentTarget) setTerbuka(false); }}
        >
        <div role="alertdialog" aria-modal="true" aria-labelledby={idForm + "-judul"} aria-describedby={idForm + "-isi"}
            className="relative w-full max-w-md bg-surface rounded-md border border-outline-variant shadow-xl p-6 flex flex-col gap-4">
            <button type="button" onClick={() => setTerbuka(false)} aria-label="Tutup dialog"
            className="absolute top-4 right-4 p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors duration-state-change">
            <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pr-6">
            <span className={"shrink-0 w-11 h-11 rounded-full flex items-center justify-center " + (bahaya ? "bg-red-50 text-danger" : "bg-success-container text-on-success-container")}>
                <Ikon className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1 min-w-0">
                <h3 id={idForm + "-judul"} className="font-headline text-title-lg text-on-surface">{judulDialog}</h3>
                {item && (
                <p className="font-title text-body-md text-on-surface break-words line-clamp-2">&ldquo;{item}&rdquo;</p>
                )}
            </div>
            </div>

            {pesan && <p id={idForm + "-isi"} className="font-body text-body-sm text-on-surface-variant">{pesan}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
            <button ref={tombolBatal} type="button" onClick={() => setTerbuka(false)}
                className="h-10 px-4 rounded border border-border-input bg-surface text-on-surface-variant font-label text-label-lg hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors duration-state-change">
                Batal
            </button>
            <button type="submit" form={idForm}
                className={"h-10 px-4 rounded font-label text-label-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors duration-state-change " +
                (bahaya ? "bg-danger text-on-danger hover:bg-red-700 focus-visible:ring-danger" : "bg-primary text-on-primary hover:bg-primary-hover focus-visible:ring-primary")}>
                {teksAksi}
            </button>
            </div>
        </div>
        </div>
    );

    return (
        <>
        <form id={idForm} action={aksi} onSubmit={() => setTimeout(() => setTerbuka(false), 0)}>
            {Object.entries(nilai).map(([nama, isi]) => (
            <input key={nama} type="hidden" name={nama} value={isi} />
            ))}
            <button type="button" onClick={() => setTerbuka(true)} className={className} title={judul} aria-haspopup="dialog">
            {children}
            </button>
        </form>
        {terbuka && siapPortal && createPortal(dialog, document.body)}
        </>
    );
}
