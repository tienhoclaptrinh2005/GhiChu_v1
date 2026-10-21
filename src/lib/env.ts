import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(20),
  ADMIN_EMAIL: z.email(),
});

const r2EnvSchema = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.url().optional(),
  R2_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(900),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().positive().max(100).default(10),
});

export function isSupabaseConfigured() {
  return publicEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }).success;
}

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    ...getPublicEnv(),
    SUPABASE_SECRET_KEY:
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  });
}

export function getR2Env() {
  return r2EnvSchema.parse({
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL || undefined,
    R2_SIGNED_URL_TTL_SECONDS: process.env.R2_SIGNED_URL_TTL_SECONDS,
    UPLOAD_MAX_FILE_SIZE_MB: process.env.UPLOAD_MAX_FILE_SIZE_MB,
  });
}
