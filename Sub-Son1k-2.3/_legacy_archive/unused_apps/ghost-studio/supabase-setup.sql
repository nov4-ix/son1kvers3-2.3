-- Ghost Studio - Supabase Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ghost-audio', 
  'ghost-audio', 
  true, 
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm']
) ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies
-- Public read access for all files
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'ghost-audio');

-- Allow anyone to upload (for demo purposes)
-- In production, you might want to restrict this to authenticated users
CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ghost-audio');

-- Allow users to update their own files
CREATE POLICY "Public update access" ON storage.objects
FOR UPDATE USING (bucket_id = 'ghost-audio');

-- Allow users to delete their own files
CREATE POLICY "Public delete access" ON storage.objects
FOR DELETE USING (bucket_id = 'ghost-audio');

-- 3. Create tables for session management (optional)
CREATE TABLE IF NOT EXISTS ghost_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_file_path TEXT,
  analysis_data JSONB,
  knob_settings JSONB,
  user_description TEXT,
  generated_task_id TEXT,
  generated_audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ghost_sessions_user_id ON ghost_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_sessions_created_at ON ghost_sessions(created_at);

-- 5. Enable Row Level Security
ALTER TABLE ghost_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for sessions
CREATE POLICY "Users can view own sessions" ON ghost_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON ghost_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON ghost_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON ghost_sessions
FOR DELETE USING (auth.uid() = user_id);

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for updated_at
CREATE TRIGGER update_ghost_sessions_updated_at 
    BEFORE UPDATE ON ghost_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- 10. Verify setup
SELECT 
  'Storage bucket created' as status,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'ghost-audio';

SELECT 
  'Policies created' as status,
  count(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
