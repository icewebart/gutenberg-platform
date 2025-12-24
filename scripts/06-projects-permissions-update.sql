-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Project managers can update their projects" ON projects;
DROP POLICY IF EXISTS "Project managers can delete their projects" ON projects;
DROP POLICY IF EXISTS "Project managers can add members to their projects" ON project_members;
DROP POLICY IF EXISTS "Project managers can remove members from their projects" ON project_members;

-- Allow Board Members and Admins to create projects
CREATE POLICY "Board Members and Admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'board_member')
    )
  );

-- Allow Board Members, Admins, project managers, and creators to update projects
CREATE POLICY "Authorized users can update projects"
  ON projects FOR UPDATE
  USING (
    auth.uid() = project_manager_id 
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'board_member')
    )
  );

-- Allow Board Members, Admins, project managers, and creators to delete projects
CREATE POLICY "Authorized users can delete projects"
  ON projects FOR DELETE
  USING (
    auth.uid() = project_manager_id 
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'board_member')
    )
  );

-- Allow Board Members, Admins, and project managers to add members to projects
CREATE POLICY "Authorized users can add project members"
  ON project_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND (
        project_manager_id = auth.uid() 
        OR created_by = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'board_member')
    )
  );

-- Allow Board Members, Admins, and project managers to remove members from projects
CREATE POLICY "Authorized users can remove project members"
  ON project_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND (
        project_manager_id = auth.uid() 
        OR created_by = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'board_member')
    )
  );
