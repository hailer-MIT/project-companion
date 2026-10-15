CREATE TABLE IF NOT EXISTS public.tutor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  telegram text,
  subjects text[] NOT NULL DEFAULT '{}',
  years_experience int,
  bio text,
  references_text text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.tutor_applications TO service_role;
ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;