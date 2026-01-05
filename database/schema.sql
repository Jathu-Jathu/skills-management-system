-- Create database if not exists
CREATE DATABASE IF NOT EXISTS skills_db;
USE skills_db;

-- Table for personnel
CREATE TABLE personnel (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(100),
    experience_level ENUM('Junior', 'Mid-Level', 'Senior'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_experience (experience_level)
);

-- Table for skills catalog
CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('Programming Language', 'Framework', 'Tool', 'Soft Skill', 'Database', 'Cloud'),
    description TEXT,
    INDEX idx_category (category)
);

-- Table for personnel skills (many-to-many relationship)
CREATE TABLE personnel_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    personnel_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
    FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_person_skill (personnel_id, skill_id),
    INDEX idx_proficiency (proficiency)
);

-- Table for projects
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status ENUM('Planning', 'Active', 'Completed') DEFAULT 'Planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- Table for project required skills
CREATE TABLE project_required_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    skill_id INT NOT NULL,
    min_proficiency ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_project (project_id)
);

-- Optional: Insert sample data for testing
INSERT INTO skills (name, category, description) VALUES
('React', 'Framework', 'JavaScript library for building user interfaces'),
('JavaScript', 'Programming Language', 'Programming language for web development'),
('Python', 'Programming Language', 'General-purpose programming language'),
('Node.js', 'Framework', 'JavaScript runtime built on Chrome V8 engine'),
('AWS', 'Cloud', 'Amazon Web Services cloud platform'),
('Communication', 'Soft Skill', 'Effective communication skills'),
('MySQL', 'Database', 'Relational database management system');

INSERT INTO personnel (name, email, role, experience_level) VALUES
('John Doe', 'john@example.com', 'Frontend Developer', 'Senior'),
('Jane Smith', 'jane@example.com', 'Backend Developer', 'Mid-Level'),
('Bob Johnson', 'bob@example.com', 'Full Stack Developer', 'Junior');

-- Assign skills to personnel
INSERT INTO personnel_skills (personnel_id, skill_id, proficiency) VALUES
(1, 1, 'Expert'),  -- John knows React at Expert level
(1, 2, 'Advanced'), -- John knows JavaScript at Advanced level
(2, 3, 'Advanced'), -- Jane knows Python at Advanced level
(2, 4, 'Intermediate'), -- Jane knows Node.js at Intermediate level
(3, 1, 'Intermediate'), -- Bob knows React at Intermediate level
(3, 2, 'Intermediate'); -- Bob knows JavaScript at Intermediate level