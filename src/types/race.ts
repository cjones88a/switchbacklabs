export interface Participant {
  id: string;
  stravaId: number;
  firstName: string;
  lastName: string;
  email: string;
  stravaAccessToken: string;
  stravaRefreshToken: string;
  tokenExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceStage {
  id: string;
  name: string;
  stravaSegmentId: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  bonusMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceResult {
  id: string;
  participantId: string;
  stageId: string;
  stravaActivityId: number;
  timeInSeconds: number;
  date: Date;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  participant: Participant;
  stageResults: {
    [stageId: string]: {
      timeInSeconds: number;
      date: Date;
      isValid: boolean;
    };
  };
  totalTime: number;
  bonusApplied: boolean;
  rank: number;
}

export interface StravaSegmentEffort {
  id: number;
  activityId: number;
  elapsedTime: number;
  startDate: string;
  prRank?: number;
  achievements?: any[];
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  startDate: string;
  elapsedTime: number;
  movingTime: number;
  distance: number;
  averageSpeed: number;
  maxSpeed: number;
  segmentEfforts?: StravaSegmentEffort[];
}

export interface RaceConfig {
  id: string;
  name: string;
  description: string;
  bonusMinutes: number;
  isActive: boolean;
  stages: RaceStage[];
  createdAt: Date;
  updatedAt: Date;
}
