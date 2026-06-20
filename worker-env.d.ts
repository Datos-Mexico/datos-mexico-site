/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    NEWSLETTER_DB?: D1Database;
    RESEND_API_KEY?: string;
    NEWSLETTER_FROM?: string;
    NEWSLETTER_REPLY_TO?: string;
  }
}

export {};
