-- Create invitations table for tracking email invites
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'volunteer', -- 'volunteer', 'participant', 'board_member'
  organization_id TEXT NOT NULL,
  netzwerk_city_id TEXT,
  department TEXT,
  invited_by UUID REFERENCES users(id),
  invitation_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'cancelled'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, organization_id, status)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_organization ON invitations(organization_id);

-- Enable Row Level Security
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations table
CREATE POLICY "Admins and board members can view all invitations in their org"
  ON invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.organization_id = invitations.organization_id
      AND user_profiles.role IN ('admin', 'board_member')
    )
  );

CREATE POLICY "Admins and board members can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.organization_id = invitations.organization_id
      AND user_profiles.role IN ('admin', 'board_member')
    )
  );

CREATE POLICY "Admins and board members can update invitations in their org"
  ON invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.organization_id = invitations.organization_id
      AND user_profiles.role IN ('admin', 'board_member')
    )
  );

CREATE POLICY "Admins and board members can delete invitations in their org"
  ON invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.organization_id = invitations.organization_id
      AND user_profiles.role IN ('admin', 'board_member')
    )
  );

-- Function to automatically cancel expired invitations
CREATE OR REPLACE FUNCTION cancel_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE invitations
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
