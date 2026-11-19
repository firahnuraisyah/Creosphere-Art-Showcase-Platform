    import { Palette, PencilLine, Shirt, Stamp, Box, Layers, Shapes } from "lucide-react";

    const DAFTAR_IKON = [
    { kata: ["lukis", "paint"], ikon: Palette },
    { kata: ["gambar", "draw"], ikon: PencilLine },
    { kata: ["tekstil", "textile", "serat", "fiber"], ikon: Shirt },
    { kata: ["cetak", "print"], ikon: Stamp },
    { kata: ["patung", "sculpt", "3d"], ikon: Box },
    { kata: ["campuran", "mixed"], ikon: Layers },
    ];

    export function ikonKategori(nama = "") {
    const huruf = nama.toLowerCase();
    const cocok = DAFTAR_IKON.find((item) => item.kata.some((k) => huruf.includes(k)));
    return cocok ? cocok.ikon : Shapes;
    }

    export const kelasWarnaKategori = [
    "text-terracotta",
    "text-light-on-surface",
    "text-olive",
    "text-light-primary",
    "text-terracotta",
    "text-olive",
    "text-light-on-surface-variant",
    ];
