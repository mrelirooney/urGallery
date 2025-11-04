// src/app/api/search/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q) return NextResponse.json({ results: [] });

  const base = process.env.DJANGO_BASE_URL || "http://127.0.0.1:8000";
  const url = `${base}/api/artists/search/?q=${encodeURIComponent(q)}`;

  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) return NextResponse.json({ results: [] }, { status: 200 });

  const data = await resp.json();
  return NextResponse.json(data);
}
