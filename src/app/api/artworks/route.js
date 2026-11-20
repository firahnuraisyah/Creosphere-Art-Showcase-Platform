import { NextResponse } from "next/server";
import { cariKarya, KARYA_PER_HALAMAN } from "@/lib/karya";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const hasil = await cariKarya({
        q: searchParams.get("q") || "",
        kategori: searchParams.get("kategori") || "",
        urut: searchParams.get("urut") || "terbaru",
        halaman: searchParams.get("page") || 1,
    });
    return NextResponse.json({
        data: hasil.karya,
        total: hasil.total,
        halaman: hasil.halaman,
        totalHalaman: hasil.totalHalaman,
        perHalaman: KARYA_PER_HALAMAN,
    });
    }
