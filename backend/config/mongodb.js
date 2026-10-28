import mongoose from "mongoose";

// Event listeners
mongoose.connection.on("connected", () => console.log("Database Connected"));
mongoose.connection.on("error", (err) => console.error("Database connection error:", err));

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined in .env");

    // Mongoose 7+ does NOT require useNewUrlParser or useUnifiedTopology
    await mongoose.connect(uri);

    console.log("MongoDB connection successful");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
};

export default connectDB;