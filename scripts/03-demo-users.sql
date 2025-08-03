-- Create function to handle demo user profile creation
CREATE OR REPLACE FUNCTION create_demo_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT,
  org_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    role,
    organization_id,
    city_id,
    status
  ) VALUES (
    user_id,
    user_email,
    user_name,
    SPLIT_PART(user_name, ' ', 1),
    SPLIT_PART(user_name, ' ', 2),
    user_role,
    org_id,
    '550e8400-e29b-41d4-a716-446655440010', -- Default to New York
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    organization_id = EXCLUDED.organization_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_demo_user_profile TO authenticated;
