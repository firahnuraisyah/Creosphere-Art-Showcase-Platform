<div align="center">

<br/>

# 🎨 Creosphere

### *Where Art Finds Its Stage*

**Creosphere** adalah platform showcase seni digital yang menghubungkan seniman, kurator, dan penikmat seni dalam satu ekosistem yang hidup — mulai dari mengunggah karya, mengikuti challenge kreatif, hingga memenangkan pengakuan dari komunitas.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

<br/>

</div>

---

## 📖 Tentang Proyek

**Creosphere** hadir sebagai jawaban atas kebutuhan ruang digital yang layak bagi seniman independen. Platform ini memungkinkan seniman membangun portofolio publik, mengikuti *art challenge* bertema yang dikurasi oleh komunitas kuratorial terverifikasi, serta mendapatkan apresiasi dari sesama penikmat seni.

> Nama *Creosphere* berasal dari gabungan kata **"creative"** dan **"sphere"** — sebuah dunia bulat penuh kreativitas tanpa batas.

Proyek ini dibangun sebagai **Final Project Mata Kuliah Pemrograman Web Semester 3**, mengimplementasikan arsitektur full-stack modern dengan Next.js App Router, server actions, dan autentikasi berbasis sesi.

---

## ✨ Fitur Utama

### 👤 Sistem Peran (Role-Based Access)

| Peran | Akses |
|-------|-------|
| **Member / Seniman** | Upload karya, ikut challenge, like & favorit, komentar |
| **Kurator** | Buat & kelola art challenge, verifikasi oleh admin |
| **Admin** | Kelola semua user, moderasi konten, verifikasi kurator |

### 🖼️ Galeri Karya
- Upload karya seni dengan gambar, judul, deskripsi, dan tag
- Tampilan *masonry grid* responsif yang estetis
- Fitur **suka**, **favorit**, dan pencatat jumlah tayangan
- Filter berdasarkan kategori

### 🏆 Art Challenge
- Kurator membuat challenge bertema dengan tanggal mulai & selesai
- Status challenge dihitung otomatis: `Belum Mulai` → `Aktif` → `Berakhir`
- Member mengirimkan karya sebagai submisi
- Kurator memilih hingga **3 pemenang** (Peringkat 1–3) beserta catatan kuratorial
- Kategori karya yang diizinkan dapat dibatasi per challenge

### 🔍 Pencarian
- Cari karya, seniman, dan challenge dari navbar
- Dukungan pencarian di perangkat mobile via dropdown interaktif

### 🛡️ Moderasi & Keamanan
- Member dapat melaporkan karya yang melanggar aturan
- Admin dapat melakukan *take down* karya beserta seluruh data terkait
- Kurator wajib upload **CV (PDF/Word)** dan **URL portofolio** saat mendaftar

### 🎨 UI/UX
- Desain bersih berbasis **Material Design 3** color system
- Sepenuhnya **responsif** (mobile-first)
- Navigasi kontekstual: subnavbar berbeda per peran
- Tombol kembali yang mengikuti riwayat navigasi sesungguhnya

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| **Backend** | Next.js Server Actions & API Routes |
| **Database** | PostgreSQL (`pg` driver) |
| **Auth** | Session berbasis cookie (`jose` / custom) + bcryptjs |
| **Icons** | Lucide React |
| **Tools** | ESLint, Node.js, npm |

---

## 🚀 Memulai Proyek

### Prasyarat

Pastikan kamu sudah menginstal:

- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [npm](https://www.npmjs.com/) (sudah termasuk dalam Node.js)
- [PostgreSQL](https://www.postgresql.org/) (lokal atau cloud)

### Instalasi

**1. Clone repositori**

```bash
git clone [https://github.com/username/creosphere-art-showcase-platform.git](https://github.com/username/creosphere-art-showcase-platform.git)
```

**2. Masuk ke direktori proyek**

```bash
cd creosphere-art-showcase-platform
```

**3. Install dependensi**

```bash
npm install
```

**4. Siapkan variabel lingkungan**

```bash
cp .env.example .env.local
```

Kemudian isi file `.env.local` dengan nilai yang sesuai:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/creosphere
SESSION_SECRET=your-secret-key-min-32-chars
```

**5. Siapkan database**

Jalankan file SQL berikut secara berurutan di PostgreSQL (via pgAdmin atau psql):

```bash
# 1. Buat skema tabel
psql -U postgres -d creosphere -f src/database/schema.sql

# 2. Isi data awal (opsional)
psql -U postgres -d creosphere -f src/database/seed.sql
```

**6. Jalankan server pengembangan**

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser kamu. 🎉

---

## 🔐 Akun Pengujian (Demo Accounts)

Jika kamu menjalankan `src/database/seed.sql`, tersedia 1 akun Admin, 8 akun Kurator, dan 11 akun Member/Seniman beserta 75 karya dan 10 challenge.  
**Kata sandi default untuk semua akun:** `Creosphere123`

### 🛡️ Admin
| Nama | Email | Status |
|------|-------|--------|
| **Admin Creosphere** | `admin@creosphere.test` | `approved` (Aktif) |

### 🏛️ Daftar Kurator
| Nama | Email | Afiliasi / Spesialisasi | Negara | Status |
|------|-------|-------------------------|--------|--------|
| **Fatoş Üstek** | `fatos.ustek@creosphere.test` | Independent Practice *(Painting, Sculpture & 3D Art, Contemporary Installations)* | Turki / Inggris | `approved` |
| **Larry Ossei-Mensah** | `larry.osseimensah@creosphere.test` | ARTNOIR / Independent *(Painting, Drawing, Mixed Media)* | Amerika Serikat | `approved` |
| **Naomi Beckwith** | `naomi.beckwith@creosphere.test` | The Guggenheim Museum *(Painting, Sculpture & 3D Art, Installation Art)* | Amerika Serikat | `approved` |
| **Rodrigo Moura** | `rodrigo.moura@creosphere.test` | MALBA *(Painting, Drawing, Photography)* | Argentina / Brasil | `approved` |
| **Doryun Chong** | `doryun.chong@creosphere.test` | M+ Museum *(Sculpture & 3D Art, Mixed Media, New Media Art)* | Hong Kong / Korea Selatan | `approved` |
| **Hans Ulrich Obrist** | `hans.ulrich.obrist@creosphere.test` | Serpentine Galleries *(Seni Kontemporer, Arsitektur, Pameran Lintas Disiplin)* | Swiss / Inggris | `approved` |
| **Kurator Pending Uji** | `curator.pending@creosphere.test` | Curator Independen *(Data uji verifikasi)* | — | `pending` |
| **Kurator Rejected Uji** | `curator.rejected@creosphere.test` | Curator Independen *(Data uji penolakan)* | — | `rejected` |

### 🎨 Daftar Member / Seniman
| Nama | Email | Negara | Fokus Karya | Status Akun |
|------|-------|--------|-------------|-------------|
| **Amoako Boafo** | `amoako.boafo@creosphere.test` | Ghana | Potret figuratif dengan sapuan jari khas | Nonaktif (`FALSE`) |
| **Felipe Pantone** | `felipe.pantone@creosphere.test` | Argentina / Spanyol | Karya optik & spektrum warna digital | Aktif (`TRUE`) |
| **Simone Leigh** | `simone.leigh@creosphere.test` | Amerika Serikat | Patung keramik, perunggu & serat alami | Aktif (`TRUE`) |
| **Nick Cave** | `nick.cave@creosphere.test` | Amerika Serikat | Patung kostum *Soundsuit* & *mixed media* | Aktif (`TRUE`) |
| **Chiharu Shiota** | `chiharu.shiota@creosphere.test` | Jepang | Instalasi jalinan benang & objek sehari-hari | Aktif (`TRUE`) |
| **Eko Nugroho** | `eko.nugroho@creosphere.test` | Indonesia | Lukisan, bordir tangan, patung & kritik sosial | Nonaktif (`FALSE`) |
| **CJ Hendry** | `cj.hendry@creosphere.test` | Australia | Gambar pensil/spidol hiperrealistik | Aktif (`TRUE`) |
| **JR** | `jr@creosphere.test` | Prancis | Seni jalanan & instalasi fotografi skala raksasa | Aktif (`TRUE`) |
| **Billie Zangewa** | `billie.zangewa@creosphere.test` | Malawi / Afrika Selatan | Kolase tekstil dari kain sutra jahit tangan | Aktif (`TRUE`) |
| **Natalia González Martín** | `natalia.gonzalez.martin@creosphere.test` | Spanyol | Lukisan figuratif bernuansa kontemplatif | Aktif (`TRUE`) |
| **Alicja Pakosz** | `alicja.pakosz@creosphere.test` | Polandia | Lukisan surealis & pengamatan keseharian | Aktif (`TRUE`) |

---

## 🗂️ Struktur Proyek

```text
creosphere-art-showcase-platform/
│
├── public/
│   ├── images/
│   │   ├── artworks/          # Gambar karya contoh (seed)
│   │   ├── banners/           # Banner challenge contoh
│   │   └── avatars/           # Avatar default
│   └── uploads/
│       ├── artworks/          # Upload karya member
│       ├── avatars/           # Upload avatar
│       ├── banners/           # Upload banner challenge
│       └── cv/                # CV kurator (PDF/Word)
│
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & Register
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (publik)/          # Halaman publik (tanpa autentikasi)
│   │   │   ├── page.jsx       # Beranda
│   │   │   ├── artworks/      # Galeri & detail karya
│   │   │   ├── artists/       # Daftar & profil seniman
│   │   │   ├── curators/      # Daftar & profil kurator
│   │   │   ├── challenges/    # Daftar & detail challenge
│   │   │   └── search/        # Hasil pencarian
│   │   ├── admin/             # Dashboard admin
│   │   │   ├── categories/
│   │   │   ├── curators/
│   │   │   ├── moderation/
│   │   │   └── users/
│   │   ├── curator/           # Dashboard kurator
│   │   │   └── (dashboard)/
│   │   ├── member/            # Dashboard member/seniman
│   │   │   ├── artworks/
│   │   │   ├── favorites/
│   │   │   ├── profile/
│   │   │   └── submissions/
│   │   └── api/               # API routes (upload, login, logout)
│   │
│   ├── components/
│   │   ├── auth/              # Form login, input sandi
│   │   ├── karya/             # Modal lapor, pencatat tayangan
│   │   ├── layout/            # Navbar, footer, sidebar, subnavbar
│   │   ├── member/            # Form karya
│   │   └── ui/                # Komponen UI reusable
│   │
│   ├── database/
│   │   ├── schema.sql         # Skema PostgreSQL
│   │   └── seed.sql           # Data awal
│   │
│   └── lib/
│       ├── auth.js            # Autentikasi & sesi
│       ├── db.js              # Koneksi PostgreSQL
│       ├── query.js           # Helper query
│       ├── challenge.js       # Logika status challenge
│       ├── format.js          # Format tanggal & angka
│       └── validasi.js        # Validasi input
│
├── .env.local                 # Variabel lingkungan (tidak di-commit)
├── next.config.mjs
├── eslint.config.mjs
├── jsconfig.json
└── package.json
```

---

## 💡 Cara Penggunaan

### Sebagai Member (Seniman)
1. Daftar akun baru → langsung aktif
2. Masuk ke dashboard → unggah karya dari menu **Unggah Karya**
3. Jelajahi challenge aktif → klik **Ikuti** untuk mengirim karya sebagai submisi
4. Pantau hasil di halaman **Submisi**
5. Simpan karya favorit di menu **Favorit**

### Sebagai Kurator
1. Daftar akun → upload **CV** (PDF/Word) dan isi **URL portofolio**
2. Tunggu persetujuan admin (status: *Menunggu Verifikasi*)
3. Setelah disetujui → buat challenge dari menu **Buat Challenge**
4. Pilih kategori, tanggal, hadiah, dan aturan challenge
5. Setelah challenge berakhir → pilih pemenang dari daftar submisi

### Sebagai Admin
1. Login dengan akun admin
2. Setujui atau tolak pendaftaran kurator di menu **Kurator**
3. Tinjau laporan karya di menu **Moderasi**
4. Kelola kategori dan pengguna di menu yang tersedia

---

## 🗄️ Skema Database

```text
users ──────────────────────────────────────────────────────────────────────┐
  id, display_name, email, role (admin|member|curator), status,             │
  avatar_url, headline, bio, country, cv_url, portfolio_url                 │
                                                                             │
artworks ──────────────────── artwork_tags ─── tags                         │
  id, user_id ──► users           │                                         │
  category_id ──► categories      │                                         │
  title, description, file_url                                               │
  like_count, view_count                                                     │
                                                                             │
categories          likes (user_id, artwork_id)                              │
  id, name          favorites (user_id, artwork_id)                          │
  is_system         comments (artwork_id, user_id, body)                     │
                    reports (artwork_id, reporter_id, reason, status)        │
                                                                             │
challenges ◄──────────────────────────────────────────────── users (curator)│
  id, curator_id, title, tagline, description, rules                         │
  prize, banner_url, start_date, end_date                                    │
      │                                                                      │
      ├── challenge_categories ──► categories                                │
      └── submissions ──► artworks                                           │
              └── winners (rank 1-3, curator_note)                           │
```

---

## 🤝 Kontribusi

Kontribusi, laporan isu, dan saran fitur sangat disambut! Silakan:

1. *Fork* repositori ini
2. Buat branch fitur baru: `git checkout -b fitur/nama-fitur`
3. Commit perubahanmu: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buka *Pull Request*

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **akademis** (Final Project Pemrograman Web).  
Tidak untuk distribusi atau penggunaan komersial tanpa izin.

---

## 👤 Author

**Creosphere** oleh Firah Nuraisyah (H071251053) Sistem Informasi, Universitas Hasanuddin.
