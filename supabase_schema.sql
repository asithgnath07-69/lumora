-- ============================================================
--  LUMORA — Supabase SQL Schema
--  Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- TABLES
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  date_of_birth DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classes (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  teacher_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  teacher_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT NOT NULL,
  class_id   UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resources (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  drive_link    TEXT NOT NULL,
  thumbnail_url TEXT,
  chapter_id    UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  subject_id    UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  class_id      UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  teacher_name  TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────

ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Classes
CREATE POLICY "classes_select" ON public.classes FOR SELECT USING (true);
CREATE POLICY "classes_insert" ON public.classes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "classes_update" ON public.classes FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "classes_delete" ON public.classes FOR DELETE USING (teacher_id = auth.uid());

-- Subjects
CREATE POLICY "subjects_select" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "subjects_insert" ON public.subjects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "subjects_update" ON public.subjects FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "subjects_delete" ON public.subjects FOR DELETE USING (teacher_id = auth.uid());

-- Chapters
CREATE POLICY "chapters_select" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "chapters_insert" ON public.chapters FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "chapters_update" ON public.chapters FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "chapters_delete" ON public.chapters FOR DELETE USING (teacher_id = auth.uid());

-- Resources
CREATE POLICY "resources_select" ON public.resources FOR SELECT USING (true);
CREATE POLICY "resources_insert" ON public.resources FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "resources_update" ON public.resources FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "resources_delete" ON public.resources FOR DELETE USING (teacher_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, date_of_birth)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
