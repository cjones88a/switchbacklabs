import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ recorded:false, reason:'not_implemented' }, { status: 501 });
}
