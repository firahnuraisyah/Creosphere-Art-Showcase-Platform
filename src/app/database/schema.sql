    -- ============================================================================
    -- Creosphere — Skema Database (PostgreSQL)
    -- Jalankan file ini LEBIH DULU, baru seed.sql (lewat pgAdmin: Query Tool).
    -- Peringatan: bagian DROP di bawah menghapus tabel lama agar skema bisa dijalankan ulang.
    -- ============================================================================

    DROP TABLE IF EXISTS winners CASCADE;
    DROP TABLE IF EXISTS submissions CASCADE;
    DROP TABLE IF EXISTS challenge_categories CASCADE;
    DROP TABLE IF EXISTS challenges CASCADE;
    DROP TABLE IF EXISTS reports CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS favorites CASCADE;
    DROP TABLE IF EXISTS likes CASCADE;
    DROP TABLE IF EXISTS artwork_tags CASCADE;
    DROP TABLE IF EXISTS tags CASCADE;
    DROP TABLE IF EXISTS artworks CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- ----------------------------------------------------------------------------
    -- users: Admin, Member (artist), dan Curator
    -- ----------------------------------------------------------------------------
    CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    display_name    VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(100) NOT NULL,
    role            VARCHAR(10)  NOT NULL,
    status          VARCHAR(10)  NOT NULL DEFAULT 'approved',
    avatar_url      VARCHAR(255),
    headline        VARCHAR(100),
    bio             TEXT,
    country         VARCHAR(60),
    external_links  TEXT,
    specialization  VARCHAR(100),
    affiliation     VARCHAR(100),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT users_role_check   CHECK (role IN ('admin', 'member', 'curator')),
    CONSTRAINT users_status_check CHECK (status IN ('approved', 'pending', 'rejected')),
    -- Hanya Curator yang boleh berstatus pending/rejected
    CONSTRAINT users_status_role_check CHECK (role = 'curator' OR status = 'approved'),
    CONSTRAINT users_email_lowercase_check CHECK (email = LOWER(email)),
    CONSTRAINT users_display_name_check CHECK (LENGTH(TRIM(display_name)) > 0),
    CONSTRAINT users_bio_check CHECK (bio IS NULL OR LENGTH(bio) <= 500)
    );

    -- ----------------------------------------------------------------------------
    -- categories: tujuh kategori (Other = kategori sistem)
    -- ----------------------------------------------------------------------------
    CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    is_system   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT categories_name_check CHECK (LENGTH(TRIM(name)) > 0)
    );
    -- Nama unik tanpa membedakan huruf besar/kecil
    CREATE UNIQUE INDEX categories_name_unik ON categories (LOWER(name));

    -- ----------------------------------------------------------------------------
    -- artworks
    -- (Aturan "artwork_type wajib bila kategori Other" divalidasi di Server Action)
    -- ----------------------------------------------------------------------------
    CREATE TABLE artworks (
    id            SERIAL PRIMARY KEY,
    user_id       INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id   INT          NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title         VARCHAR(100) NOT NULL,
    description   TEXT         NOT NULL,
    artwork_type  VARCHAR(60),
    file_url      VARCHAR(255) NOT NULL,
    view_count    INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT artworks_title_check CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT artworks_view_count_check CHECK (view_count >= 0)
    );
    CREATE INDEX artworks_user_idx     ON artworks (user_id);
    CREATE INDEX artworks_category_idx ON artworks (category_id);
    CREATE INDEX artworks_created_idx  ON artworks (created_at DESC);

    -- ----------------------------------------------------------------------------
    -- tags (huruf kecil, unik) dan tabel penghubung artwork_tags
    -- ----------------------------------------------------------------------------
    CREATE TABLE tags (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(30) NOT NULL UNIQUE,
    CONSTRAINT tags_name_lowercase_check CHECK (name = LOWER(name) AND LENGTH(TRIM(name)) > 0)
    );

    CREATE TABLE artwork_tags (
    artwork_id  INT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    tag_id      INT NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
    PRIMARY KEY (artwork_id, tag_id)
    );

    -- ----------------------------------------------------------------------------
    -- likes dan favorites (satu per Member per karya)
    -- ----------------------------------------------------------------------------
    CREATE TABLE likes (
    user_id     INT       NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    artwork_id  INT       NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, artwork_id)
    );
    CREATE INDEX likes_artwork_idx ON likes (artwork_id);

    CREATE TABLE favorites (
    user_id     INT       NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    artwork_id  INT       NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, artwork_id)
    );

    -- ----------------------------------------------------------------------------
    -- comments
    -- ----------------------------------------------------------------------------
    CREATE TABLE comments (
    id          SERIAL PRIMARY KEY,
    artwork_id  INT          NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_id     INT          NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    body        VARCHAR(500) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT comments_body_check CHECK (LENGTH(TRIM(body)) > 0)
    );
    CREATE INDEX comments_artwork_idx ON comments (artwork_id);

    -- ----------------------------------------------------------------------------
    -- reports (laporan karya) — satu laporan per pelapor per karya
    -- ----------------------------------------------------------------------------
    CREATE TABLE reports (
    id           SERIAL PRIMARY KEY,
    artwork_id   INT         NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    reporter_id  INT         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    reason       VARCHAR(50) NOT NULL,
    note         TEXT,
    status       VARCHAR(10) NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT reports_status_check CHECK (status IN ('pending', 'dismissed', 'resolved')),
    CONSTRAINT reports_unik UNIQUE (artwork_id, reporter_id)
    );
    CREATE INDEX reports_status_idx ON reports (status);

    -- ----------------------------------------------------------------------------
    -- challenges (status belum_mulai/aktif/berakhir TIDAK disimpan; dihitung dari tanggal)
    -- ----------------------------------------------------------------------------
    CREATE TABLE challenges (
    id           SERIAL PRIMARY KEY,
    curator_id   INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(100) NOT NULL,
    tagline      VARCHAR(150),
    description  TEXT         NOT NULL,
    rules        TEXT         NOT NULL,
    prize        VARCHAR(150),
    banner_url   VARCHAR(255),
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT challenges_tanggal_check CHECK (end_date > start_date),
    CONSTRAINT challenges_title_check   CHECK (LENGTH(TRIM(title)) > 0)
    );
    CREATE INDEX challenges_curator_idx ON challenges (curator_id);

    -- Kategori yang diizinkan per challenge (bila kosong = semua kategori diizinkan)
    CREATE TABLE challenge_categories (
    challenge_id  INT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    category_id   INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (challenge_id, category_id)
    );

    -- ----------------------------------------------------------------------------
    -- submissions: maksimal 1 per Member per challenge
    -- ----------------------------------------------------------------------------
    CREATE TABLE submissions (
    id            SERIAL PRIMARY KEY,
    challenge_id  INT       NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id       INT       NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
    artwork_id    INT       NOT NULL REFERENCES artworks(id)   ON DELETE CASCADE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT submissions_unik UNIQUE (challenge_id, user_id)
    );
    CREATE INDEX submissions_artwork_idx ON submissions (artwork_id);

    -- ----------------------------------------------------------------------------
    -- winners: maksimal 3 pemenang (peringkat 1-3) per challenge
    -- ----------------------------------------------------------------------------
    CREATE TABLE winners (
    id             SERIAL PRIMARY KEY,
    challenge_id   INT       NOT NULL REFERENCES challenges(id)  ON DELETE CASCADE,
    submission_id  INT       NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
    rank           INT       NOT NULL,
    curator_note   TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT winners_rank_check CHECK (rank BETWEEN 1 AND 3),
    CONSTRAINT winners_rank_unik  UNIQUE (challenge_id, rank)
    );
