-- Seed Data: 001_initial_seed.sql
-- SkillBridge Development Seed Data

TRUNCATE TABLE notifications, user_skills, saved_jobs, applications, resumes, jobs, skills, companies, users CASCADE;

-- 1. SEED USERS
-- Password hash is a development placeholder ($2b$10$seedplaceholder...)
INSERT INTO users (id, first_name, last_name, email, password_hash, role, phone, profile_image, bio, location) VALUES
-- Admin
('a0000000-0000-4000-8000-000000000001', 'System', 'Admin', 'admin@skillbridge.dev', '$2b$10$seedplaceholder.AdminPasswordHash01', 'admin', '+1-555-0100', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'SkillBridge Portal Administrator', 'San Francisco, CA'),
-- Recruiters
('a0000000-0000-4000-8000-000000000002', 'Sarah', 'Jenkins', 'sarah.jenkins@techcorp.com', '$2b$10$seedplaceholder.RecruiterPasswordHash01', 'recruiter', '+1-555-0201', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'Lead Tech Recruiter at TechCorp Innovations', 'New York, NY'),
('a0000000-0000-4000-8000-000000000003', 'Marcus', 'Vance', 'marcus.vance@cloudscale.io', '$2b$10$seedplaceholder.RecruiterPasswordHash02', 'recruiter', '+1-555-0202', 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', 'Talent Acquisition Partner at CloudScale Solutions', 'Austin, TX'),
-- Students
('a0000000-0000-4000-8000-000000000004', 'Alex', 'Rivera', 'alex.rivera@student.edu', '$2b$10$seedplaceholder.StudentPasswordHash01', 'student', '+1-555-0301', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'Computer Science Senior specializing in Full-Stack Web Development', 'Boston, MA'),
('a0000000-0000-4000-8000-000000000005', 'Priya', 'Sharma', 'priya.sharma@student.edu', '$2b$10$seedplaceholder.StudentPasswordHash02', 'student', '+1-555-0302', 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', 'Software Engineering graduate student passionate about Cloud & DevOps', 'Seattle, WA'),
('a0000000-0000-4000-8000-000000000006', 'David', 'Kim', 'david.kim@student.edu', '$2b$10$seedplaceholder.StudentPasswordHash03', 'student', '+1-555-0303', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', 'Aspiring Frontend Engineer with strong React and UI design skills', 'Chicago, IL');

-- 2. SEED COMPANIES
INSERT INTO companies (id, recruiter_id, name, description, website, logo, industry, location) VALUES
('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'TechCorp Innovations', 'Leading provider of enterprise web applications and AI-driven solutions.', 'https://techcorp.example.com', 'https://api.dicebear.com/7.x/initials/svg?seed=TC', 'Software & IT', 'New York, NY'),
('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'CloudScale Solutions', 'Next-generation cloud infrastructure and microservices consulting platform.', 'https://cloudscale.example.io', 'https://api.dicebear.com/7.x/initials/svg?seed=CS', 'Cloud Computing', 'Austin, TX'),
('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'DataNexus Inc.', 'Pioneering big data analytics and distributed database technologies.', 'https://datanexus.example.com', 'https://api.dicebear.com/7.x/initials/svg?seed=DN', 'Data Analytics', 'San Jose, CA');

-- 3. SEED SKILLS (16 Skills)
INSERT INTO skills (id, name) VALUES
('c0000000-0000-4000-8000-000000000001', 'React'),
('c0000000-0000-4000-8000-000000000002', 'Node.js'),
('c0000000-0000-4000-8000-000000000003', 'TypeScript'),
('c0000000-0000-4000-8000-000000000004', 'JavaScript'),
('c0000000-0000-4000-8000-000000000005', 'Python'),
('c0000000-0000-4000-8000-000000000006', 'Java'),
('c0000000-0000-4000-8000-000000000007', 'PostgreSQL'),
('c0000000-0000-4000-8000-000000000008', 'MongoDB'),
('c0000000-0000-4000-8000-000000000009', 'Docker'),
('c0000000-0000-4000-8000-000000000010', 'AWS'),
('c0000000-0000-4000-8000-000000000011', 'Express.js'),
('c0000000-0000-4000-8000-000000000012', 'Git'),
('c0000000-0000-4000-8000-000000000013', 'GitHub'),
('c0000000-0000-4000-8000-000000000014', 'Tailwind CSS'),
('c0000000-0000-4000-8000-000000000015', 'REST API'),
('c0000000-0000-4000-8000-000000000016', 'GraphQL');

-- 4. SEED JOBS (11 Jobs)
INSERT INTO jobs (id, company_id, recruiter_id, title, description, job_type, work_mode, location, salary_min, salary_max, experience_level, application_deadline, status) VALUES
('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Junior Full-Stack Developer', 'Join TechCorp to build scalable web applications using React, Node.js, and PostgreSQL.', 'FULL_TIME', 'HYBRID', 'New York, NY', 85000.00, 110000.00, 'Entry Level (0-2 years)', '2026-12-31', 'ACTIVE'),
('d0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Frontend React Engineer', 'Seeking a skilled frontend developer proficient in TypeScript, React, and Tailwind CSS.', 'FULL_TIME', 'REMOTE', 'Remote - US', 90000.00, 125000.00, 'Mid Level (2-4 years)', '2026-11-30', 'ACTIVE'),
('d0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Software Engineering Intern', 'Summer 2027 internship program for CS students. Hands-on experience with Node.js and REST APIs.', 'INTERNSHIP', 'ONSITE', 'New York, NY', 40000.00, 55000.00, 'Internship', '2026-10-15', 'ACTIVE'),

('d0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'Cloud Infrastructure Engineer', 'Manage AWS services, Docker containers, and CI/CD deployment pipelines at CloudScale.', 'FULL_TIME', 'REMOTE', 'Remote', 115000.00, 145000.00, 'Senior Level (4+ years)', '2026-12-15', 'ACTIVE'),
('d0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'Backend Node.js Developer', 'Design microservices and database schemas using PostgreSQL and TypeScript.', 'FULL_TIME', 'HYBRID', 'Austin, TX', 95000.00, 130000.00, 'Mid Level (2+ years)', '2026-11-15', 'ACTIVE'),
('d0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'DevOps Contract Specialist', 'Contract position to optimize Dockerized deployments on AWS infrastructure.', 'CONTRACT', 'REMOTE', 'Remote', 80000.00, 110000.00, 'Senior Level', '2026-09-30', 'ACTIVE'),

('d0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'Database Administrator (PostgreSQL)', 'Optimize high-throughput relational databases and design secure data pipelines.', 'FULL_TIME', 'ONSITE', 'San Jose, CA', 120000.00, 160000.00, 'Senior Level (5+ years)', '2026-12-01', 'ACTIVE'),
('d0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'Python Data Engineer', 'Build data pipelines using Python, SQL, and distributed compute frameworks.', 'FULL_TIME', 'HYBRID', 'San Jose, CA', 105000.00, 140000.00, 'Mid Level (3+ years)', '2026-10-30', 'ACTIVE'),
('d0000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'Part-Time Web Developer', 'Maintain corporate website and web portals using JavaScript and React.', 'PART_TIME', 'REMOTE', 'Remote', 35000.00, 50000.00, 'Entry Level', '2026-10-01', 'ACTIVE'),
('d0000000-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Lead Architect (Draft)', 'Upcoming position for enterprise software architecture.', 'FULL_TIME', 'ONSITE', 'New York, NY', 160000.00, 210000.00, 'Principal', '2026-12-31', 'DRAFT'),
('d0000000-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'Legacy Systems Engineer (Closed)', 'Filled position for maintaining legacy backend APIs.', 'FULL_TIME', 'ONSITE', 'Austin, TX', 90000.00, 115000.00, 'Mid Level', '2026-08-01', 'CLOSED');

-- 5. SEED RESUMES
INSERT INTO resumes (id, student_id, file_url, file_name, is_default) VALUES
('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'https://storage.skillbridge.dev/resumes/alex_rivera_fullstack.pdf', 'Alex_Rivera_FullStack_Resume.pdf', TRUE),
('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000005', 'https://storage.skillbridge.dev/resumes/priya_sharma_cloud.pdf', 'Priya_Sharma_Cloud_DevOps.pdf', TRUE),
('e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000006', 'https://storage.skillbridge.dev/resumes/david_kim_frontend.pdf', 'David_Kim_Frontend_Developer.pdf', TRUE);

-- 6. SEED APPLICATIONS
INSERT INTO applications (id, job_id, student_id, resume_id, cover_letter, status) VALUES
('f0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000001', 'I am excited to apply for the Junior Full-Stack Developer position. My background in React and Node.js aligns closely with your tech stack.', 'SHORTLISTED'),
('f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000006', 'e0000000-0000-4000-8000-000000000003', 'As a passionate frontend designer and engineer, I would love to contribute to TechCorps React web apps.', 'REVIEWING'),
('f0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000002', 'I have hands-on experience with AWS and Docker containers and look forward to managing infrastructure at CloudScale.', 'INTERVIEW'),
('f0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000001', 'Expressing my enthusiasm for the Node.js backend developer role in Austin.', 'APPLIED');

-- 7. SEED SAVED JOBS
INSERT INTO saved_jobs (id, student_id, job_id) VALUES
('f0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000004'),
('f0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000005'),
('f0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000001');

-- 8. SEED USER SKILLS
INSERT INTO user_skills (user_id, skill_id) VALUES
-- Alex (Full-Stack Student)
('a0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000001'), -- React
('a0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000002'), -- Node.js
('a0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000003'), -- TypeScript
('a0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000007'), -- PostgreSQL
-- Priya (Cloud / DevOps Student)
('a0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000005'), -- Python
('a0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000009'), -- Docker
('a0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000010'), -- AWS
-- David (Frontend Student)
('a0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000001'), -- React
('a0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000004'), -- JavaScript
('a0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000014'); -- Tailwind CSS

-- 9. SEED NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
('f0000000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000004', 'Application Status Updated', 'Your application for Junior Full-Stack Developer has been shortlisted by TechCorp Innovations!', 'APPLICATION_UPDATE', FALSE),
('f0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000005', 'Interview Scheduled', 'CloudScale Solutions has invited you to an interview for Cloud Infrastructure Engineer.', 'INTERVIEW_INVITE', FALSE),
('f0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000002', 'New Applicant', 'Alex Rivera has applied for your Junior Full-Stack Developer job opening.', 'NEW_APPLICANT', TRUE);
