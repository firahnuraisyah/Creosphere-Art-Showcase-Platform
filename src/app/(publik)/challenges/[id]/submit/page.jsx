    import Link from "next/link";
    import { notFound } from "next/navigation";
    import { Calendar, Check, CheckCircle2 } from "lucide-react";
    import { wajibPeran } from "@/lib/auth";
    import { ambilBanyak, ambilSatu } from "@/lib/query";
    import { ubahKeId } from "@/lib/validasi";
    import { hitungStatus, sisaHari } from "@/lib/challenge";
    import { formatTanggal } from "@/lib/format";
    import GambarKarya from "@/components/ui/GambarKarya";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";
    import TombolKirim from "@/components/ui/TombolKirim";
    import { kirimSubmisi } from "./actions";

    export const metadata = { title: "Ikuti Challenge" };
    export const dynamic = "force-dynamic";

    export default async function HalamanSubmisiChallenge({ params, searchParams }) {
    const pengguna = await wajibPeran(["member"]);
    const { id } = await params;
    const { galat, sukses } = await searchParams;
    const idChallenge = ubahKeId(id);
    if (!idChallenge) notFound();

    const challenge = await ambilSatu("SELECT id, title, start_date, end_date FROM challenges WHERE id = $1", [idChallenge]);
    if (!challenge) notFound();

    const status = hitungStatus(challenge.start_date, challenge.end_date);

    if (status !== "aktif") {
        return (
        <main className="max-w-3xl mx-auto px-6 py-10">
            <KeadaanKosong
            ikon={Calendar}
            judul={status === "berakhir" ? "Challenge sudah berakhir" : "Challenge belum dimulai"}
            deskripsi="Submisi hanya dapat dikirim selama challenge berstatus aktif."
            tombol={{ teks: "Kembali ke Detail Challenge", href: "/challenges/" + challenge.id }}
            />
        </main>
        );
    }

    const kategoriChallenge = await ambilBanyak(
        "SELECT c.name FROM challenge_categories cc JOIN categories c ON c.id = cc.category_id WHERE cc.challenge_id = $1 ORDER BY c.name",
        [idChallenge]
    );
    const karya = await ambilBanyak(
        `SELECT a.id, a.title, a.artwork_type, a.file_url, c.name AS kategori
        FROM artworks a JOIN categories c ON c.id = a.category_id
        WHERE a.user_id = $1
        AND (NOT EXISTS (SELECT 1 FROM challenge_categories WHERE challenge_id = $2)
                OR a.category_id IN (SELECT category_id FROM challenge_categories WHERE challenge_id = $2))
        ORDER BY a.created_at DESC`,
        [pengguna.id, idChallenge]
    );
    const submisiLama = await ambilSatu("SELECT artwork_id FROM submissions WHERE challenge_id = $1 AND user_id = $2", [
        idChallenge,
        pengguna.id,
    ]);

    const sisa = sisaHari(challenge.end_date);
    const terpilihAwal = submisiLama?.artwork_id || karya[0]?.id;

    return (
        <main className="max-w-3xl mx-auto px-6 py-10 space-y-8 w-full">
        <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-light-secondary-container text-light-on-secondary-container border border-olive/20">
            Submisi Challenge
            </span>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Ikuti: {challenge.title}</h1>
            <p className="text-body-md text-light-on-surface-variant">
            Pilih satu karya dari portofolio Anda yang memenuhi syarat. Setiap member hanya boleh mengirim satu (1) submisi per challenge.
            </p>
        </div>

        <div className="p-4 rounded-xl bg-warm-cream border border-sand flex items-center justify-between text-body-sm">
            <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-terracotta" />
            <span>
                Batas Waktu: <strong>{formatTanggal(challenge.end_date)}</strong>
            </span>
            </div>
            <span className="text-xs text-olive font-semibold">{sisa <= 0 ? "Hari terakhir" : sisa + " Hari Lagi"}</span>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        {karya.length === 0 ? (
            <KeadaanKosong
            ikon={Calendar}
            judul="Belum ada karya yang memenuhi syarat"
            deskripsi={
                kategoriChallenge.length > 0
                ? "Challenge ini menerima kategori: " + kategoriChallenge.map((k) => k.name).join(", ") + ". Unggah karya dalam kategori tersebut terlebih dahulu."
                : "Unggah karya terlebih dahulu agar dapat mengikuti challenge ini."
            }
            tombol={{ teks: "Unggah Karya", href: "/member/artworks/new" }}
            />
        ) : (
            <form action={kirimSubmisi} className="space-y-8">
            <input type="hidden" name="challenge_id" value={challenge.id} />

            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4">
                <h2 className="font-headline text-title-lg font-bold text-light-on-surface">Pilih Karya dari Portofolio Anda</h2>
                <p className="text-body-sm text-light-on-surface-variant">
                {kategoriChallenge.length > 0
                    ? "Hanya karya dengan kategori challenge (" + kategoriChallenge.map((k) => k.name).join(", ") + ") yang ditampilkan."
                    : "Challenge ini menerima semua kategori."}
                {submisiLama && " Anda sudah mengirim submisi; memilih karya lain akan menggantikannya."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {karya.map((item) => (
                    <label
                    key={item.id}
                    className="group relative flex items-center gap-4 p-3.5 rounded-lg border border-light-outline-variant bg-light-surface hover:border-sand cursor-pointer transition-colors has-[:checked]:border-2 has-[:checked]:border-light-primary has-[:checked]:bg-light-primary-container/20"
                    >
                    <input type="radio" name="selected_artwork" value={item.id} defaultChecked={item.id === terpilihAwal} className="sr-only" />
                    <GambarKarya src={item.file_url} alt={item.title} className="w-16 h-16 rounded object-cover border border-light-outline-variant" />
                    <div className="truncate">
                        <span className="text-xs font-semibold text-terracotta">{item.kategori}</span>
                        <h4 className="font-headline text-title-md font-bold text-light-on-surface truncate">{item.title}</h4>
                        <span className="text-xs text-light-on-surface-variant">{item.artwork_type || "-"}</span>
                    </div>
                    <div className="absolute top-3 right-3 text-light-primary hidden group-has-[:checked]:block">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    </label>
                ))}
                </div>
            </div>

            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4">
                <h2 className="font-headline text-title-lg font-bold text-light-on-surface">Konfirmasi Submisi</h2>
                <div className="space-y-2 text-body-sm text-light-on-surface-variant">
                <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" name="setuju_1" required className="mt-0.5 rounded border-light-outline text-light-primary focus:ring-light-primary" />
                    <span>Saya menyatakan ini adalah karya asli saya dan sesuai dengan ketentuan challenge.</span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" name="setuju_2" required className="mt-0.5 rounded border-light-outline text-light-primary focus:ring-light-primary" />
                    <span>Saya memahami bahwa submisi ini menggantikan submisi sebelumnya (jika ada) pada challenge ini.</span>
                </label>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                <Link
                href={"/challenges/" + challenge.id}
                className="px-5 py-2.5 rounded border border-light-outline text-body-sm font-medium hover:bg-warm-cream"
                >
                Batal
                </Link>
                <TombolKirim
                teksMemuat="Mengirim..."
                className="px-6 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-[#6e3522] transition-colors shadow-sm text-body-sm flex items-center gap-2"
                >
                <Check className="w-4 h-4" />
                <span>Konfirmasi Submisi Challenge</span>
                </TombolKirim>
            </div>
            </form>
        )}
        </main>
    );
    }
