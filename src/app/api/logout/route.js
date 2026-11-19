    import { NextResponse } from "next/server";
    import { NAMA_COOKIE } from "@/lib/session";

    export async function POST(request) {
    const respons = NextResponse.redirect(new URL("/login", request.url), 303);
    respons.cookies.delete(NAMA_COOKIE);
    return respons;
    }
