import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SUPABASE SQL SCHEMA  (run this in your Supabase SQL editor)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * -- Enable UUID extension
 * CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
 *
 * -- Profiles table (extends auth.users)
 * CREATE TABLE profiles (
 *   id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
 *   full_name TEXT NOT NULL,
 *   role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
 *   date_of_birth DATE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Classes table
 * CREATE TABLE classes (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   description TEXT,
 *   teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
 *   teacher_name TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Subjects table
 * CREATE TABLE subjects (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
 *   teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Chapters table
 * CREATE TABLE chapters (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
 *   teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Resources table
 * CREATE TABLE resources (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   description TEXT,
 *   drive_link TEXT NOT NULL,
 *   thumbnail_url TEXT,
 *   chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
 *   subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
 *   class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
 *   teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
 *   teacher_name TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- RLS Policies
 * ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
 *
 * -- Profiles: users can read all, only edit their own
 * CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
 * CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
 * CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
 *
 * -- Classes: anyone can read, only teachers can write
 * CREATE POLICY "classes_select" ON classes FOR SELECT USING (true);
 * CREATE POLICY "classes_insert" ON classes FOR INSERT WITH CHECK (
 *   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
 * );
 * CREATE POLICY "classes_update" ON classes FOR UPDATE USING (teacher_id = auth.uid());
 * CREATE POLICY "classes_delete" ON classes FOR DELETE USING (teacher_id = auth.uid());
 *
 * -- Subjects
 * CREATE POLICY "subjects_select" ON subjects FOR SELECT USING (true);
 * CREATE POLICY "subjects_insert" ON subjects FOR INSERT WITH CHECK (
 *   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
 * );
 * CREATE POLICY "subjects_update" ON subjects FOR UPDATE USING (teacher_id = auth.uid());
 * CREATE POLICY "subjects_delete" ON subjects FOR DELETE USING (teacher_id = auth.uid());
 *
 * -- Chapters
 * CREATE POLICY "chapters_select" ON chapters FOR SELECT USING (true);
 * CREATE POLICY "chapters_insert" ON chapters FOR INSERT WITH CHECK (
 *   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
 * );
 * CREATE POLICY "chapters_update" ON chapters FOR UPDATE USING (teacher_id = auth.uid());
 * CREATE POLICY "chapters_delete" ON chapters FOR DELETE USING (teacher_id = auth.uid());
 *
 * -- Resources
 * CREATE POLICY "resources_select" ON resources FOR SELECT USING (true);
 * CREATE POLICY "resources_insert" ON resources FOR INSERT WITH CHECK (
 *   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
 * );
 * CREATE POLICY "resources_update" ON resources FOR UPDATE USING (teacher_id = auth.uid());
 * CREATE POLICY "resources_delete" ON resources FOR DELETE USING (teacher_id = auth.uid());
 *
 * -- Trigger to auto-create profile on signup
 * CREATE OR REPLACE FUNCTION public.handle_new_user()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   INSERT INTO public.profiles (id, full_name, role, date_of_birth)
 *   VALUES (
 *     NEW.id,
 *     NEW.raw_user_meta_data->>'full_name',
 *     NEW.raw_user_meta_data->>'role',
 *     (NEW.raw_user_meta_data->>'date_of_birth')::DATE
 *   );
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 *
 * CREATE TRIGGER on_auth_user_created
 *   AFTER INSERT ON auth.users
 *   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
