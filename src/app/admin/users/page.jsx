import Link from "next/link";
import { Ban, UserCheck, Users } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { ambilSatu, ambilBanyak } from "@/lib/query";
import { formatTanggalPendek, formatAngka, inisial } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
import { nonaktifkanPengguna, aktifkanPengguna } from "../actions";

export const metadata = { title: "Manajemen Pengguna" };
export const dynamic = "force-dynamic";

const PERAN_SAH = ["member", "curator", "admin"];
const labelStatus = { approved: "Disetujui", pending: "Menunggu", rejected: "Ditolak" };
const kelasStatus = {
    approved: "bg-emerald-50 text-success border-emerald-200",
    pending: "bg-amber-50 text-warning border-amber-200",
    rejected: "bg-rose-50 text-danger border-rose-200",
};

export default async function ManajemenPengguna({ searchParams }) {
    const admin = await wajibPeran(["admin"]);
    const { galat, sukses, peran: peranParam } = await searchParams;
    const peran = PERAN_SAH.includes(peranParam) ? peranParam : "";

    const hitung =
        (await ambilSatu(
        `SELECT COUNT(*) AS semua,
                COUNT(*) FILTER (WHERE role = 'member') AS member,
                COUNT(*) FILTER (WHERE role = 'curator') AS curator,
                COUNT(*) FILTER (WHERE role = 'admin') AS admin
        FROM users`
        )) || {};

    const params = [];
    const syarat = [];
    if (peran) {
        params.push(peran);
        syarat.push("role = $" + params.length);
    }
    const kondisi = syarat.length ? "WHERE " + syarat.join(" AND ") : "";

    const pengguna = await ambilBanyak(
        "SELECT id, display_name, email, role, status, is_active, avatar_url, created_at FROM users " +
        kondisi +
        " ORDER BY LOWER(display_name) ASC, id ASC",
        params
    );

    const filter = [
        { nilai: "", label: "Semua Pengguna", jumlah: hitung.semua },
        { nilai: "member", label: "Member", jumlah: hitung.member },
        { nilai: "curator", label: "Curator", jumlah: hitung.curator },
        { nilai: "admin", label: "Admin", jumlah: hitung.admin },
    ];
    const buatUrl = (nilai) => {
        const p = new URLSearchParams();
        if (nilai) p.set("peran", nilai);
        const teks = p.toString();
        return "/admin/users" + (teks ? "?" + teks : "");
    };

    return (
        <div className="max-w-7xl space-y-8">
        <div className="pb-6 border-b border-light-outline-variant">
            <h1 className="font-headline text-headline-lg text-light-on-surface">Pengguna &amp; Kontrol Akses Platform</h1>
            <p className="text-body-md text-light-on-surface-variant">
            Lihat pengguna menurut peran (Admin, Member, Curator), periksa status verifikasi, atau nonaktifkan akun yang melanggar.
            </p>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
            {filter.map((f) => (
                <Link
                key={f.label}
                href={buatUrl(f.nilai)}
                className={
                    "px-3.5 py-1.5 rounded-full text-xs font-semibold " +
                    (peran === f.nilai
                    ? "bg-slate-900 text-white"
                    : "bg-light-surface text-light-on-surface border border-light-outline hover:bg-warm-cream")
                }
                >
                {f.label} ({formatAngka(f.jumlah)})
                </Link>
            ))}
            </div>
        </div>

        {pengguna.length === 0 ? (
            <KeadaanKosong ikon={Users} judul="Pengguna tidak ditemukan" deskripsi="Belum ada pengguna dengan peran ini." />
        ) : (
            <div className="bg-light-surface rounded-xl border border-light-outline-variant overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-warm-cream border-b border-light-outline-variant text-label-sm uppercase tracking-wider text-light-on-surface-variant">
                    <th className="p-4">Pengguna</th>
                    <th className="p-4">Peran</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Tanggal Daftar</th>
                    <th className="p-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant text-body-sm">
                    {pengguna.map((u) => (
                    <tr key={u.id} className={u.role === "admin" ? "bg-slate-50/50" : "hover:bg-warm-cream/30"}>
                        <td className="p-4 flex items-center gap-3">
                        {u.role === "admin" ? (
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{inisial(u.display_name)}</div>
                        ) : (
                            <Avatar nama={u.display_name} src={u.avatar_url} ukuran="w-10 h-10" teks="text-xs" indeksWarna={u.role === "curator" ? 1 : 0} />
                        )}
                        <div>
                            <strong className="text-light-on-surface block">{u.display_name}</strong>
                            <span className="text-xs text-light-on-surface-variant">{u.email}</span>
                        </div>
                        </td>
                        <td className="p-4">
                        {u.role === "admin" && <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">Admin</span>}
                        {u.role === "curator" && <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-light-secondary-container text-light-on-secondary-container">Curator</span>}
                        {u.role === "member" && <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-light-primary-container text-light-on-primary-container">Member</span>}
                        </td>
                        <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                            <span className={"px-2.5 py-0.5 rounded-full text-xs font-semibold border " + (kelasStatus[u.status] || kelasStatus.approved)}>
                            {labelStatus[u.status] || u.status}
                            </span>
                            {!u.is_active && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-300">Nonaktif</span>
                            )}
                        </div>
                        </td>
                        <td className="p-4 text-light-on-surface-variant">{formatTanggalPendek(u.created_at)}</td>
                        <td className="p-4 text-right">
                        {u.id === admin.id ? (
                            <span className="text-xs text-light-on-surface-variant italic">Diri sendiri (Dilindungi)</span>
                        ) : u.role === "admin" ? (
                            <span className="text-xs text-light-on-surface-variant italic">Dilindungi</span>
                        ) : (
                            <div className="flex justify-end">
                            {u.is_active ? (
                                <TombolKonfirmasi
                                aksi={nonaktifkanPengguna}
                                nilai={{ id: u.id }}
                                judulDialog="Nonaktifkan Akun?"
                                item={u.display_name}
                                pesan="Pengguna tidak dapat memakai platform dan hanya melihat pemberitahuan akun nonaktif. Karyanya tetap tampil dengan tanda akun nonaktif. Anda dapat mengaktifkannya kembali kapan saja."
                                teksAksi="Nonaktifkan"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-danger border border-rose-200 hover:bg-rose-50 rounded"
                                judul="Nonaktifkan Akun"
                                >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Nonaktifkan</span>
                                </TombolKonfirmasi>
                            ) : (
                                <TombolKonfirmasi
                                aksi={aktifkanPengguna}
                                nilai={{ id: u.id }}
                                judulDialog="Aktifkan Kembali Akun?"
                                item={u.display_name}
                                pesan="Pengguna dapat memakai platform seperti semula."
                                teksAksi="Aktifkan"
                                bahaya={false}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-success border border-emerald-200 hover:bg-emerald-50 rounded"
                                judul="Aktifkan Akun"
                                >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Aktifkan</span>
                                </TombolKonfirmasi>
                            )}
                            </div>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        )}
        </div>
    );
}
