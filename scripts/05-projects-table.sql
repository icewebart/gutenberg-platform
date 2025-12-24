-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  netzwerk_city_id TEXT,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  project_date DATE NOT NULL,
  start_date DATE,
  end_date DATE,
  location TEXT NOT NULL,
  image_url TEXT,
  project_manager_id UUID REFERENCES users(id),
  project_type TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'upcoming',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  points_reward INTEGER DEFAULT 0,
  requirements TEXT[],
  materials TEXT[],
  images TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project members table (for volunteers and participants)
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant', -- 'manager', 'member', 'participant'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects table
CREATE POLICY "Users can view all projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project managers can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() = project_manager_id OR auth.uid() = created_by);

CREATE POLICY "Project managers can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = project_manager_id OR auth.uid() = created_by);

-- RLS Policies for project_members table
CREATE POLICY "Users can view all project members"
  ON project_members FOR SELECT
  USING (true);

CREATE POLICY "Users can add themselves to projects"
  ON project_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Project managers can add members to their projects"
  ON project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND (project_manager_id = auth.uid() OR created_by = auth.uid())
    )
  );

CREATE POLICY "Users can remove themselves from projects"
  ON project_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Project managers can remove members from their projects"
  ON project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND (project_manager_id = auth.uid() OR created_by = auth.uid())
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_projects_timestamp
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();
