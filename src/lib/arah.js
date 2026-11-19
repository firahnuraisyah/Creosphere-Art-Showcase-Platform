    import { redirect } from "next/navigation";

    export function kembaliGalat(path, pesan) {
    const pemisah = path.includes("?") ? "&" : "?";
    redirect(path + pemisah + "galat=" + encodeURIComponent(pesan));
    }

    export function kembaliSukses(path, pesan) {
    const pemisah = path.includes("?") ? "&" : "?";
    redirect(path + pemisah + "sukses=" + encodeURIComponent(pesan));
    }
