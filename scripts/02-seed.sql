-- Insert sample organizations
INSERT INTO organizations (id, name, slug, description, settings) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Gutenberg Foundation', 'gutenberg-foundation', 'Main organization for volunteer management', '{"allow_registration": true, "require_approval": false}'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Education Initiative', 'education-initiative', 'Focus on educational programs', '{"allow_registration": true, "require_approval": true}'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Community Outreach', 'community-outreach', 'Community engagement and outreach', '{"allow_registration": true, "require_approval": false}');
INSERT INTO organizations (id, name, description, logo_url, website_url, contact_email, contact_phone, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Global Relief Foundation', 'International humanitarian aid organization focused on disaster relief and community development.', '/placeholder.svg?height=100&width=100', 'https://globalrelief.org', 'contact@globalrelief.org', '+1-555-0101', '123 Charity Lane, New York, NY 10001'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Green Earth Initiative', 'Environmental conservation organization working on climate change and sustainability projects.', '/placeholder.svg?height=100&width=100', 'https://greenearthinitiative.org', 'info@greenearthinitiative.org', '+1-555-0102', '456 Eco Street, San Francisco, CA 94102'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Community Health Network', 'Healthcare organization providing medical services and health education to underserved communities.', '/placeholder.svg?height=100&width=100', 'https://communityhealthnet.org', 'support@communityhealthnet.org', '+1-555-0103', '789 Medical Drive, Chicago, IL 60601');
INSERT INTO organizations (id, name, description, website) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Gutenberg Foundation', 'Promoting literacy and education worldwide', 'https://gutenberg.org'),
('550e8400-e29b-41d4-a716-446655440001', 'Local Community Center', 'Supporting local community development', 'https://community.org'),
('550e8400-e29b-41d4-a716-446655440002', 'Youth Development Initiative', 'Empowering young people through education', 'https://youth.org'),
('550e8400-e29b-41d4-a716-446655440000', 'Global Impact Foundation', 'A worldwide organization focused on sustainable development and community empowerment.', 'https://globalimpact.org'),
('550e8400-e29b-41d4-a716-446655440001', 'Tech for Good Alliance', 'Leveraging technology to solve social and environmental challenges.', 'https://techforgood.org'),
('550e8400-e29b-41d4-a716-446655440002', 'Community Builders Network', 'Building stronger communities through volunteer engagement and local initiatives.', 'https://communitybuilders.org'),
('550e8400-e29b-41d4-a716-446655440003', 'Education First Initiative', 'Promoting quality education and literacy programs worldwide.', 'https://educationfirst.org'),
('550e8400-e29b-41d4-a716-446655440004', 'Environmental Action Group', 'Protecting our planet through conservation and sustainability projects.', 'https://enviroaction.org')
ON CONFLICT (id) DO NOTHING;

-- Insert sample netzwerk cities
INSERT INTO netzwerk_cities (id, name, country, region, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'Berlin', 'Germany', 'Berlin', true),
('660e8400-e29b-41d4-a716-446655440001', 'Munich', 'Germany', 'Bavaria', true),
('660e8400-e29b-41d4-a716-446655440002', 'Hamburg', 'Germany', 'Hamburg', true);

-- Insert sample profiles (these will be linked to auth users created separately)
INSERT INTO profiles (
  id, name, email, phone, role, department, organization_id, netzwerk_city_id,
  permissions, is_active, is_verified, status, bio, location, skills, interests,
  availability, gamification_points, gamification_level
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Sarah Johnson',
  'sarah@gutenberg.org',
  '+49 30 12345678',
  'board_member',
  'Board',
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440000',
  ARRAY['view_projects', 'create_projects', 'manage_volunteers', 'admin_access'],
  true,
  true,
  'online',
  'Experienced board member with a passion for community development and education.',
  'Berlin, Germany',
  ARRAY['Leadership', 'Project Management', 'Strategic Planning', 'Community Outreach'],
  ARRAY['Education', 'Community Development', 'Sustainability'],
  'flexible',
  1250,
  5
),
(
  '22222222-2222-2222-2222-222222222222',
  'Michael Chen',
  'michael@gutenberg.org',
  '+49 89 87654321',
  'board_member',
  'Board',
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440001',
  ARRAY['view_projects', 'create_projects', 'manage_volunteers', 'admin_access'],
  true,
  true,
  'away',
  'Board member specializing in technology and digital transformation initiatives.',
  'Munich, Germany',
  ARRAY['Technology', 'Digital Strategy', 'Innovation', 'Mentoring'],
  ARRAY['Technology', 'Innovation', 'Digital Education'],
  'weekends',
  980,
  4
),
(
  '33333333-3333-3333-3333-333333333333',
  'Emma Wilson',
  'emma@gutenberg.org',
  '+49 40 11223344',
  'volunteer',
  'HR',
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440002',
  ARRAY['view_projects', 'join_projects', 'manage_volunteers'],
  true,
  true,
  'online',
  'HR volunteer with expertise in recruitment and volunteer coordination.',
  'Hamburg, Germany',
  ARRAY['Human Resources', 'Recruitment', 'Communication', 'Event Planning'],
  ARRAY['Human Resources', 'Volunteer Management', 'Community Building'],
  'evenings',
  750,
  3
),
(
  '44444444-4444-4444-4444-444444444444',
  'David Rodriguez',
  'david@gutenberg.org',
  '+49 30 55667788',
  'volunteer',
  'HR',
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440000',
  ARRAY['view_projects', 'join_projects'],
  true,
  true,
  'offline',
  'Dedicated volunteer focusing on community outreach and engagement programs.',
  'Berlin, Germany',
  ARRAY['Community Outreach', 'Public Speaking', 'Social Media', 'Event Coordination'],
  ARRAY['Community Engagement', 'Social Impact', 'Youth Programs'],
  'flexible',
  420,
  2
);

-- Insert sample cities
INSERT INTO cities (id, name, state, country, timezone) VALUES
('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'New York', 'NY', 'USA', 'America/New_York'),
('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'Los Angeles', 'CA', 'USA', 'America/Los_Angeles'),
('e5f6a7b8-c9d0-1234-5678-90abcdef0123', 'Chicago', 'IL', 'USA', 'America/Chicago'),
('f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'Houston', 'TX', 'USA', 'America/Chicago'),
('a7b8c9d0-e1f2-3456-7890-bcdef0123456', 'Phoenix', 'AZ', 'USA', 'America/Phoenix');
INSERT INTO cities (id, name, country, region) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'New York', 'United States', 'North America'),
('660e8400-e29b-41d4-a716-446655440001', 'London', 'United Kingdom', 'Europe'),
('660e8400-e29b-41d4-a716-446655440002', 'Toronto', 'Canada', 'North America'),
('660e8400-e29b-41d4-a716-446655440003', 'Sydney', 'Australia', 'Oceania'),
('660e8400-e29b-41d4-a716-446655440004', 'Berlin', 'Germany', 'Europe');
INSERT INTO cities (id, name, country, state_province) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'New York', 'United States', 'New York'),
('550e8400-e29b-41d4-a716-446655440011', 'Los Angeles', 'United States', 'California'),
('550e8400-e29b-41d4-a716-446655440012', 'Chicago', 'United States', 'Illinois'),
('550e8400-e29b-41d4-a716-446655440013', 'Toronto', 'Canada', 'Ontario'),
('550e8400-e29b-41d4-a716-446655440014', 'London', 'United Kingdom', 'England')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (
  id, name, description, organization_id, city_id, status, priority, start_date, end_date, required_volunteers, skills_required, location
) VALUES
('11111111-1111-1111-1111-111111111111', 'Community Book Drive', 'Organize and distribute books to local schools', '550e8400-e29b-41d4-a716-446655440000', 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'active', 'high', '2024-02-01', '2024-03-15', 10, ARRAY['organization', 'communication'], 'New York Public Library'),
('22222222-2222-2222-2222-222222222222', 'Youth Mentorship Program', 'Mentor high school students in career development', '550e8400-e29b-41d4-a716-446655440000', 'd4e5f6a7-b8c9-0123-4567-890abcdef012', 'active', 'medium', '2024-01-15', '2024-06-30', 15, ARRAY['mentoring', 'communication', 'leadership'], 'Los Angeles Community Center'),
('33333333-3333-3333-3333-333333333333', 'Environmental Cleanup', 'Clean up local parks and waterways', 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'e5f6a7b8-c9d0-1234-5678-90abcdef0123', 'planning', 'medium', '2024-03-01', '2024-03-31', 25, ARRAY['physical_work', 'environmental'], 'Lincoln Park'),
('44444444-4444-4444-4444-444444444444', 'Senior Tech Support', 'Help seniors learn to use technology', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'active', 'low', '2024-01-01', '2024-12-31', 8, ARRAY['technology', 'patience', 'teaching'], 'Houston Senior Center');
INSERT INTO projects (id, title, description, organization_id, status, priority, start_date, end_date, required_skills, volunteer_count, max_volunteers, location, remote_friendly, created_at) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Disaster Relief Coordination', 'Coordinate emergency response efforts for recent natural disasters, including supply distribution and volunteer management.', '550e8400-e29b-41d4-a716-446655440001', 'active', 'high', '2024-01-15', '2024-06-15', ARRAY['Emergency Response', 'Logistics', 'Communication'], 12, 20, 'Multiple Locations', true, NOW() - INTERVAL '30 days'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Urban Tree Planting Initiative', 'Large-scale tree planting project to improve air quality and combat urban heat islands in metropolitan areas.', '550e8400-e29b-41d4-a716-446655440002', 'active', 'medium', '2024-03-01', '2024-11-30', ARRAY['Environmental Science', 'Physical Labor', 'Community Outreach'], 8, 15, 'San Francisco Bay Area', false, NOW() - INTERVAL '20 days'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Mobile Health Clinic Program', 'Provide healthcare services to rural and underserved communities through mobile medical units.', '550e8400-e29b-41d4-a716-446655440003', 'active', 'high', '2024-02-01', '2024-12-31', ARRAY['Healthcare', 'Nursing', 'Medical Administration'], 15, 25, 'Rural Illinois', false, NOW() - INTERVAL '25 days'),
  ('660e8400-e29b-41d4-a716-446655440004', 'Digital Literacy Training', 'Teach basic computer and internet skills to elderly community members and low-income families.', '550e8400-e29b-41d4-a716-446655440001', 'planning', 'medium', '2024-04-01', '2024-09-30', ARRAY['Teaching', 'Technology', 'Patience'], 5, 12, 'Community Centers', true, NOW() - INTERVAL '10 days'),
  ('660e8400-e29b-41d4-a716-446655440005', 'Ocean Cleanup Campaign', 'Organize beach cleanups and marine debris removal efforts along the Pacific Coast.', '550e8400-e29b-41d4-a716-446655440002', 'active', 'medium', '2024-03-15', '2024-10-15', ARRAY['Environmental Conservation', 'Physical Labor', 'Marine Biology'], 10, 18, 'Pacific Coast', false, NOW() - INTERVAL '15 days');
INSERT INTO projects (id, organization_id, title, description, status, priority, start_date, end_date, budget, location, required_skills) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Emergency Food Distribution', 'Coordinate food distribution to families affected by recent flooding in the region.', 'active', 'urgent', '2024-01-15', '2024-03-15', 25000.00, 'Downtown Community Center', ARRAY['logistics', 'communication', 'physical_labor']),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Disaster Preparedness Training', 'Train community members in emergency response and disaster preparedness techniques.', 'planning', 'high', '2024-02-01', '2024-04-30', 15000.00, 'Various Community Centers', ARRAY['training', 'public_speaking', 'first_aid']),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Urban Tree Planting Initiative', 'Plant 1000 trees across urban areas to improve air quality and reduce urban heat island effect.', 'active', 'medium', '2024-01-01', '2024-06-30', 30000.00, 'City Parks and Streets', ARRAY['gardening', 'physical_labor', 'environmental_science']),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Renewable Energy Workshop Series', 'Educational workshops on solar panel installation and energy conservation for homeowners.', 'planning', 'medium', '2024-03-01', '2024-05-31', 12000.00, 'Community College', ARRAY['electrical_work', 'teaching', 'renewable_energy']),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Mobile Health Clinic', 'Provide basic healthcare services to underserved rural communities using mobile medical units.', 'active', 'high', '2024-01-10', '2024-12-31', 75000.00, 'Rural Communities', ARRAY['healthcare', 'driving', 'patient_care']),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Health Education Campaign', 'Community outreach program focusing on preventive healthcare and wellness education.', 'completed', 'medium', '2023-09-01', '2023-12-31', 20000.00, 'Schools and Community Centers', ARRAY['public_health', 'education', 'communication']);
INSERT INTO projects (id, title, description, organization_id, city_id, status, priority, start_date, end_date, required_skills, max_volunteers) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'Digital Library Initiative', 'Creating a comprehensive digital library for underserved communities', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'active', 'high', '2024-01-15', '2024-12-31', ARRAY['Web Development', 'Content Management', 'Digital Archiving'], 15),
('770e8400-e29b-41d4-a716-446655440001', 'Community Reading Program', 'Organizing reading sessions for children in local schools', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'active', 'medium', '2024-02-01', '2024-06-30', ARRAY['Teaching', 'Child Care', 'Public Speaking'], 25),
('770e8400-e29b-41d4-a716-446655440002', 'Youth Mentorship Network', 'Connecting young people with professional mentors', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'active', 'high', '2024-03-01', '2024-11-30', ARRAY['Mentoring', 'Career Guidance', 'Communication'], 30),
('550e8400-e29b-41d4-a716-446655440020', 'Clean Water Initiative', 'Providing clean water access to rural communities through well construction and water purification systems.', '550e8400-e29b-41d4-a716-446655440000', 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'active', 'high', '2024-01-15', '2024-12-31', ARRAY['Engineering', 'Project Management', 'Community Outreach'], 25),
('550e8400-e29b-41d4-a716-446655440021', 'Digital Literacy Program', 'Teaching basic computer skills and internet safety to seniors and underserved communities.', '550e8400-e29b-41d4-a716-446655440001', 'active', 'medium', '2024-02-01', '2024-11-30', ARRAY['Teaching', 'Computer Skills', 'Patience'], 15),
('550e8400-e29b-41d4-a716-446655440022', 'Urban Garden Project', 'Creating community gardens in urban areas to promote food security and environmental awareness.', '550e8400-e29b-41d4-a716-446655440002', 'active', 'medium', '2024-03-01', '2024-10-31', ARRAY['Gardening', 'Community Organizing', 'Environmental Science'], 20),
('550e8400-e29b-41d4-a716-446655440023', 'Youth Mentorship Program', 'Connecting adult volunteers with at-risk youth to provide guidance and support.', '550e8400-e29b-41d4-a716-446655440003', 'active', 'high', '2024-01-01', '2024-12-31', ARRAY['Mentoring', 'Communication', 'Youth Development'], 30),
('550e8400-e29b-41d4-a716-446655440024', 'Renewable Energy Workshop', 'Educational workshops on solar panel installation and renewable energy systems.', '550e8400-e29b-41d4-a716-446655440004', 'f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'on_hold', 'low', '2024-06-01', '2024-09-30', ARRAY['Electrical Work', 'Teaching', 'Renewable Energy'], 10)
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (
  id, title, description, instructor, duration_hours, difficulty_level, category, tags, thumbnail_url, organization_id, is_published
) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Emergency Response Fundamentals', 'Learn the basics of emergency response, including first aid, crisis communication, and disaster preparedness.', 'Dr. Sarah Johnson', 8, 'beginner', 'Emergency Response', ARRAY['First Aid', 'Crisis Management', 'Safety'], '/placeholder.svg?height=200&width=300', '550e8400-e29b-41d4-a716-446655440001', true),
  ('770e8400-e29b-41d4-a716-446655440002', 'Sustainable Living Practices', 'Comprehensive guide to reducing environmental impact through sustainable lifestyle choices and green technologies.', 'Prof. Michael Chen', 12, 'intermediate', 'Environmental', ARRAY['Sustainability', 'Green Technology', 'Climate Change'], '/placeholder.svg?height=200&width=300', '550e8400-e29b-41d4-a716-446655440002', true),
  ('770e8400-e29b-41d4-a716-446655440003', 'Community Health Education', 'Training program for volunteers to provide health education and basic medical assistance in community settings.', 'Dr. Lisa Rodriguez', 16, 'intermediate', 'Healthcare', ARRAY['Public Health', 'Health Education', 'Community Outreach'], '/placeholder.svg?height=200&width=300', '550e8400-e29b-41d4-a716-446655440003', true),
  ('770e8400-e29b-41d4-a716-446655440004', 'Volunteer Leadership Development', 'Advanced course for experienced volunteers looking to take on leadership roles in nonprofit organizations.', 'James Wilson', 20, 'advanced', 'Leadership', ARRAY['Leadership', 'Team Management', 'Nonprofit Management'], '/placeholder.svg?height=200&width=300', '550e8400-e29b-41d4-a716-446655440001', true),
  ('770e8400-e29b-41d4-a716-446655440005', 'Grant Writing for Nonprofits', 'Learn how to research, write, and submit successful grant proposals for nonprofit organizations.', 'Amanda Foster', 10, 'intermediate', 'Fundraising', ARRAY['Grant Writing', 'Fundraising', 'Nonprofit Finance'], '/placeholder.svg?height=200&width=300', '550e8400-e29b-41d4-a716-446655440002', true);
INSERT INTO courses (id, organization_id, title, description, category, level, duration_hours, instructor, max_participants, price, image_url, is_published) VALUES
  ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Emergency Response Fundamentals', 'Learn the basics of emergency response, including first aid, CPR, and disaster management protocols.', 'Emergency Response', 'beginner', 16, 'Dr. Sarah Johnson', 25, 0.00, '/placeholder.svg?height=200&width=300', true),
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Advanced Disaster Management', 'Comprehensive training for disaster response coordinators and team leaders.', 'Emergency Response', 'advanced', 40, 'Captain Mike Rodriguez', 15, 150.00, '/placeholder.svg?height=200&width=300', true),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Sustainable Gardening Practices', 'Learn organic gardening techniques and sustainable agriculture methods for community gardens.', 'Environmental', 'beginner', 12, 'Maria Garcia', 30, 0.00, '/placeholder.svg?height=200&width=300', true),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Climate Change and Community Action', 'Understanding climate science and developing local action plans for climate resilience.', 'Environmental', 'intermediate', 24, 'Dr. James Chen', 20, 75.00, '/placeholder.svg?height=200&width=300', true),
  ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Community Health Assessment', 'Training for volunteers to conduct basic health screenings and community health assessments.', 'Healthcare', 'intermediate', 20, 'Nurse Patricia Williams', 18, 100.00, '/placeholder.svg?height=200&width=300', true),
  ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Mental Health First Aid', 'Recognize signs of mental health issues and provide appropriate support and referrals.', 'Healthcare', 'beginner', 8, 'Dr. Lisa Thompson', 25, 0.00, '/placeholder.svg?height=200&width=300', true);
INSERT INTO courses (id, title, description, organization_id, category, level, duration_hours, max_participants, start_date, end_date, is_published) VALUES
('880e8400-e29b-41d4-a716-446655440000', 'Volunteer Leadership Training', 'Comprehensive training program for volunteer leaders', '550e8400-e29b-41d4-a716-446655440000', 'Leadership', 'intermediate', 40, 20, '2024-04-01', '2024-05-31', true),
('880e8400-e29b-41d4-a716-446655440001', 'Digital Literacy for Seniors', 'Teaching basic computer skills to elderly community members', '550e8400-e29b-41d4-a716-446655440001', 'Technology', 'beginner', 20, 15, '2024-03-15', '2024-04-15', true),
('880e8400-e29b-41d4-a716-446655440002', 'Grant Writing Workshop', 'Learn how to write effective grant proposals for non-profits', '550e8400-e29b-41d4-a716-446655440002', 'Fundraising', 'advanced', 16, 12, '2024-05-01', '2024-05-31', true),
('550e8400-e29b-41d4-a716-446655440030', 'Volunteer Leadership Fundamentals', 'Learn the essential skills needed to lead volunteer teams effectively.', 'Dr. Sarah Johnson', 8, 'beginner', 'Leadership', 'published'),
('550e8400-e29b-41d4-a716-446655440031', 'Project Management for Nonprofits', 'Master project management techniques specifically designed for nonprofit organizations.', 'Michael Chen', 12, 'intermediate', 'Management', 'published'),
('550e8400-e29b-41d4-a716-446655440032', 'Community Engagement Strategies', 'Discover effective methods for engaging and mobilizing community members.', 'Dr. Maria Rodriguez', 6, 'beginner', 'Community', 'published'),
('550e8400-e29b-41d4-a716-446655440033', 'Grant Writing Workshop', 'Learn how to write compelling grant proposals to secure funding for your projects.', 'James Wilson', 10, 'intermediate', 'Fundraising', 'published'),
('550e8400-e29b-41d4-a716-446655440034', 'Digital Marketing for Social Impact', 'Harness the power of digital marketing to amplify your organization\'s mission.', 'Lisa Thompson', 14, 'advanced', 'Marketing', 'published')
ON CONFLICT (id) DO NOTHING;

-- Insert sample community posts
INSERT INTO community_posts (id, title, content, organization_id, city_id, category, tags) VALUES
('post1111-1111-1111-1111-111111111111', 'Welcome New Volunteers!', 'We are excited to welcome our new volunteers to the team. Please introduce yourselves and let us know what projects interest you most.', '550e8400-e29b-41d4-a716-446655440000', 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'general', ARRAY['welcome', 'introduction']),
('post2222-2222-2222-2222-222222222222', 'Book Drive Update', 'Great news! We have collected over 500 books for our community book drive. Thank you to everyone who contributed.', '550e8400-e29b-41d4-a716-446655440000', 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'project-update', ARRAY['book-drive', 'success']),
('post3333-3333-3333-3333-333333333333', 'Volunteer Appreciation Event', 'Join us for our annual volunteer appreciation dinner on March 15th. Details and RSVP information coming soon!', '550e8400-e29b-41d4-a716-446655440000', 'd4e5f6a7-b8c9-0123-4567-890abcdef012', 'event', ARRAY['appreciation', 'event', 'dinner']);
INSERT INTO community_posts (id, title, content, organization_id, category, tags, likes_count, comments_count, created_at) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'Successful Disaster Relief Mission in Texas', 'Our team just completed a successful disaster relief mission in Texas, helping over 500 families affected by recent flooding. The coordination between volunteers was exceptional, and we managed to distribute emergency supplies efficiently. Thank you to everyone who participated!', '550e8400-e29b-41d4-a716-446655440001', 'Success Stories', ARRAY['Disaster Relief', 'Texas', 'Flooding'], 24, 8, NOW() - INTERVAL '2 days'),
  ('880e8400-e29b-41d4-a716-446655440002', 'New Tree Planting Techniques Workshop', 'Join us next Saturday for a hands-on workshop about advanced tree planting techniques. We''ll cover soil preparation, species selection, and long-term care strategies. Perfect for both new and experienced volunteers!', '550e8400-e29b-41d4-a716-446655440002', 'Events', ARRAY['Workshop', 'Tree Planting', 'Education'], 15, 5, NOW() - INTERVAL '1 day'),
  ('880e8400-e29b-41d4-a716-446655440003', 'Mobile Clinic Reaches 1000th Patient', 'Milestone achievement! Our mobile health clinic program has now served over 1000 patients in rural communities. This wouldn''t be possible without our dedicated volunteer medical staff and drivers. Here''s to the next thousand!', '550e8400-e29b-41d4-a716-446655440003', 'Milestones', ARRAY['Healthcare', 'Mobile Clinic', 'Rural Health'], 32, 12, NOW() - INTERVAL '3 days'),
  ('880e8400-e29b-41d4-a716-446655440004', 'Volunteer Appreciation Dinner - Save the Date', 'Mark your calendars! Our annual volunteer appreciation dinner will be held on May 15th at the Grand Ballroom. It''s our way of saying thank you for all your hard work and dedication throughout the year.', '550e8400-e29b-41d4-a716-446655440001', 'Announcements', ARRAY['Appreciation', 'Dinner', 'Volunteers'], 18, 6, NOW() - INTERVAL '5 days'),
  ('880e8400-e29b-41d4-a716-446655440005', 'Ocean Cleanup Results: 2 Tons of Debris Removed', 'Amazing results from last weekend''s ocean cleanup campaign! Our volunteers collected over 2 tons of marine debris from 5 different beaches. The impact on local marine life will be significant. Thank you to all participants!', '550e8400-e29b-41d4-a716-446655440002', 'Success Stories', ARRAY['Ocean Cleanup', 'Marine Conservation', 'Beach Cleanup'], 28, 9, NOW() - INTERVAL '4 days');
INSERT INTO community_posts (id, organization_id, author_id, title, content, category, tags, likes_count, comments_count, is_pinned) VALUES
  ('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 'Welcome New Volunteers!', 'We are excited to welcome our new volunteers to the Global Relief Foundation family. Your dedication to helping others makes a real difference in our communities. Please introduce yourselves and let us know what projects interest you most!', 'General', ARRAY['welcome', 'introduction', 'community'], 12, 8, true),
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440001', 'Food Distribution Success Story', 'Thanks to our amazing volunteers, we successfully distributed over 5,000 meals to families in need last month. The impact of your hard work is immeasurable. Special thanks to everyone who helped with logistics, packing, and distribution!', 'Success Story', ARRAY['food_distribution', 'success', 'gratitude'], 28, 15, false),
  ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'Tree Planting Event This Weekend', 'Join us this Saturday for our monthly tree planting event! We will be planting native species in Riverside Park starting at 9 AM. Bring gloves, water, and your enthusiasm. Light refreshments will be provided. RSVP in the comments!', 'Event', ARRAY['tree_planting', 'environment', 'weekend_event'], 18, 12, false),
  ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', 'Solar Panel Workshop Registration Open', 'Registration is now open for our upcoming solar panel installation workshop series. Learn hands-on skills while helping families reduce their energy costs. Limited spots available - register early! Workshop runs March 15-17.', 'Training', ARRAY['solar_energy', 'workshop', 'registration'], 22, 9, true),
  ('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', 'Mobile Clinic Reaches 500 Patients', 'Our mobile health clinic has now served over 500 patients in rural communities! This milestone represents countless hours of dedication from our volunteer healthcare providers. Thank you for making healthcare accessible to those who need it most.', 'Milestone', ARRAY['mobile_clinic', 'healthcare', 'milestone'], 35, 18, false),
  ('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', 'Volunteer Appreciation Dinner', 'Save the date! Our annual volunteer appreciation dinner will be held on April 20th at the Community Center. This is our way of saying thank you for all your incredible contributions. More details and RSVP information coming soon!', 'Event', ARRAY['appreciation', 'dinner', 'save_the_date'], 41, 23, true);
INSERT INTO community_posts (id, title, content, organization_id, category, tags) VALUES
('990e8400-e29b-41d4-a716-446655440000', 'Welcome to Our Community!', 'We are excited to have you join our volunteer community. This platform will help us coordinate our efforts and share resources.', '550e8400-e29b-41d4-a716-446655440000', 'Announcements', ARRAY['welcome', 'community', 'introduction']),
('990e8400-e29b-41d4-a716-446655440001', 'Upcoming Training Sessions', 'We have several training sessions scheduled for next month. Please check the Learning Center for more details and to register.', '550e8400-e29b-41d4-a716-446655440000', 'Training', ARRAY['training', 'education', 'skills']),
('990e8400-e29b-41d4-a716-446655440002', 'Volunteer Appreciation Event', 'Join us for our annual volunteer appreciation dinner on June 15th. Details and RSVP information will be sent via email.', '550e8400-e29b-41d4-a716-446655440001', 'Events', ARRAY['appreciation', 'event', 'celebration']),
('550e8400-e29b-41d4-a716-446655440040', 'Welcome to Our Community!', 'We''re excited to have you join our volunteer community. This is a space where we can share experiences, ask questions, and support each other in our mission to make a positive impact. Feel free to introduce yourself and let us know what causes you''re passionate about!', '550e8400-e29b-41d4-a716-446655440000', 'General', ARRAY['welcome', 'introduction', 'community'], 15, 8, 'published'),
('550e8400-e29b-41d4-a716-446655440041', 'Tips for First-Time Volunteers', 'Starting your volunteer journey can be both exciting and overwhelming. Here are some tips to help you get started: 1) Choose causes you''re passionate about, 2) Start small and gradually increase your commitment, 3) Don''t be afraid to ask questions, 4) Be reliable and communicate well, 5) Celebrate your impact, no matter how small!', '550e8400-e29b-41d4-a716-446655440000', 'Tips', ARRAY['tips', 'beginners', 'advice'], 23, 12, 'published'),
('550e8400-e29b-41d4-a716-446655440042', 'Upcoming Environmental Cleanup Event', 'Join us for a community cleanup event at Riverside Park this Saturday from 9 AM to 2 PM. We''ll be removing litter, planting native species, and maintaining walking trails. Lunch will be provided! Please bring work gloves and wear comfortable clothes. RSVP in the comments below.', '550e8400-e29b-41d4-a716-446655440000', 'Events', ARRAY['environment', 'cleanup', 'event'], 31, 18, 'published'),
('550e8400-e29b-41d4-a716-446655440043', 'Volunteer Spotlight: Making a Difference in Education', 'This month, we''re highlighting the amazing work being done by our education volunteers. From tutoring students to organizing book drives, these dedicated individuals are helping to bridge the education gap in our community. Read about their inspiring stories and learn how you can get involved in education initiatives.', '550e8400-e29b-41d4-a716-446655440000', 'Spotlight', ARRAY['spotlight', 'education', 'inspiration'], 19, 6, 'published'),
('550e8400-e29b-41d4-a716-446655440044', 'Fundraising Ideas for Small Nonprofits', 'Running a successful fundraising campaign doesn''t always require a big budget. Here are some creative and cost-effective fundraising ideas: community bake sales, online crowdfunding campaigns, skill-based auctions, corporate partnerships, and social media challenges. What fundraising strategies have worked for your organization?', '550e8400-e29b-41d4-a716-446655440000', 'Discussion', ARRAY['fundraising', 'nonprofit', 'ideas'], 27, 14, 'published')
ON CONFLICT (id) DO NOTHING;

-- Insert sample project assignments
INSERT INTO project_assignments (
  project_id, volunteer_id, assigned_by, status, role
) VALUES
(
  '770e8400-e29b-41d4-a716-446655440000',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'active',
  'Coordinator'
),
(
  '770e8400-e29b-41d4-a716-446655440000',
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'active',
  'Instructor'
),
(
  '770e8400-e29b-41d4-a716-446655440002',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'active',
  'Senior Mentor'
);

-- Insert sample conversations
INSERT INTO conversations (
  id, title, type, organization_id, created_by
) VALUES
(
  '990e8400-e29b-41d4-a716-446655440000',
  'Digital Literacy Team',
  'project',
  '550e8400-e29b-41d4-a716-446655440000',
  '11111111-1111-1111-1111-111111111111'
),
(
  '990e8400-e29b-41d4-a716-446655440001',
  'Board Members',
  'group',
  '550e8400-e29b-41d4-a716-446655440000',
  '11111111-1111-1111-1111-111111111111'
),
(
  '990e8400-e29b-41d4-a716-446655440002',
  'HR Team Chat',
  'group',
  '550e8400-e29b-41d4-a716-446655440000',
  '33333333-3333-3333-3333-333333333333'
);

-- Insert conversation participants
INSERT INTO conversation_participants (conversation_id, user_id, is_admin) VALUES
-- Digital Literacy Team
('990e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', true),
('990e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333', false),
('990e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', false),

-- Board Members
('990e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', true),
('990e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', true),

-- HR Team Chat
('990e8400-e29b-41d4-a716-446655440002', '33333333-3333-3333-3333-333333333333', true),
('990e8400-e29b-41d4-a716-446655440002', '44444444-4444-4444-4444-444444444444', false);

-- Insert sample messages
INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES
-- Digital Literacy Team messages
('990e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 'Welcome to the Digital Literacy Program team! Let''s make this project a success.', 'text'),
('990e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333', 'Thanks Sarah! I''m excited to coordinate this program. When should we schedule our first planning meeting?', 'text'),
('990e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', 'I''ve been preparing some basic curriculum materials. Happy to share them with the team.', 'text'),
('990e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 'Great! Let''s meet this Friday at 2 PM to discuss the curriculum and timeline.', 'text'),

-- Board Members messages
('990e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'Board meeting scheduled for next Tuesday. Please review the quarterly reports.', 'text'),
('990e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'Received. I''ll prepare the technology budget proposal for discussion.', 'text'),

-- HR Team messages
('990e8400-e29b-41d4-a716-446655440002', '33333333-3333-3333-3333-333333333333', 'We have 5 new volunteer applications to review this week.', 'text'),
('990e8400-e29b-41d4-a716-446655440002', '44444444-4444-4444-4444-444444444444', 'I can help with the interviews. When are they scheduled?', 'text'),
('990e8400-e29b-41d4-a716-446655440002', '33333333-3333-3333-3333-333333333333', 'Thursday and Friday afternoons. I''ll send you the calendar invites.', 'text');

-- Insert sample activities
INSERT INTO activities (
  volunteer_id, project_id, title, description, activity_type, hours, date,
  status, points_awarded, organization_id, created_by
) VALUES
(
  '33333333-3333-3333-3333-333333333333',
  '770e8400-e29b-41d4-a716-446655440000',
  'Program Planning Session',
  'Initial planning and curriculum development for the digital literacy program.',
  'Planning',
  3.5,
  '2024-01-20',
  'completed',
  35,
  '550e8400-e29b-41d4-a716-446655440000',
  '11111111-1111-1111-1111-111111111111'
),
(
  '44444444-4444-4444-4444-444444444444',
  '770e8400-e29b-41d4-a716-446655440000',
  'Teaching Session - Week 1',
  'First week of digital literacy classes for seniors.',
  'Teaching',
  4.0,
  '2024-01-25',
  'completed',
  40,
  '550e8400-e29b-41d4-a716-446655440000',
  '33333333-3333-3333-3333-333333333333'
),
(
  '22222222-2222-2222-2222-222222222222',
  '770e8400-e29b-41d4-a716-446655440002',
  'Mentorship Session',
  'One-on-one mentoring session with young professional.',
  'Mentoring',
  2.0,
  '2024-02-15',
  'completed',
  25,
  '550e8400-e29b-41d4-a716-446655440000',
  '33333333-3333-3333-3333-333333333333'
);
