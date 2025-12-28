-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE netzwerk_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_courses ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id UUID)
RETURNS TEXT AS $$
  SELECT organization_id FROM users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations: Users can view organizations they belong to
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Netzwerk Cities: Users can view cities in their organization
CREATE POLICY "Users can view cities in their organization"
  ON netzwerk_cities FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
  );

-- Users: Users can view other users in their organization
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
  );

-- Users: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Projects: Users can view projects in their organization
CREATE POLICY "Users can view projects in their organization"
  ON projects FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
  );

-- Projects: Managers and admins can create projects
CREATE POLICY "Managers and admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'board_member')
    )
  );

-- Projects: Managers and admins can update projects
CREATE POLICY "Managers and admins can update projects"
  ON projects FOR UPDATE
  USING (
    organization_id = get_user_organization_id(auth.uid()) AND
    (
      manager_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'board_member')
      )
    )
  );

-- Courses: Users can view published courses in their organization
CREATE POLICY "Users can view published courses"
  ON courses FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid()) AND
    is_published = true
  );

-- Courses: Admins can view all courses
CREATE POLICY "Admins can view all courses"
  ON courses FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Community Posts: Users can view posts in their organization
CREATE POLICY "Users can view posts in their organization"
  ON community_posts FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
  );

-- Community Posts: Users can create posts
CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid()) AND
    author_id = auth.uid()
  );

-- Community Posts: Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Community Replies: Users can view replies to posts in their organization
CREATE POLICY "Users can view replies in their organization"
  ON community_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = community_replies.post_id AND
      organization_id = get_user_organization_id(auth.uid())
    )
  );

-- Community Replies: Users can create replies
CREATE POLICY "Users can create replies"
  ON community_replies FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = community_replies.post_id AND
      organization_id = get_user_organization_id(auth.uid())
    )
  );

-- Chat Conversations: Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = ANY(participants));

-- Chat Conversations: Users can create conversations
CREATE POLICY "Users can create conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = ANY(participants));

-- Chat Messages: Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id AND
      auth.uid() = ANY(participants)
    )
  );

-- Chat Messages: Users can send messages in their conversations
CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id AND
      auth.uid() = ANY(participants)
    )
  );

-- Store Products: Users can view products in their organization
CREATE POLICY "Users can view products in their organization"
  ON store_products FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
  );

-- Activity Logs: Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- Activity Logs: Admins can view all activity logs in their organization
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin' AND
      organization_id = (SELECT organization_id FROM users WHERE id = activity_logs.user_id)
    )
  );

-- Points History: Users can view their own points history
CREATE POLICY "Users can view their own points history"
  ON points_history FOR SELECT
  USING (user_id = auth.uid());

-- Project Participations: Users can view their own participations
CREATE POLICY "Users can view their own participations"
  ON project_participations FOR SELECT
  USING (user_id = auth.uid());

-- Course Enrollments: Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
  ON course_enrollments FOR SELECT
  USING (user_id = auth.uid());

-- Course Enrollments: Users can enroll themselves
CREATE POLICY "Users can enroll in courses"
  ON course_enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Watched Courses: Users can view their own watched courses
CREATE POLICY "Users can view their own watched courses"
  ON watched_courses FOR SELECT
  USING (user_id = auth.uid());

