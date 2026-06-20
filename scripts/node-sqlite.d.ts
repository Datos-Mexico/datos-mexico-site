// @types/node v20 todavía no incluye `node:sqlite` (experimental, llegó
// en Node 22). Declaración mínima de la superficie que usa el test del
// boletín. Cuando `@types/node` se actualice a v22+, este archivo
// puede borrarse.

declare module "node:sqlite" {
  export class StatementSync {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    iterate(...params: unknown[]): IterableIterator<unknown>;
  }

  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean });
    prepare(sql: string): StatementSync;
    exec(sql: string): void;
    close(): void;
    open(): void;
  }
}
