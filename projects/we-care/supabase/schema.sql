-- ============================================================
-- RefAI Schema
-- Team: We Care
-- ============================================================

-- Doctors (linked to Supabase Auth)
CREATE TABLE doctors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specialists (pre-seeded, not users)
CREATE TABLE specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital TEXT NOT NULL,
  phone TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients (created when referral is submitted)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  email TEXT,
  phone TEXT,
  medical_history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals (core table)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  extracted_data JSONB,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')) DEFAULT 'low',
  status TEXT CHECK (status IN ('pending', 'sent', 'accepted', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on referral changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Patient access tokens (token-based portal, no password required)
CREATE TABLE patient_tokens (
  token TEXT PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments (patient books via portal after receiving referral link)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('requested', 'confirmed', 'cancelled')) DEFAULT 'requested',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sync referral status when patient books or confirms appointment
CREATE OR REPLACE FUNCTION sync_referral_status_on_appointment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'requested' THEN
    UPDATE referrals SET status = 'accepted' WHERE id = NEW.referral_id;
  END IF;
  IF NEW.status = 'confirmed' THEN
    UPDATE referrals SET status = 'completed' WHERE id = NEW.referral_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_sync_referral_status
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION sync_referral_status_on_appointment();
