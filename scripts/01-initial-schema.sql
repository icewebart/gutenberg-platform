-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (this is the main user/profile table)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'volunteer' CHECK (role IN ('admin', 'board_member', 'volunteer', 'pending')),
  department TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  organization_id TEXT NOT NULL,
  netzwerk_city_id TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  permissions TEXT[] DEFAULT '{}',
  years_of_activity TEXT[] DEFAULT '{}',
  enrolled_courses TEXT[] DEFAULT '{}',
  watched_courses JSONB DEFAULT '[]',
  points_history JSONB DEFAULT '[]',
  activity_log JSONB DEFAULT '[]',
  project_history JSONB DEFAULT '[]',
  gamification JSONB DEFAULT '{"points": 0, "level": 1, "badges": []}',
  profile JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Allow users to view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow user to update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow admins and board members to insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'board_member')
    )
  );

CREATE POLICY "Allow admins to update any user"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow user to see their own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow user to see participants of their own conversations"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow user to insert themselves into a conversation"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow user to see messages in their own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow user to send messages in their own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  project_date DATE,
  start_date DATE,
  end_date DATE,
  location TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  project_type TEXT CHECK (project_type IN ('one-time', 'recurring', 'campaign')),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  project_manager_id UUID REFERENCES users(id),
  requirements TEXT[] DEFAULT '{}',
  materials TEXT[] DEFAULT '{}',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  points_reward INTEGER DEFAULT 0,
  organization_id TEXT NOT NULL,
  netzwerk_city_id TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and board members can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'board_member')
    )
  );

CREATE POLICY "Project managers and admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    project_manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'board_member')
    )
  );

CREATE POLICY "Admins and board members can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'board_member')
    )
  );

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('manager', 'member', 'volunteer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create indexes for project_members
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- Enable Row Level Security
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all project members"
  ON project_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project managers and admins can add members"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND (p.project_manager_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'board_member')
      ))
    )
  );

CREATE POLICY "Users can add themselves to projects"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Project managers and admins can remove members"
  ON project_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND (p.project_manager_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'board_member')
      ))
    )
  );

CREATE POLICY "Users can remove themselves from projects"
  ON project_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'board_member', 'volunteer')),
  organization_id TEXT NOT NULL,
  netzwerk_city_id TEXT,
  invited_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for invitations
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Enable Row Level Security
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and board members can view invitations"
  ON invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = invitations.organization_id
      AND users.role IN ('admin', 'board_member')
    )
  );

CREATE POLICY "Admins and board members can create invitations"
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = invitations.organization_id
      AND users.role IN ('admin', 'board_member')
    )
  );

CREATE POLICY "Admins and board members can update invitations"
  ON invitations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = invitations.organization_id
      AND users.role IN ('admin', 'board_member')
    )
  );

CREATE POLICY "Admins and board members can delete invitations"
  ON invitations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = invitations.organization_id
      AND users.role IN ('admin', 'board_member')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
