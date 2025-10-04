import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    console.log('🔗 Strava callback received:', req.url);
    
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    console.log('📋 Callback params:', { code: code ? 'present' : 'missing', state, error });
    
    if (error) {
      console.error('❌ Strava OAuth error:', error);
      return NextResponse.redirect('/race-tracker?error=' + encodeURIComponent(error));
    }
    
    if (!code) {
      console.error('❌ Missing authorization code');
      return NextResponse.redirect('/race-tracker?error=missing_code');
    }
    
    console.log('✅ Redirecting to race-tracker with code');
    return NextResponse.redirect('/race-tracker?authorized=1&code=' + code);
    
  } catch (error) {
    console.error('💥 Callback route error:', error);
    return NextResponse.redirect('/race-tracker?error=callback_failed');
  }
}