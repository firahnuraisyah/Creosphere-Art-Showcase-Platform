    import { inisial } from "@/lib/format";
    import { kelasWarnaAvatar } from "@/lib/gaya";

    export default function Avatar({ nama, src, ukuran = "w-10 h-10", teks = "text-sm", indeksWarna = 0 }) {
    if (src) {
        return <img src={src} alt={nama} className={ukuran + " rounded-full object-cover border border-sand"} />;
    }
    return (
        <div
        className={
            ukuran + " rounded-full flex items-center justify-center font-semibold shrink-0 " + teks + " " +
            kelasWarnaAvatar[indeksWarna % kelasWarnaAvatar.length]
        }
        aria-label={nama}
        >
        {inisial(nama)}
        </div>
    );
    }
