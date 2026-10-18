-- ════════════════════════════════════════════════════════════════
-- VASTRA SHASTRA · SUPABASE MASTER SCHEMA
-- Paste this entire script into your Supabase Dashboard -> SQL Editor and click "Run"
-- ════════════════════════════════════════════════════════════════

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CURRICULUM TABLES
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  short TEXT,
  description TEXT,
  accent_color TEXT DEFAULT '#b65a36',
  image_url TEXT,
  image_credit TEXT,
  style_theme TEXT DEFAULT 'indian',
  difficulty TEXT DEFAULT 'intermediate',
  weeks INT DEFAULT 6,
  capstone_project TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS course_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  number INT NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'lecture',
  duration_minutes INT DEFAULT 45
);

CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT,
  color TEXT,
  lesson_count INT DEFAULT 4,
  style_theme TEXT DEFAULT 'general'
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  number INT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  duration_minutes INT DEFAULT 15,
  video_url TEXT,
  content_md TEXT,
  principle TEXT,
  formula_label TEXT,
  formula_value TEXT,
  formula_note TEXT,
  has_canvas_exercise BOOLEAN DEFAULT false,
  has_quiz BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'pdf',
  url TEXT NOT NULL,
  size_label TEXT
);

-- 3. MATHEMATICS & FORMULAS
CREATE TABLE IF NOT EXISTS formulas (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  formula_latex TEXT,
  formula_plain TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  inputs TEXT[] DEFAULT '{}',
  output_label TEXT,
  typical_range TEXT,
  notes TEXT,
  garment_types TEXT[] DEFAULT '{}',
  region TEXT DEFAULT 'general',
  linked_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL
);

-- 4. COLOUR & SKIN TONES
CREATE TABLE IF NOT EXISTS colour_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  theory_type TEXT NOT NULL,
  colors JSONB NOT NULL,
  occasion TEXT[] DEFAULT '{}',
  style_theme TEXT DEFAULT 'indian'
);

CREATE TABLE IF NOT EXISTS skin_tone_library (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hex TEXT NOT NULL,
  undertone TEXT NOT NULL,
  common_region TEXT,
  complementary_hues TEXT[] DEFAULT '{}'
);

-- 5. RESOURCE LIBRARY
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'pdf',
  url TEXT NOT NULL,
  size_label TEXT,
  icon TEXT,
  category TEXT DEFAULT 'patterns',
  style_theme TEXT DEFAULT 'general',
  is_downloadable BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

-- 6. STUDENTS & LEARNING PROGRESS
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  placement_score INT DEFAULT 0,
  level TEXT DEFAULT 'foundation',
  streak_days INT DEFAULT 1,
  last_active_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS student_progress (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started',
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS topic_mastery (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  score NUMERIC DEFAULT 0,
  attempt_count INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, topic)
);

CREATE TABLE IF NOT EXISTS studio_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Katori blouse — fitting study',
  content TEXT,
  measurements JSONB DEFAULT '{"bust":88, "waist":72, "hip":96, "shoulder":38}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BADGES
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT DEFAULT 'general'
);

CREATE TABLE IF NOT EXISTS student_badges (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  badge_id TEXT REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, badge_id)
);

-- 8. ATTEMPTS & AI HISTORY
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  difficulty TEXT DEFAULT 'intermediate',
  style_theme TEXT DEFAULT 'indian',
  challenge_prompt TEXT,
  overall_score INT DEFAULT 0,
  time_taken_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  gemini_report JSONB DEFAULT '{}',
  sketch_data JSONB DEFAULT '{}',
  dieline_data JSONB DEFAULT '{}',
  colour_data JSONB DEFAULT '{}',
  quiz_data JSONB DEFAULT '{}',
  math_assessment JSONB DEFAULT '{}',
  badges_earned TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL,
  topic_tags TEXT[] DEFAULT '{}',
  questions JSONB DEFAULT '[]',
  total_score INT DEFAULT 0,
  time_taken_seconds INT DEFAULT 0,
  weak_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE colour_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_tone_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Public read access for curriculum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read courses') THEN
    CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read modules') THEN
    CREATE POLICY "Public read modules" ON modules FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read lessons') THEN
    CREATE POLICY "Public read lessons" ON lessons FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read formulas') THEN
    CREATE POLICY "Public read formulas" ON formulas FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read resources') THEN
    CREATE POLICY "Public read resources" ON resources FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read palettes') THEN
    CREATE POLICY "Public read palettes" ON colour_palettes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read skin tones') THEN
    CREATE POLICY "Public read skin tones" ON skin_tone_library FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read badges') THEN
    CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);
  END IF;
END $$;

-- Student RLS (service role can bypass, anon can read/write own based on student_id or public demo student)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access students') THEN
    CREATE POLICY "Service role full access students" ON students FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access attempts') THEN
    CREATE POLICY "Service role full access attempts" ON attempts FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access notes') THEN
    CREATE POLICY "Service role full access notes" ON studio_notes FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access progress') THEN
    CREATE POLICY "Service role full access progress" ON student_progress FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access mastery') THEN
    CREATE POLICY "Service role full access mastery" ON topic_mastery FOR ALL USING (true);
  END IF;
END $$;
