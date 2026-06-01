import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ service: null });
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
