import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ services: [] });
}

export async function POST() {
  return NextResponse.json({ service: null });
}
