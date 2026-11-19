    import { Pool, types } from "pg";

    types.setTypeParser(1082, (nilai) => nilai);

    types.setTypeParser(20, (nilai) => parseInt(nilai, 10));

    const pool =
    globalThis.__creosphere_pool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 3000,
    });

    if (process.env.NODE_ENV !== "production") {
    globalThis.__creosphere_pool = pool;
    }

    export default pool;
