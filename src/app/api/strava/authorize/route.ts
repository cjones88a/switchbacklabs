import { NextResponse } from 'next/server';
import { getAuthorizeURL } from '@/lib/strava';
export async function GET() { return NextResponse.redirect(getAuthorizeURL('state-4soh')); }
