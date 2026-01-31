-- Create enum for blood groups
CREATE TYPE public.blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Create enum for gender
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'donor');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create donors table
CREATE TABLE public.donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    blood_group blood_group NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2),
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    hemoglobin_level DECIMAL(4,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    has_chronic_disease BOOLEAN DEFAULT false,
    chronic_disease_details TEXT,
    last_major_surgery_date DATE,
    is_on_medication BOOLEAN DEFAULT false,
    medication_details TEXT,
    is_pregnant BOOLEAN DEFAULT false,
    last_tattoo_date DATE,
    last_donation_date DATE,
    total_donations INTEGER DEFAULT 0,
    is_eligible BOOLEAN DEFAULT true,
    eligibility_reason TEXT,
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE NOT NULL,
    donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    units_donated DECIMAL(3,1) NOT NULL DEFAULT 1,
    blood_group blood_group NOT NULL,
    hemoglobin_at_donation DECIMAL(4,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    donation_center TEXT,
    collected_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blood_inventory table
CREATE TABLE public.blood_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blood_group blood_group NOT NULL UNIQUE,
    units_available DECIMAL(10,1) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial blood inventory
INSERT INTO public.blood_inventory (blood_group, units_available) VALUES
    ('A+', 0), ('A-', 0), ('B+', 0), ('B-', 0),
    ('AB+', 0), ('AB-', 0), ('O+', 0), ('O-', 0);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for donors
CREATE POLICY "Donors can view own profile" ON public.donors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Donors can update own profile" ON public.donors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all donors" ON public.donors
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all donors" ON public.donors
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can register as donor" ON public.donors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for donations
CREATE POLICY "Donors can view own donations" ON public.donations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.donors WHERE donors.id = donations.donor_id AND donors.user_id = auth.uid())
    );

CREATE POLICY "Admins can view all donations" ON public.donations
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all donations" ON public.donations
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for blood_inventory
CREATE POLICY "Anyone authenticated can view inventory" ON public.blood_inventory
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage inventory" ON public.blood_inventory
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to update donor after donation
CREATE OR REPLACE FUNCTION public.update_donor_after_donation()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.donors
    SET 
        last_donation_date = NEW.donation_date,
        total_donations = total_donations + 1,
        updated_at = now()
    WHERE id = NEW.donor_id;
    
    -- Update blood inventory
    UPDATE public.blood_inventory
    SET 
        units_available = units_available + NEW.units_donated,
        last_updated = now()
    WHERE blood_group = NEW.blood_group;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for donation updates
CREATE TRIGGER on_donation_insert
    AFTER INSERT ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_donor_after_donation();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for donors updated_at
CREATE TRIGGER update_donors_updated_at
    BEFORE UPDATE ON public.donors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();