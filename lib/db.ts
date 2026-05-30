/**
 * MySQL connection pool — used only at build time (getStaticProps / getStaticPaths).
 * Never imported by client-side code.
 */
import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.DB_HOST     || '127.0.0.1',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'countrypick',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 60000,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

/** Convenience wrapper — returns rows typed as T[]. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values?: any[]
): Promise<T[]> {
  const [rows] = await getPool().execute(sql, values);
  return rows as T[];
}
