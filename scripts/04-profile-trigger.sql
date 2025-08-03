-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    role,
    organization_id,
    city_id
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'first_name', SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer'),
    COALESCE((NEW.raw_user_meta_data->>'organization_id')::UUID, '550e8400-e29b-41d4-a716-446655440000'),
    COALESCE((NEW.raw_user_meta_data->>'city_id')::UUID, '550e8400-e29b-41d4-a716-446655440010')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
