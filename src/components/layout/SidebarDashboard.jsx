    import Link from "next/link";
    import { LogOut, ExternalLink, Menu } from "lucide-react";
    import { inisial } from "@/lib/format";
    import Logo from "@/components/layout/Logo";
    import MenuSidebar from "@/components/layout/MenuSidebar";

    export default function SidebarDashboard({ tema, pengguna, lencana = {}, children }) {
    const gelap = tema === "admin";
    const warnaTitik = tema === "curator" ? "bg-olive" : "bg-terracotta";
    const kelasPanel = gelap
        ? "bg-slate-900 text-white"
        : "bg-light-surface border-r border-light-outline-variant";
    const kelasGarisBawah = gelap ? "border-slate-800" : "border-light-outline-variant";

    const isi = (
        <>
        <div className="space-y-8">
            <Logo warnaTitik={warnaTitik} teks={gelap ? "text-white" : "text-light-on-surface"} />
            <MenuSidebar tema={tema} lencana={lencana} />
        </div>

        <div className={"pt-6 border-t space-y-3 " + kelasGarisBawah}>
            <div className="flex items-center gap-3">
            {pengguna.avatar_url ? (
                <img src={pengguna.avatar_url} alt={pengguna.display_name} className="w-10 h-10 rounded-full object-cover border border-sand" />
            ) : (
                <div
                className={
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm " +
                    (gelap
                    ? "bg-terracotta text-white"
                    : tema === "curator"
                        ? "bg-light-secondary-container text-light-on-secondary-container border border-olive/30"
                        : "bg-light-primary-container text-light-on-primary-container border border-sand")
                }
                >
                {inisial(pengguna.display_name)}
                </div>
            )}
            <div className="truncate">
                <span className={"font-headline text-title-md font-bold block truncate " + (gelap ? "text-white" : "text-light-on-surface")}>
                {pengguna.display_name}
                </span>
                {tema === "member" && <span className="text-xs text-light-on-surface-variant">Seniman Member</span>}
                {tema === "curator" && (
                <span className="text-xs text-olive font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Curator Terverifikasi
                </span>
                )}
                {tema === "admin" && <span className="text-xs text-slate-400 block truncate">{pengguna.email}</span>}
            </div>
            </div>

            {tema === "member" && (
            <Link
                href={"/artists/" + pengguna.id}
                className="w-full py-1.5 px-3 rounded text-xs font-medium bg-warm-cream hover:bg-sand/30 border border-light-outline text-light-on-surface flex items-center justify-center gap-1"
            >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat Profil Publik</span>
            </Link>
            )}

            <form action="/api/logout" method="POST">
            <button
                type="submit"
                className={
                "w-full py-1.5 px-3 text-xs rounded flex items-center justify-center gap-1 transition-colors " +
                (gelap ? "text-rose-400 hover:bg-slate-800" : "text-danger hover:bg-rose-50")
                }
            >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
            </button>
            </form>
        </div>
        </>
    );

    return (
        <div className="flex-1 flex flex-col lg:flex-row">
        <aside className={"hidden lg:flex w-64 shrink-0 flex-col justify-between p-6 " + kelasPanel}>{isi}</aside>

        <div className={"lg:hidden sticky top-0 z-30 border-b " + (gelap ? "bg-slate-900 border-slate-800" : "bg-light-surface border-light-outline-variant")}>
            <details className="group">
            <summary className="flex items-center justify-between px-6 h-14 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <Logo warnaTitik={warnaTitik} teks={gelap ? "text-white" : "text-light-on-surface"} ukuran="text-xl" />
                <span className={"p-2 rounded " + (gelap ? "text-white" : "text-light-on-surface")} aria-label="Buka menu">
                <Menu className="w-5 h-5" />
                </span>
            </summary>
            <div className={"p-6 space-y-6 " + (gelap ? "bg-slate-900 text-white" : "bg-light-surface")}>
                <MenuSidebar tema={tema} lencana={lencana} />
                <form action="/api/logout" method="POST">
                <button type="submit" className={"w-full py-2 text-sm rounded flex items-center justify-center gap-1 " + (gelap ? "text-rose-400 hover:bg-slate-800" : "text-danger hover:bg-rose-50")}>
                    <LogOut className="w-4 h-4" /> Keluar
                </button>
                </form>
            </div>
            </details>
        </div>

        <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10">{children}</main>
        </div>
    );
    }
