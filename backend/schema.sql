-- Schools shown on Home
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO schools (name) VALUES
  ('School of Agriculture, Food Security and Environmental Sciences'),
  ('School of Arts and Social Sciences'),
  ('School of Business and Economics'),
  ('School of Computing and Informatics'),
  ('School of Development and Strategic Studies'),
  ('School of Education'),
  ('School of Law'),
  ('School of Mathematics and Actuarial Science'),
  ('School of Medicine'),
  ('School of Nursing'),
  ('School of Pharmacy'),
  ('School of Physical and Biological Sciences'),
  ('School of Planning and Architecture'),
  ('School of Public Health and Community Development'),
  ('Other Departments & Schools');

-- Departments belong to a school. New ones are created automatically
-- the first time someone uploads a paper naming a department that
-- doesn't exist yet under that school.
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  school_id INTEGER NOT NULL REFERENCES schools(id)
);

-- Past papers. Starts pending; an admin approves or rejects it.
CREATE TABLE papers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  semester VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  pdf_url TEXT,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User-submitted issue reports (Report an Issue screen)
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Admin dashboard accounts
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);