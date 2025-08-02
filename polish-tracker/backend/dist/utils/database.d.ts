import { Pool } from 'pg';
declare const pool: Pool;
export default pool;
export declare const withTransaction: <T>(callback: (client: any) => Promise<T>) => Promise<T>;
export declare const query: (text: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
//# sourceMappingURL=database.d.ts.map