import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config({});
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin:"http://localhost:5173",
  // origin: "https://e-learning-n74g.onrender.com",
    credentials:true
}));

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);


// app.get("/home", (req, res) => {
//     res.status(200).json({
//         success:true,
//         message: "Hello i am comming from backend"
//     })
// }) 

app.listen(PORT, () => {
    console.log(`Server listen at port http://localhost:${PORT}`);
})

