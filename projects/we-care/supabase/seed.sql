-- ============================================================
-- Seed Data — Specialists
-- Run this after schema.sql
-- ============================================================

INSERT INTO specialists (full_name, specialty, hospital, phone, available) VALUES
  ('Dr. Sarah Kim',    'Cardiology',    'Apollo Hospital',        '+1-555-0101', TRUE),
  ('Dr. James Patel',  'Neurology',     'City Medical Center',    '+1-555-0102', TRUE),
  ('Dr. Emily Chen',   'Orthopedics',   'Metro Hospital',         '+1-555-0103', TRUE),
  ('Dr. Raj Sharma',   'Dermatology',   'Skin & Care Clinic',     '+1-555-0104', TRUE),
  ('Dr. Anna White',   'Psychiatry',    'Wellness Center',        '+1-555-0105', TRUE),
  ('Dr. Michael Brown','Oncology',      'Cancer Care Institute',  '+1-555-0106', TRUE),
  ('Dr. Priya Singh',  'Pediatrics',    'City Children Hospital', '+1-555-0107', TRUE),
  ('Dr. David Lee',    'Ophthalmology', 'Eye Care Clinic',        '+1-555-0108', TRUE);
