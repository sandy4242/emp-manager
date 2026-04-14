-- ============================================
-- Employee Manager Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT NOT NULL,
  emp_code TEXT NOT NULL,
  e_code TEXT,
  emp_name TEXT NOT NULL,
  emp_father_name TEXT NOT NULL,
  esic_no TEXT,
  uan_no TEXT,
  mobile_no TEXT NOT NULL,
  aadhaar_no TEXT NOT NULL,
  epfo_joining TEXT,
  pan_no TEXT,
  dob DATE NOT NULL,
  doj DATE NOT NULL,
  gender TEXT NOT NULL,
  pay_day INTEGER,
  department_name TEXT NOT NULL,
  nominee_name TEXT,
  relation_name TEXT,
  qualification TEXT,
  present_address TEXT NOT NULL,
  permanent_address TEXT,
  district_name TEXT,
  state_name TEXT,
  pin_code TEXT,
  ifsc_code TEXT,
  account_no TEXT,
  narration TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (anon key)
-- Since we handle auth ourselves via JWT, we allow anon access
CREATE POLICY "Allow all access" ON employees
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_admin_id ON employees(admin_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);

-- ============================================
-- Admins Table
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to admins" ON admins FOR ALL USING (true) WITH CHECK (true);

-- Insert default admins
INSERT INTO admins (id, admin_id, password_hash, name) VALUES 
('4f2e960f-df13-44f2-95f3-52467d022b31', 'admin1', '$2b$10$1eAReoYjVzrcFm.x8a6bAekns7JI1hTi7L43tAxcpsFe8C1mzwK1S', 'Administrator 1'),
('a5e11d29-cde8-48b2-b4ea-17614d9b8969', 'admin2', '$2b$10$1eAReoYjVzrcFm.x8a6bAekns7JI1hTi7L43tAxcpsFe8C1mzwK1S', 'Administrator 2'),
('fe3b2aae-222a-436d-8dc8-d567ea3a3ca7', 'admin3', '$2b$10$1eAReoYjVzrcFm.x8a6bAekns7JI1hTi7L43tAxcpsFe8C1mzwK1S', 'Administrator 3')
ON CONFLICT (admin_id) DO NOTHING;
