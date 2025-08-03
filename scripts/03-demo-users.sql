-- Create function to handle demo user creation
CREATE OR REPLACE FUNCTION create_demo_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT,
  org_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  name_parts TEXT[];
  first_name TEXT;
  last_name TEXT;
  city_id UUID;
BEGIN
  -- Split the full name into first and last name
  name_parts := string_to_array(user_name, ' ');
  first_name := name_parts[1];
  last_name := COALESCE(name_parts[2], '');
  
  -- Get a random city ID
  SELECT id INTO city_id FROM cities ORDER BY RANDOM() LIMIT 1;
  
  -- Insert the profile
  INSERT INTO profiles (
    user_id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    city_id,
    is_active
  ) VALUES (
    user_id,
    user_email,
    first_name,
    last_name,
    user_role,
    org_id,
    city_id,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    organization_id = EXCLUDED.organization_id,
    city_id = EXCLUDED.city_id,
    updated_at = NOW();
END;
$$;
