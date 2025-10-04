import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect('/race-tracker?error=missing_code');
  return NextResponse.redirect('/race-tracker?authorized=1&code=' + code);
}