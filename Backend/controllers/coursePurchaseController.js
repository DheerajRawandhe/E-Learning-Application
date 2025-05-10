import Stripe from "stripe";
import { Course } from "../models/course.sql";
import { CoursePurchase } from "../models/coursePurchase.sql";
import { Lecture } from "../models/lecture.sql";
import { User } from "../models/user.sql";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;
    const [courseRows] = await pool.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found!' });
    }
    const course = courseRows[0];
    const [purchaseResult] = await pool.execute(
      'INSERT INTO course_purchase (courseId, userId, amount, status, paymentId) VALUES (?, ?, ?, ?, ?)',
      [courseId, userId, course.coursePrice, 'pending', '']
    );
    const purchaseId = purchaseResult.insertId;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
          price_data: {currency: 'inr',
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/course-progress/${courseId}`,
      cancel_url: `http://localhost:5173/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: userId,
        purchaseId: purchaseId,
      },
      shipping_address_collection: {
        allowed_countries: ['IN'],
      },
    });

    await pool.execute('UPDATE course_purchase SET paymentId = ? WHERE id = ?', [session.id, purchaseId]);

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
exports.stripeWebhook = async (req, res) => {
  let event;
  try {
    const payload = req.rawBody;
    const sig = req.headers['stripe-signature'];
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { courseId, userId, purchaseId } = session.metadata;

    try {
      const amount = session.amount_total / 100;
      await pool.execute(
        'UPDATE course_purchase SET status = ?, amount = ? WHERE id = ?',
        ['completed', amount, purchaseId]
      );
      await pool.execute(
        'INSERT INTO user_enrolled_courses (userId, courseId) VALUES (?, ?) ON DUPLICATE KEY UPDATE userId = userId',
        [userId, courseId]
      );
    } catch (error) {
      console.error('Error handling event:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  res.status(200).send();
};

exports.getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    const [courseRows] = await pool.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found!' });
    }
    const course = courseRows[0];
    const [purchaseRows] = await pool.execute(
      'SELECT * FROM course_purchase WHERE userId = ? AND courseId = ? AND status = ?',
      [userId, courseId, 'completed']
    );
    const purchased = purchaseRows.length > 0;

    return res.status(200).json({
      course,
      purchased,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAllPurchasedCourse = async (req, res) => {
  try {
    const userId = req.id;
    const [purchaseRows] = await pool.execute(
      'SELECT cp.*, c.courseTitle, c.courseThumbnail FROM course_purchase cp JOIN courses c ON cp.courseId = c.id WHERE cp.userId = ? AND cp.status = ?',
      [userId, 'completed']
    );

    return res.status(200).json({
      purchasedCourses: purchaseRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

