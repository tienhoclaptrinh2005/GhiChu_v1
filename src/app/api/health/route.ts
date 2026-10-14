import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        supabaseConfigured: isSupabaseConfigured(),
        r2Configured: Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_BUCKET_NAME),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
