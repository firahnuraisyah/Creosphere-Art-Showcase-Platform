"use client";

import { useEffect } from "react";

const ATTR = "data-pesan-galat";

function pesanUntuk(el) {
    const v = el.validity;
    if (v.valueMissing) {
        if (el.dataset.pesan) return el.dataset.pesan;
        if (el.type === "checkbox") return "Centang kotak ini untuk melanjutkan.";
        if (el.type === "radio") return "Pilih salah satu opsi.";
        if (el.type === "file") return "Pilih berkas terlebih dahulu.";
        if (el.tagName === "SELECT") return "Pilih salah satu opsi.";
        return "Kolom ini wajib diisi.";
    }
    if (v.typeMismatch) return el.type === "email" ? "Format email tidak valid." : "Format isian tidak valid.";
    if (v.tooShort) return "Minimal " + el.minLength + " karakter.";
    if (v.tooLong) return "Maksimal " + el.maxLength + " karakter.";
    if (v.patternMismatch) return el.title || "Format isian tidak sesuai.";
    if (v.rangeUnderflow) return "Nilai minimal " + el.min + ".";
    if (v.rangeOverflow) return "Nilai maksimal " + el.max + ".";
    return el.validationMessage;
}

function penampung(el) {
    if (el.type === "checkbox" || el.type === "radio") return el.closest("label") || el;
    const induk = el.parentElement;
    return induk && induk.classList.contains("relative") && induk.children.length > 1 ? induk : el;
}

function hapusPesan(el) {
    el.removeAttribute("aria-invalid");
    const tempat = penampung(el);
    const pesan = tempat.nextElementSibling;
    if (pesan && pesan.hasAttribute(ATTR) && pesan.dataset.untuk === (el.name || el.id)) pesan.remove();
}

export default function PenangkapValidasi() {
    useEffect(() => {
        function saatTidakSah(e) {
        const el = e.target;
        if (!(el instanceof HTMLElement) || !("validity" in el)) return;
        e.preventDefault(); 
        hapusPesan(el);
        el.setAttribute("aria-invalid", "true");
        
        const pesan = document.createElement("p");
        pesan.setAttribute(ATTR, "");
        pesan.dataset.untuk = el.name || el.id;
        pesan.setAttribute("role", "alert");
        pesan.className = "mt-1.5 text-body-sm text-danger flex items-center gap-1.5";
        pesan.textContent = pesanUntuk(el);
        penampung(el).after(pesan);
        
        const pertama = el.form ? el.form.querySelector(":invalid") : el;
        if (pertama === el) el.focus({ preventScroll: false });
        }
        
        function saatDiubah(e) {
            const el = e.target;
            if (el instanceof HTMLElement && el.getAttribute("aria-invalid") === "true" && el.checkValidity()) hapusPesan(el);
            }
            document.addEventListener("invalid", saatTidakSah, true);
            document.addEventListener("input", saatDiubah, true);
            document.addEventListener("change", saatDiubah, true);
            return () => {
            document.removeEventListener("invalid", saatTidakSah, true);
            document.removeEventListener("input", saatDiubah, true);
            document.removeEventListener("change", saatDiubah, true);
        };
    }, []);

    return null;
}
