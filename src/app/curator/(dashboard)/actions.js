"use server";

import { revalidatePath } from "next/cache";
import { wajibPeran } from "@/lib/auth";
import { ambilSatu, ambilBanyak } from "@/lib/query";
import { hitungStatus, hariIni } from "@/lib/challenge";
import { jalankanTransaksi, jalankanQuery, galatPengguna } from "@/lib/transaksi";
import { kembaliGalat, kembaliSukses } from "@/lib/arah";
import { hapusFileLama } from "@/lib/berkas";
import { bacaTeks, cekWajib, cekPanjang, cekUrlUnggahan, ubahKeId } from "@/lib/validasi";
import { bacaTautanForm } from "@/lib/tautan";

const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

function tanggalValid(teks) {
    if (!POLA_TANGGAL.test(teks)) return false;
    const d = new Date(teks + "T00:00:00Z");
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === teks;
}

function bacaChallenge(formData, { bannerLama = "", tanggalLama = null, kunci = "" } = {}) {
    const hari = hariIni();
    const data = {
        title: bacaTeks(formData, "title"),
        tagline: bacaTeks(formData, "tagline"),
        description: bacaTeks(formData, "description"),
        rules: bacaTeks(formData, "rules"),
        prize: bacaTeks(formData, "prize"),
        banner_url: bacaTeks(formData, "banner_url"),
        start_date: kunci ? tanggalLama.start_date : bacaTeks(formData, "start_date"),
        end_date: kunci === "semua" ? tanggalLama.end_date : bacaTeks(formData, "end_date"),
        kategori: [...new Set(formData.getAll("kategori").map(ubahKeId).filter(Boolean))],
    };

    const galat =
        cekWajib(data.title, "Judul") ||
        cekPanjang(data.title, 100, "Judul") ||
        cekWajib(data.tagline, "Tagline") ||
        cekPanjang(data.tagline, 150, "Tagline") ||
        cekWajib(data.description, "Deskripsi") ||
        cekWajib(data.rules, "Aturan") ||
        cekWajib(data.prize, "Hadiah") ||
        cekPanjang(data.prize, 150, "Hadiah") ||
        (!data.banner_url ? "Banner challenge wajib diunggah." : null) ||
        (data.banner_url && data.banner_url !== bannerLama ? cekUrlUnggahan(data.banner_url, "banners") : null) ||
        (data.kategori.length === 0 ? "Pilih minimal satu kategori karya." : null) ||
        (!tanggalValid(data.start_date) ? "Tanggal mulai tidak valid." : null) ||
        (!tanggalValid(data.end_date) ? "Tanggal selesai tidak valid." : null) ||
        (!kunci && data.start_date < hari ? "Tanggal mulai tidak boleh tanggal yang sudah lewat." : null) ||
        (kunci !== "semua" && data.end_date < hari ? "Tanggal selesai tidak boleh tanggal yang sudah lewat." : null) ||
        (data.end_date <= data.start_date ? "Tanggal selesai harus setelah tanggal mulai." : null);

    return { data, galat };
}

async function simpanKategori(klien, idChallenge, daftarKategori) {
    const ada = await klien.query("SELECT id FROM categories WHERE id = ANY($1::int[])", [daftarKategori]);
    if (ada.rows.length !== daftarKategori.length) throw galatPengguna("Ada kategori yang tidak ditemukan.");
    await klien.query("DELETE FROM challenge_categories WHERE challenge_id = $1", [idChallenge]);
    for (const idKategori of daftarKategori) {
        await klien.query("INSERT INTO challenge_categories (challenge_id, category_id) VALUES ($1, $2)", [idChallenge, idKategori]);
    }
}

export async function buatChallenge(formData) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });

    const { data, galat } = bacaChallenge(formData);
    if (galat) kembaliGalat("/curator/challenges/new", galat);

    const hasil = await jalankanTransaksi(async (klien) => {
        const baru = await klien.query(
        `INSERT INTO challenges (curator_id, title, tagline, description, rules, prize, banner_url, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [pengguna.id, data.title, data.tagline, data.description, data.rules, data.prize, data.banner_url, data.start_date, data.end_date]
        );
        await simpanKategori(klien, baru.rows[0].id, data.kategori);
    });
    if (!hasil.ok) kembaliGalat("/curator/challenges/new", hasil.pesan);

    revalidatePath("/curator/challenges");
    revalidatePath("/challenges");
    kembaliSukses("/curator/challenges", "Challenge berhasil dipublikasikan.");
}

export async function ubahChallenge(formData) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });

    const id = ubahKeId(formData.get("id"));
    if (!id) kembaliGalat("/curator/challenges", "Challenge tidak ditemukan.");
    const halamanUbah = "/curator/challenges/" + id + "/edit";

    const lama = await ambilSatu(
        "SELECT id, banner_url, start_date, end_date FROM challenges WHERE id = $1 AND curator_id = $2",
        [id, pengguna.id]
    );
    if (!lama) kembaliGalat("/curator/challenges", "Challenge tidak ditemukan atau bukan milik Anda.");

    const statusLama = hitungStatus(lama.start_date, lama.end_date);
    const { data, galat } = bacaChallenge(formData, {
        bannerLama: lama.banner_url || "",
        tanggalLama: lama,
        kunci: statusLama === "berakhir" ? "semua" : statusLama === "aktif" ? "mulai" : "",
    });
    if (galat) kembaliGalat(halamanUbah, galat);

    const hasil = await jalankanTransaksi(async (klien) => {
        await klien.query(
        `UPDATE challenges
        SET title = $1, tagline = $2, description = $3, rules = $4, prize = $5, banner_url = $6, start_date = $7, end_date = $8
        WHERE id = $9 AND curator_id = $10`,
        [data.title, data.tagline, data.description, data.rules, data.prize, data.banner_url, data.start_date, data.end_date, id, pengguna.id]
        );
        await simpanKategori(klien, id, data.kategori);
    });
    if (!hasil.ok) kembaliGalat(halamanUbah, hasil.pesan);

    if (lama.banner_url && lama.banner_url !== data.banner_url) await hapusFileLama(lama.banner_url);

    revalidatePath("/curator/challenges");
    revalidatePath("/challenges/" + id);
    kembaliSukses("/curator/challenges", "Perubahan challenge berhasil disimpan.");
}

export async function hapusChallenge(formData) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });

    const id = ubahKeId(formData.get("id"));
    if (!id) kembaliGalat("/curator/challenges", "Challenge tidak ditemukan.");

    const milik = await ambilSatu("SELECT id, banner_url FROM challenges WHERE id = $1 AND curator_id = $2", [id, pengguna.id]);
    if (!milik) kembaliGalat("/curator/challenges", "Challenge tidak ditemukan atau bukan milik Anda.");

    const hasil = await jalankanTransaksi(async (klien) => {
        await klien.query("DELETE FROM winners WHERE challenge_id = $1", [id]);
        await klien.query("DELETE FROM submissions WHERE challenge_id = $1", [id]);
        await klien.query("DELETE FROM challenge_categories WHERE challenge_id = $1", [id]);
        await klien.query("DELETE FROM challenges WHERE id = $1 AND curator_id = $2", [id, pengguna.id]);
    });
    if (!hasil.ok) kembaliGalat("/curator/challenges", hasil.pesan);

    await hapusFileLama(milik.banner_url);

    revalidatePath("/curator/challenges");
    revalidatePath("/challenges");
    kembaliSukses("/curator/challenges", "Challenge berhasil dihapus.");
}

export async function simpanPemenang(formData) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });

    const id = ubahKeId(formData.get("id"));
    if (!id) kembaliGalat("/curator/challenges", "Challenge tidak ditemukan.");
    const halaman = "/curator/challenges/" + id + "/winners";

    const challenge = await ambilSatu(
        "SELECT id, start_date, end_date FROM challenges WHERE id = $1 AND curator_id = $2",
        [id, pengguna.id]
    );
    if (!challenge) kembaliGalat("/curator/challenges", "Challenge tidak ditemukan atau bukan milik Anda.");

    if (hitungStatus(challenge.start_date, challenge.end_date) !== "berakhir") {
        kembaliGalat(halaman, "Pemenang baru dapat dipilih setelah challenge berakhir.");
    }

    const pilihan = [];
    for (const peringkat of [1, 2, 3]) {
        const idSubmisi = ubahKeId(formData.get("submisi_" + peringkat));
        const catatan = bacaTeks(formData, "catatan_" + peringkat);
        if (catatan.length > 300) kembaliGalat(halaman, "Catatan kurator maksimal 300 karakter.");
        if (idSubmisi) pilihan.push({ peringkat, idSubmisi, catatan });
    }
    if (pilihan.length === 0) kembaliGalat(halaman, "Pilih minimal satu pemenang.");

    const unik = new Set(pilihan.map((p) => p.idSubmisi));
    if (unik.size !== pilihan.length) kembaliGalat(halaman, "Satu karya tidak boleh menempati lebih dari satu peringkat.");

    const sah = await ambilBanyak(
        "SELECT id FROM submissions WHERE challenge_id = $1 AND id = ANY($2::int[])",
        [id, [...unik]]
    );
    if (sah.length !== unik.size) kembaliGalat(halaman, "Ada karya yang bukan submisi challenge ini.");

    const hasil = await jalankanTransaksi(async (klien) => {
        await klien.query("DELETE FROM winners WHERE challenge_id = $1", [id]);
        for (const p of pilihan) {
        await klien.query(
            "INSERT INTO winners (challenge_id, submission_id, rank, curator_note) VALUES ($1, $2, $3, $4)",
            [id, p.idSubmisi, p.peringkat, p.catatan || null]
        );
        }
    });
    if (!hasil.ok) kembaliGalat(halaman, hasil.pesan);

    revalidatePath("/curator/challenges");
    revalidatePath("/challenges/" + id);
    revalidatePath("/");
    kembaliSukses("/curator/challenges", "Hasil challenge berhasil dipublikasikan.");
}

export async function simpanProfilCurator(formData) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });

    const nama = bacaTeks(formData, "display_name");
    const headline = bacaTeks(formData, "headline");
    const spesialisasi = bacaTeks(formData, "specialization");
    const afiliasi = bacaTeks(formData, "affiliation");
    const bio = bacaTeks(formData, "bio");
    const tautan = bacaTautanForm(formData);
    const negara = bacaTeks(formData, "country");
    const avatar = bacaTeks(formData, "avatar_url");

    const galat =
        cekWajib(nama, "Nama organisasi") ||
        cekPanjang(nama, 50, "Nama organisasi") ||
        cekWajib(headline, "Jabatan profesional") ||
        cekPanjang(headline, 100, "Jabatan profesional") ||
        cekPanjang(spesialisasi, 100, "Spesialisasi") ||
        cekPanjang(afiliasi, 100, "Afiliasi") ||
        cekPanjang(bio, 500, "Biografi") ||
        cekPanjang(negara, 60, "Negara") ||
        tautan.galat;
    if (galat) kembaliGalat("/curator/profile", galat);

    const lama = await ambilSatu("SELECT avatar_url FROM users WHERE id = $1", [pengguna.id]);
    if (avatar && avatar !== (lama && lama.avatar_url)) {
        const galatFoto = cekUrlUnggahan(avatar, "avatars");
        if (galatFoto) kembaliGalat("/curator/profile", galatFoto);
    }

    const hasil = await jalankanQuery(
        `UPDATE users
        SET display_name = $1, headline = $2, specialization = $3, affiliation = $4, bio = $5,
            external_links = $6, country = $7, avatar_url = $8
        WHERE id = $9 AND role = 'curator'`,
        [nama, headline, spesialisasi || null, afiliasi || null, bio || null, tautan.teks, negara || null, avatar || null, pengguna.id]
    );
    if (!hasil.ok) kembaliGalat("/curator/profile", "Terjadi kesalahan pada database. Coba lagi nanti.");

    if (lama && lama.avatar_url && lama.avatar_url !== avatar) await hapusFileLama(lama.avatar_url);

    revalidatePath("/curator", "layout");
    kembaliSukses("/curator/profile", "Profil curator berhasil diperbarui.");
}
