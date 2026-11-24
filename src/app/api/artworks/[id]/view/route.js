import { NextResponse } from "next/server";
import { jalankanQuery } from "@/lib/transaksi";
import { ubahKeId } from "@/lib/validasi";

export async function POST(request, { params }) {
    const { id } = await params;
    const idKarya = ubahKeId(id);
    if (!idKarya) return NextResponse.json({ message: "Karya tidak valid." }, { status: 400 });

    const hasil = await jalankanQuery("UPDATE artworks SET view_count = view_count + 1 WHERE id = $1", [idKarya]);
    if (!hasil.ok) return NextResponse.json({ message: "Gagal mencatat tayang." }, { status: 500 });
    if (hasil.rowCount === 0) return NextResponse.json({ message: "Karya tidak ditemukan." }, { status: 404 });

    return NextResponse.json({ message: "Tayang dicatat." });
}
