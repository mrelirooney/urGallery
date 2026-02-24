// src/app/api/search/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q) return NextResponse.json({ results: [] });

  const base = process.env.NEXT_PUBLIC_API_BASE || process.env.DJANGO_BASE_URL || "http://localhost:8000";
  const normalizedBase = base.replace(/\/+$/, "").replace(/\/api$/, "");
  const url = `${normalizedBase}/api/artists/search/?q=${encodeURIComponent(q)}`;

  // Forward cookies from the client request to Django
  const cookieHeader = req.headers.get("cookie");
  const headers: HeadersInit = {};
  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  try {
    const resp = await fetch(url, { 
      cache: "no-store",
      headers,
    });
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("Search API error:", resp.status, resp.statusText, errorText);
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search fetch error:", error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}