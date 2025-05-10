CREATE TABLE lecture_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    courseProgressId INT, 
    lectureId INT, 
    viewed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (courseProgressId) REFERENCES course_progress(id)
);

CREATE TABLE course_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT, 
    courseId INT, 
    completed BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



