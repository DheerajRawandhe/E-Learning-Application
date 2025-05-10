CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    courseTitle VARCHAR(255) NOT NULL,
    subTitle VARCHAR(255),
    description TEXT,
    category VARCHAR(100) NOT NULL,
    courseLevel ENUM('Beginner', 'Medium', 'Advance'),
    coursePrice FLOAT,
    courseThumbnail VARCHAR(500),
    isPublished BOOLEAN DEFAULT FALSE,
    creator INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
