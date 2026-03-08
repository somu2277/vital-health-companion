-- Create reminder_settings table for user preferences
CREATE TABLE public.reminder_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  water_enabled boolean NOT NULL DEFAULT true,
  medicine_enabled boolean NOT NULL DEFAULT true,
  sleep_enabled boolean NOT NULL DEFAULT true,
  activity_enabled boolean NOT NULL DEFAULT true,
  water_interval_hours integer NOT NULL DEFAULT 2,
  quiet_start text NOT NULL DEFAULT '22:00',
  quiet_end text NOT NULL DEFAULT '07:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.reminder_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.reminder_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.reminder_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);