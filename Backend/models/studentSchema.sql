
-- Demo Table for Students 

CREATE TABLE student (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fullName VARCHAR(60) NOT NULL,
    email VARCHAR(50) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    courseId VARCHAR(50) NOT NULL,
    imageUrl VARCHAR(255),
    imageId VARCHAR(50),
    uId VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

);





