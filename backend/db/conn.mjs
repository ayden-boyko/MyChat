// Import mongoose
import mongoose from "mongoose";

// Get the connection string from the environment variable
// If it's not set, use an empty string
const connectionString = process.env.ATLAS_URI || "";

// Function to connect to the MongoDB database
async function connectToDatabase() {
  try {
    // Connect to the database using Mongoose
    await mongoose.connect(connectionString, {
      dbName: "Chatroom",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("conn.mjs - 17 - Connected to MongoDB successfully");

    // Optionally, you can access the default connection
    const db = mongoose.connection;

    // You can also set up event listeners for error handling, etc.
    db.on("error", console.error.bind(console, "MongoDB connection error:"));

    return db; // Return the connection for further use
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

const db = await connectToDatabase();

export default db;
