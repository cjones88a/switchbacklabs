import { NextResponse } from 'next/server';

export async function GET() {
  // For now, return a default season key
  // In a real app, this would determine the current active season
  return NextResponse.text("2025_FALL");
}
