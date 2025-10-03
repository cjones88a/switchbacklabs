-- Race Tracker Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create participants table
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strava_id BIGINT UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  strava_access_token TEXT NOT NULL,
  strava_refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create race_config table
CREATE TABLE race_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  bonus_minutes INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create race_stages table
CREATE TABLE race_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_config_id UUID REFERENCES race_config(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  strava_segment_id BIGINT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  bonus_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create race_results table
CREATE TABLE race_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES race_stages(id) ON DELETE CASCADE,
  strava_activity_id BIGINT NOT NULL,
  time_in_seconds INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, stage_id, strava_activity_id)
);

-- Create indexes for better performance
CREATE INDEX idx_participants_strava_id ON participants(strava_id);
CREATE INDEX idx_race_stages_segment_id ON race_stages(strava_segment_id);
CREATE INDEX idx_race_stages_active ON race_stages(is_active);
CREATE INDEX idx_race_results_participant ON race_results(participant_id);
CREATE INDEX idx_race_results_stage ON race_results(stage_id);
CREATE INDEX idx_race_results_date ON race_results(date);
CREATE INDEX idx_race_results_valid ON race_results(is_valid);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_race_config_updated_at BEFORE UPDATE ON race_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_race_stages_updated_at BEFORE UPDATE ON race_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_race_results_updated_at BEFORE UPDATE ON race_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default race configuration
INSERT INTO race_config (name, description, bonus_minutes, is_active) VALUES
('4SOH Race 2025', 'Four Stages of Hell - Annual Race Series', 10, true);

-- Insert sample race stages (replace with actual Strava segment IDs)
INSERT INTO race_stages (race_config_id, name, strava_segment_id, start_date, end_date, is_active) VALUES
(
  (SELECT id FROM race_config WHERE is_active = true LIMIT 1),
  'Stage 1: Mountain Climb',
  12345678, -- Replace with actual Strava segment ID
  '2025-01-01 00:00:00+00',
  '2025-01-31 23:59:59+00',
  true
),
(
  (SELECT id FROM race_config WHERE is_active = true LIMIT 1),
  'Stage 2: Valley Sprint',
  87654321, -- Replace with actual Strava segment ID
  '2025-02-01 00:00:00+00',
  '2025-02-28 23:59:59+00',
  true
),
(
  (SELECT id FROM race_config WHERE is_active = true LIMIT 1),
  'Stage 3: Forest Trail',
  11223344, -- Replace with actual Strava segment ID
  '2025-03-01 00:00:00+00',
  '2025-03-31 23:59:59+00',
  true
),
(
  (SELECT id FROM race_config WHERE is_active = true LIMIT 1),
  'Stage 4: Final Descent',
  44332211, -- Replace with actual Strava segment ID
  '2025-04-01 00:00:00+00',
  '2025-04-30 23:59:59+00',
  true
);

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public read access to race config and stages
CREATE POLICY "Public read access to race config" ON race_config
    FOR SELECT USING (true);

CREATE POLICY "Public read access to race stages" ON race_stages
    FOR SELECT USING (true);

-- Allow public read access to race results
CREATE POLICY "Public read access to race results" ON race_results
    FOR SELECT USING (true);

-- Allow participants to read their own data
CREATE POLICY "Participants can read own data" ON participants
    FOR SELECT USING (auth.uid()::text = id::text);

-- Allow service role full access (for API operations)
CREATE POLICY "Service role full access to participants" ON participants
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to race config" ON race_config
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to race stages" ON race_stages
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to race results" ON race_results
    FOR ALL USING (auth.role() = 'service_role');
