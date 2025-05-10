import {User} from "../models/user.sql";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

exports.register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
      }
  
      const [existingUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(400).json({ success: false, message: "User already exists with this email." });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
  
      return res.status(201).json({ success: true, message: "Account created successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Failed to register" });
    }
  };
  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
      }
  
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(400).json({ success: false, message: "Incorrect email or password" });
      }
  
      const user = users[0];
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ success: false, message: "Incorrect email or password" });
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });
  
      return res.status(200).json({ success: true, message: `Welcome back ${user.name}` });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Failed to login" });
    }
  };

  exports.logout = (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  };
  
  exports.getUserProfile = async (req, res) => {
    try {
      const userId = req.id;
      const [users] = await pool.execute('SELECT id, name, email, role, photoUrl, createdAt, updatedAt FROM users WHERE id = ?', [userId]);
  
      if (users.length === 0) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }
  
      const user = users[0];
  
      const [enrolledCourses] = await pool.execute(
        `SELECT c.* FROM courses c
         JOIN user_enrolled_courses uec ON c.id = uec.courseId
         WHERE uec.userId = ?`, [userId]
      );
  
      user.enrolledCourses = enrolledCourses;
  
      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Failed to load user" });
    }
  };

  exports.updateProfile = async (req, res) => {
    try {
      const userId = req.id;
      const { name } = req.body;
      const profilePhoto = req.file;
  
      const [users] = await pool.execute('SELECT photoUrl FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      let photoUrl = users[0].photoUrl;
  
      if (photoUrl) {
        const publicId = photoUrl.split('/').pop().split('.')[0];
        await deleteMediaFromCloudinary(publicId);
      }
  
      const cloudResponse = await uploadMedia(profilePhoto.path);
      photoUrl = cloudResponse.secure_url;
  
      await pool.execute('UPDATE users SET name = ?, photoUrl = ? WHERE id = ?', [name, photoUrl, userId]);
  
      const [updatedUsers] = await pool.execute('SELECT id, name, email, role, photoUrl, createdAt, updatedAt FROM users WHERE id = ?', [userId]);
  
      return res.status(200).json({
        success: true,
        user: updatedUsers[0],
        message: "Profile updated successfully."
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Failed to update profile" });
    }
  };