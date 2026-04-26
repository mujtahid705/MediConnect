-- ============================================================================
-- SUPABASE DATABASE SETUP FOR MULTIUSER HEALTH APPOINTMENT SYSTEM
-- ============================================================================
-- NOTE: Please run the following DROP commands first if you already have tables:
-- DROP TABLE IF EXISTS public.appointments CASCADE;
-- DROP TABLE IF EXISTS public.patients CASCADE;
-- DROP TABLE IF EXISTS public.doctors CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- 1. CREATE ENUMS FOR ROLES
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'patient', 'doctor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CREATE USER TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

-- 3. CREATE PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  blood_group TEXT NOT NULL,
  nid TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  emergency_contact TEXT,
  medical_conditions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

-- 4. CREATE DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  blood_group TEXT NOT NULL,
  nid TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  license TEXT NOT NULL,
  designation TEXT NOT NULL,
  specialty TEXT NOT NULL,
  institution TEXT NOT NULL,
  degrees JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES

-- Users can view their own record
DROP POLICY IF EXISTS "Users can view own user record" ON public.users;
CREATE POLICY "Users can view own user record"
ON public.users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own user record" ON public.users;
CREATE POLICY "Users can update own user record"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own user record" ON public.users;
CREATE POLICY "Users can insert own user record"
ON public.users FOR INSERT
WITH CHECK (true);

-- Patients policies
DROP POLICY IF EXISTS "Patients can view own record" ON public.patients;
CREATE POLICY "Patients can view own record"
ON public.patients FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Patients can update own record" ON public.patients;
CREATE POLICY "Patients can update own record"
ON public.patients FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (true);

DROP POLICY IF EXISTS "Patients can insert own record" ON public.patients;
CREATE POLICY "Patients can insert own record"
ON public.patients FOR INSERT
WITH CHECK (true);

-- Doctors policies
DROP POLICY IF EXISTS "Doctors can view own record" ON public.doctors;
CREATE POLICY "Doctors can view own record"
ON public.doctors FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view active doctors" ON public.doctors;
CREATE POLICY "Anyone can view active doctors"
ON public.doctors FOR SELECT
USING (is_active = true AND is_verified = true);

DROP POLICY IF EXISTS "Doctors can update own record" ON public.doctors;
CREATE POLICY "Doctors can update own record"
ON public.doctors FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (true);

DROP POLICY IF EXISTS "Doctors can insert own record" ON public.doctors;
CREATE POLICY "Doctors can insert own record"
ON public.doctors FOR INSERT
WITH CHECK (true);

-- Service role can do anything
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
CREATE POLICY "Service role can manage users"
ON public.users FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage patients" ON public.patients;
CREATE POLICY "Service role can manage patients"
ON public.patients FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage doctors" ON public.doctors;
CREATE POLICY "Service role can manage doctors"
ON public.doctors FOR ALL
USING (auth.role() = 'service_role');

-- 8. CREATE TRIGGER TO UPDATE UPDATED_AT TIMESTAMPS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now() AT TIME ZONE 'utc';
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE public.appointment_status AS ENUM ('upcoming', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number TEXT NOT NULL UNIQUE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  location TEXT NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'upcoming',
  notes TEXT,
  chief_complaint TEXT,
  diagnosis TEXT,
  prescription TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
CREATE POLICY "Users can view own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() IN (patient_id, doctor_id));

DROP POLICY IF EXISTS "Patients can create appointments" ON public.appointments;
CREATE POLICY "Patients can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
CREATE POLICY "Users can update own appointments"
ON public.appointments FOR UPDATE
USING (auth.uid() IN (patient_id, doctor_id))
WITH CHECK (auth.uid() IN (patient_id, doctor_id));

DROP POLICY IF EXISTS "Service role can manage appointments" ON public.appointments;
CREATE POLICY "Service role can manage appointments"
ON public.appointments FOR ALL
USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Doctors can read the patient user row for appointments they are assigned to
DROP POLICY IF EXISTS "Doctors can view their patients user row" ON public.users;
CREATE POLICY "Doctors can view their patients user row"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.doctor_id = auth.uid() AND a.patient_id = public.users.id
  )
);

DROP POLICY IF EXISTS "Doctors can view their patients patient row" ON public.patients;
CREATE POLICY "Doctors can view their patients patient row"
ON public.patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.doctor_id = auth.uid() AND a.patient_id = public.patients.id
  )
);
