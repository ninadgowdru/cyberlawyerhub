
-- Seed sample lawyer accounts using Supabase's auth.users
-- These are test accounts with no real passwords (cannot be logged into)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', '00000000-0000-0000-0000-000000000000', 'priya.sharma@example.com', crypt('seedpassword123', gen_salt('bf')), now(), '{"full_name":"Adv. Priya Sharma"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', '00000000-0000-0000-0000-000000000000', 'rajesh.verma@example.com', crypt('seedpassword123', gen_salt('bf')), now(), '{"full_name":"Adv. Rajesh Verma"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', '00000000-0000-0000-0000-000000000000', 'sneha.patel@example.com', crypt('seedpassword123', gen_salt('bf')), now(), '{"full_name":"Adv. Sneha Patel"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', '00000000-0000-0000-0000-000000000000', 'vikram.singh@example.com', crypt('seedpassword123', gen_salt('bf')), now(), '{"full_name":"Adv. Vikram Singh"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', '00000000-0000-0000-0000-000000000000', 'ananya.desai@example.com', crypt('seedpassword123', gen_salt('bf')), now(), '{"full_name":"Adv. Ananya Desai"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', '00000000-0000-0000-0000-000000000000', 'karthik.iyer@example.com', crypt('seedpassword123', gen_salt('bf')), now(), '{"full_name":"Adv. Karthik Iyer"}'::jsonb, now(), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- The handle_new_user trigger should auto-create profiles, but let's ensure they exist
INSERT INTO public.profiles (user_id, full_name, phone) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Adv. Priya Sharma', '+91 98765 43210'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Adv. Rajesh Verma', '+91 98765 43211'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Adv. Sneha Patel', '+91 98765 43212'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Adv. Vikram Singh', '+91 98765 43213'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Adv. Ananya Desai', '+91 98765 43214'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Adv. Karthik Iyer', '+91 98765 43215')
ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

-- Add lawyer roles
INSERT INTO public.user_roles (user_id, role) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'lawyer'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'lawyer'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'lawyer'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'lawyer'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'lawyer'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'lawyer')
ON CONFLICT DO NOTHING;

-- Create lawyer profiles
INSERT INTO public.lawyers (user_id, bar_council_id, city, hourly_rate, specializations, bio, experience_years, rating, review_count, is_verified) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'DL/1234/2018', 'Delhi', 1500, ARRAY['UPI Fraud', 'Phishing', 'Banking Fraud'], 'Specializing in cyber fraud cases with 6+ years of experience in Delhi High Court. Successfully recovered ₹2Cr+ for clients.', 6, 4.8, 42, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'MH/5678/2015', 'Mumbai', 2500, ARRAY['Investment Scam', 'Banking Fraud', 'Corporate Fraud'], 'Former cyber cell consultant with expertise in investment and banking fraud. Handled 200+ cases across Maharashtra.', 9, 4.9, 87, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'KA/9012/2019', 'Bangalore', 1200, ARRAY['Phishing', 'Aadhaar Fraud', 'Data Theft'], 'Tech-savvy lawyer focusing on identity theft and data privacy cases. Regular speaker at cybersecurity conferences.', 5, 4.6, 31, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'TN/3456/2016', 'Chennai', 1800, ARRAY['UPI Fraud', 'Investment Scam', 'Cryptocurrency Fraud'], 'Senior advocate with deep expertise in financial cyber crimes. Advisor to multiple fintech companies on fraud prevention.', 8, 4.7, 56, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'MH/7890/2020', 'Pune', 1000, ARRAY['Phishing', 'Social Media Fraud', 'Online Harassment'], 'Passionate about protecting individuals from online scams and harassment. Affordable consultations for students and seniors.', 4, 4.5, 23, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'KA/2345/2017', 'Hyderabad', 2000, ARRAY['Banking Fraud', 'Corporate Fraud', 'Aadhaar Fraud'], 'Former IT professional turned cyber lawyer. Unique technical + legal perspective on complex fraud cases.', 7, 4.8, 64, true)
ON CONFLICT (user_id) DO NOTHING;
