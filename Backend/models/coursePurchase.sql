CREATE TABLE course_purchase (
    id INT AUTO_INCREMENT PRIMARY KEY,
    courseId INT NOT NULL,     
    userId INT NOT NULL,       
    amount FLOAT NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    paymentId VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
