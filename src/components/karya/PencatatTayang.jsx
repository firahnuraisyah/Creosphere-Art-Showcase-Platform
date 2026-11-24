"use client";

import { useEffect } from "react";

export default function PencatatTayang({ idKarya }) {
    useEffect(() => {
        const kunci = "creosphere-tayang-" + idKarya;
        try {
        if (sessionStorage.getItem(kunci)) return;
        sessionStorage.setItem(kunci, "1");
        } catch {
        // sessionStorage tidak tersedia: tetap catat tayang
        }
        fetch("/api/artworks/" + idKarya + "/view", { method: "POST" }).catch(() => {});
    }, [idKarya]);

    return null;
}
