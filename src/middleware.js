    import { NextResponse } from "next/server";
    import { NAMA_COOKIE, bacaToken } from "@/lib/session";

    export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const sesi = await bacaToken(request.cookies.get(NAMA_COOKIE)?.value);

    if (!sesi) {
        const urlLogin = new URL("/login", request.url);
        urlLogin.searchParams.set("next", pathname);
        return NextResponse.redirect(urlLogin);
    }

    let peranDibutuhkan = "member";
    if (pathname.startsWith("/admin")) peranDibutuhkan = "admin";
    else if (pathname.startsWith("/curator")) peranDibutuhkan = "curator";

    if (sesi.role !== peranDibutuhkan) {
        return NextResponse.redirect(new URL("/403", request.url));
    }

    return NextResponse.next();
    }

    export const config = {
    matcher: ["/member/:path*", "/curator/:path*", "/admin/:path*", "/challenges/:id/submit"],
    };
