import { Course } from "../models/course.sql";
import { Lecture } from "../models/lecture.sql";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js";

exports.createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    const creator = req.id; 
    if (!courseTitle || !category) {
      return res.status(400).json({ message: "Course title and category are required." });
    }
    const [result] = await pool.execute(
      'INSERT INTO courses (courseTitle, category, creator) VALUES (?, ?, ?)',
      [courseTitle, category, creator]
    );

    const [course] = await pool.execute('SELECT * FROM courses WHERE id = ?', [result.insertId]);

    return res.status(201).json({ course: course[0], message: "Course created." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create course" });
  }
};

exports.searchCourse = async (req, res) => {
  try {
    const { query = "", categories = [], sortByPrice = "" } = req.query;

    let sql = 'SELECT * FROM courses WHERE isPublished = TRUE';
    const params = [];

    if (query) {
      sql += ' AND (courseTitle LIKE ? OR subTitle LIKE ? OR category LIKE ?)';
      const likeQuery = `%${query}%`;
      params.push(likeQuery, likeQuery, likeQuery);
    }

    if (categories.length > 0) {
      const placeholders = categories.map(() => '?').join(',');
      sql += ` AND category IN (${placeholders})`;
      params.push(...categories);
    }

    if (sortByPrice === "low") {
      sql += ' ORDER BY coursePrice ASC';
    } else if (sortByPrice === "high") {
      sql += ' ORDER BY coursePrice DESC';
    }

    const [courses] = await pool.execute(sql, params);

    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to search courses" });
  }
};

exports.getPublishedCourses = async (req, res) => {
  try {
    const [courses] = await pool.execute('SELECT * FROM courses WHERE isPublished = TRUE');
    return res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get published courses" });
  }
};

exports.getCreatorCourses = async (req, res) => {
  try {
    const creator = req.id;
    const [courses] = await pool.execute('SELECT * FROM courses WHERE creator = ?', [creator]);
    return res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get creator courses" });
  }
};

exports.editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;

    const [result] = await pool.execute(
      'UPDATE courses SET courseTitle = ?, subTitle = ?, description = ?, category = ?, courseLevel = ?, coursePrice = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [courseTitle, subTitle, description, category, courseLevel, coursePrice, courseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found!" });
    }

    const [course] = await pool.execute('SELECT * FROM courses WHERE id = ?', [courseId]);

    return res.status(200).json({ course: course[0], message: "Course updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to edit course" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const [course] = await pool.execute('SELECT * FROM courses WHERE id = ?', [courseId]);

    if (course.length === 0) {
      return res.status(404).json({ message: "Course not found!" });
    }

    return res.status(200).json({ course: course[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get course by id" });
  }
};

exports.createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const courseId = req.params.courseId;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({ message: "Lecture title and course ID are required." });
    }

    const [result] = await pool.execute(
      'INSERT INTO lectures (lectureTitle) VALUES (?)',
      [lectureTitle]
    );

    const lectureId = result.insertId;
    await pool.execute(
      'INSERT INTO course_lectures (course_id, lecture_id) VALUES (?, ?)',
      [courseId, lectureId]
    );

    const [lecture] = await pool.execute('SELECT * FROM lectures WHERE id = ?', [lectureId]);

    return res.status(201).json({ lecture: lecture[0], message: "Lecture created successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create lecture" });
  }
};

exports.getCourseLectures = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const [lectures] = await pool.execute(
      'SELECT l.* FROM lectures l JOIN course_lectures cl ON l.id = cl.lecture_id WHERE cl.course_id = ?',
      [courseId]
    );

    return res.status(200).json({ lectures });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get lectures" });
  }
};

exports.editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoUrl, publicId, isPreviewFree } = req.body;
    const lectureId = req.params.lectureId;

    const [result] = await pool.execute(
      'UPDATE lectures SET lectureTitle = ?, videoUrl = ?, publicId = ?, isPreviewFree = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [lectureTitle, videoUrl, publicId, isPreviewFree, lectureId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lecture not found!" });
    }

    const [lecture] = await pool.execute('SELECT * FROM lectures WHERE id = ?', [lectureId]);

    return res.status(200).json({ lecture: lecture[0], message: "Lecture updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to edit lecture" });
  }
};

exports.removeLecture = async (req, res) => {
    try {
      const lectureId = req.params.lectureId;
  
      await pool.execute('DELETE FROM course_lectures WHERE lecture_id = ?', [lectureId]);
      const [result] = await pool.execute('DELETE FROM lectures WHERE id = ?', [lectureId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Lecture not found!" });
      }
  
      return res.status(200).json({ message: "Lecture deleted successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to delete lecture." });
    }
  };

  