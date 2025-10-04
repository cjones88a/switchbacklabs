import axios from 'axios';
import { StravaActivity, StravaSegmentEffort } from '@/types/race';

export class StravaAPI {
  private baseURL = 'https://www.strava.com/api/v3';
  private clientId: string;
  private clientSecret: string;

  constructor() {
    // Use environment variables or fallback to hardcoded values for production
    this.clientId = process.env.STRAVA_CLIENT_ID || '179098';
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET || 'e42d5b7d7ce04b98ab1f34a878e66aa12653d9aa';
  }

  // OAuth 2.0 Authentication
  async getAuthURL(redirectUri: string, state?: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read,activity:read_all',
      state: state || 'race_tracker'
    });

    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string) {
    console.log('🔄 StravaAPI: Exchanging code for token', { 
      codeLength: code.length, 
      redirectUri,
      clientId: this.clientId ? 'present' : 'missing',
      clientSecret: this.clientSecret ? 'present' : 'missing'
    });
    
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });
    
    console.log('✅ StravaAPI: Token exchange response received');

    const data = response.data as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      athlete: unknown;
    };
    
    console.log('✅ StravaAPI: Token data processed successfully');
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      athlete: data.athlete
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const data = response.data as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    };
  }

  // API Methods
  private async makeAuthenticatedRequest(
    endpoint: string, 
    accessToken: string, 
    params?: Record<string, string | number>
  ) {
    const response = await axios.get(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params
    });

    return response.data;
  }

  async getAthlete(accessToken: string) {
    return this.makeAuthenticatedRequest('/athlete', accessToken);
  }

  async getSegmentEfforts(
    segmentId: number, 
    accessToken: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<StravaSegmentEffort[]> {
    const params: Record<string, string | number> = {
      segment_id: segmentId,
      per_page: 200
    };

    if (startDate) {
      params.start_date_local = startDate.toISOString();
    }
    if (endDate) {
      params.end_date_local = endDate.toISOString();
    }

    return this.makeAuthenticatedRequest('/segment_efforts', accessToken, params) as Promise<StravaSegmentEffort[]>;
  }

  async getActivity(activityId: number, accessToken: string): Promise<StravaActivity> {
    return this.makeAuthenticatedRequest(`/activities/${activityId}`, accessToken) as Promise<StravaActivity>;
  }

  async getAthleteActivities(
    accessToken: string, 
    before?: Date, 
    after?: Date, 
    perPage: number = 200
  ): Promise<StravaActivity[]> {
    const params: Record<string, string | number> = {
      per_page: perPage
    };

    if (before) {
      params.before = Math.floor(before.getTime() / 1000);
    }
    if (after) {
      params.after = Math.floor(after.getTime() / 1000);
    }

    return this.makeAuthenticatedRequest('/athlete/activities', accessToken, params) as Promise<StravaActivity[]>;
  }

  // Utility method to check if token is expired
  isTokenExpired(expiresAt: Date): boolean {
    return new Date() >= expiresAt;
  }

  // Method to get valid access token (refresh if needed)
  async getValidAccessToken(
    accessToken: string, 
    refreshToken: string, 
    expiresAt: Date
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    if (this.isTokenExpired(expiresAt)) {
      return this.refreshAccessToken(refreshToken);
    }
    
    return {
      accessToken,
      refreshToken,
      expiresAt
    };
  }
}
