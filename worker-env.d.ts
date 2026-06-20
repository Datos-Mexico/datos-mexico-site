/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    NEWSLETTER_DB?: D1Database;
  }
}

export {};
