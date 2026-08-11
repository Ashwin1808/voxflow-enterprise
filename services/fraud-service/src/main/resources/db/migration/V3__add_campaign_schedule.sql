CREATE TABLE IF NOT EXISTS campaign_schedule_meta ();
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS scheduled_start_at TIMESTAMP WITH TIME ZONE;
DROP TABLE IF EXISTS campaign_schedule_meta;