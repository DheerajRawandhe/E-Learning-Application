import { CourseProgress } from "../models/courseProgress.sql";
import  {Course} from "../models/course.sql";

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    const [courseRows] = await pool.execute(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [lectureRows] = await pool.execute(
      'SELECT * FROM lectures WHERE courseId = ?',
      [courseId]
    );

    const [progressRows] = await pool.execute(
      'SELECT * FROM course_progress WHERE userId = ? AND courseId = ?',
      [userId, courseId]
    );

    if (progressRows.length === 0) {
      return res.status(200).json({
        data: {
          courseDetails: courseRows[0],
          lectures: lectureRows,
          progress: [],
          completed: false,
        },
      });
    }

    const courseProgressId = progressRows[0].id;
    const [lectureProgressRows] = await pool.execute(
      'SELECT * FROM lecture_progress WHERE courseProgressId = ?',
      [courseProgressId]
    );

    return res.status(200).json({
      data: {
        courseDetails: courseRows[0],
        lectures: lectureRows,
        progress: lectureProgressRows,
        completed: progressRows[0].completed,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    const [progressRows] = await pool.execute(
      'SELECT * FROM course_progress WHERE courseId = ? AND userId = ?',
      [courseId, userId]
    );

    let courseProgressId;
    if (progressRows.length === 0) {
      const [result] = await pool.execute(
        'INSERT INTO course_progress (userId, courseId, completed) VALUES (?, ?, ?)',
        [userId, courseId, false]
      );
      courseProgressId = result.insertId;
    } else {
      courseProgressId = progressRows[0].id;
    }

    const [lectureRows] = await pool.execute(
      'SELECT * FROM lecture_progress WHERE courseProgressId = ? AND lectureId = ?',
      [courseProgressId, lectureId]
    );

    if (lectureRows.length > 0) {
      await pool.execute(
        'UPDATE lecture_progress SET viewed = ? WHERE courseProgressId = ? AND lectureId = ?',
        [true, courseProgressId, lectureId]
      );
    } else {
      await pool.execute(
        'INSERT INTO lecture_progress (courseProgressId, lectureId, viewed) VALUES (?, ?, ?)',
        [courseProgressId, lectureId, true]
      );
    }
    const [totalLectures] = await pool.execute(
      'SELECT COUNT(*) as total FROM lectures WHERE courseId = ?',
      [courseId]
    );
    const [viewedLectures] = await pool.execute(
      'SELECT COUNT(*) as viewed FROM lecture_progress WHERE courseProgressId = ? AND viewed = true',
      [courseProgressId]
    );

    const isCompleted = totalLectures[0].total === viewedLectures[0].viewed;

    await pool.execute(
      'UPDATE course_progress SET completed = ? WHERE id = ?',
      [isCompleted, courseProgressId]
    );

    return res.status(200).json({ message: 'Lecture progress updated successfully.' });
  } catch (error) {
    console.log(error);
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const [progressRows] = await pool.execute(
      'SELECT * FROM course_progress WHERE courseId = ? AND userId = ?',
      [courseId, userId]
    );
    if (progressRows.length === 0) {
      return res.status(404).json({ message: 'Course progress not found' });
    }

    const courseProgressId = progressRows[0].id;

    const [lectureIds] = await pool.execute(
      'SELECT id FROM lectures WHERE courseId = ?',
      [courseId]
    );

    for (let lecture of lectureIds) {
      await pool.execute(
        'INSERT INTO lecture_progress (courseProgressId, lectureId, viewed) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE viewed = VALUES(viewed)',
        [courseProgressId, lecture.id, true]
      );
    }

    await pool.execute(
      'UPDATE course_progress SET completed = ? WHERE id = ?',
      [true, courseProgressId]
    );

    return res.status(200).json({ message: 'Course marked as completed.' });
  } catch (error) {
    console.log(error);
  }
};
export const markAsInCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const [progressRows] = await pool.execute(
      'SELECT * FROM course_progress WHERE courseId = ? AND userId = ?',
      [courseId, userId]
    );
    if (progressRows.length === 0) {
      return res.status(404).json({ message: 'Course progress not found' });
    }

    const courseProgressId = progressRows[0].id;

    await pool.execute(
      'UPDATE lecture_progress SET viewed = false WHERE courseProgressId = ?',
      [courseProgressId]
    );

    await pool.execute(
      'UPDATE course_progress SET completed = false WHERE id = ?',
      [courseProgressId]
    );

    return res.status(200).json({ message: 'Course marked as incompleted.' });
  } catch (error) {
    console.log(error);
  }
};



