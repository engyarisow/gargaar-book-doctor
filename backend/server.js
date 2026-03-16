import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); 
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from './routes/doctorRoute.js'
import userRouter from "./routes/userRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();
connectCloudinary();
// Middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use('/api/admin',adminRouter)
// localhost:4000/api/admin/add-doctor
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

// Test route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));