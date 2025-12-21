-- Add email notification columns to competitor_alerts
ALTER TABLE competitor_alerts 
ADD COLUMN IF NOT EXISTS send_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_priority TEXT DEFAULT 'normal';