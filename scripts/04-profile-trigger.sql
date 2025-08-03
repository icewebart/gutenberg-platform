-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id UUID;
  city_id UUID;
  user_role TEXT;
  first_name TEXT;
  last_name TEXT;
  name_parts TEXT[];
BEGIN
  -- Get default organization and city
  SELECT id INTO org_id FROM organizations LIMIT 1;
  SELECT id INTO city_id FROM cities LIMIT 1;
  
  -- Set default role
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer');
  
  -- Extract names from metadata or email
  IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    name_parts := string_to_array(NEW.raw_user_meta_data->>'full_name', ' ');
    first_name := name_parts[1];
    last_name := COALESCE(name_parts[2], '');
  ELSIF NEW.raw_user_meta_data->>'first_name' IS NOT NULL THEN
    first_name := NEW.raw_user_meta_data->>'first_name';
    last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  ELSE
    -- Extract from email
    name_parts := string_to_array(split_part(NEW.email, '@', 1), '.');
    first_name := COALESCE(name_parts[1], 'User');
    last_name := COALESCE(name_parts[2], '');
  END IF;
  
  -- Insert profile
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
    NEW.id,
    NEW.email,
    first_name,
    last_name,
    user_role,
    org_id,
    city_id,
    true
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
