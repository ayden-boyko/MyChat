"use strict";
import express from "express";
import "./loadEnviroment.mjs"; // Load environment variables
import db from "./db/conn.mjs";
import userRoutes from "./routes/account.mjs";
import loginRoutes from "./routes/login.mjs";
import cors from "cors";
import session from "express-session";
import mongoStore from "connect-mongo";
import passport from "passport";

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(cors());

// Set CORS headers for all responses
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Express session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY, //signs the session ID cookie
    resave: false, //tells express to save session even if it wasnt modified
    saveUninitialized: false, //When false, it avoids storing sessions that haven’t been modified (user isn’t logged in).
    cookie: {
      //options for the session cookie
      maxAge: 1000 * 60 * 60 * 24, // expires in 1 day
    },
    store: new mongoStore({
      mongoUrl: process.env.ATLAS_URI,
      collection: "sessions",
    }),
  })
);

//authenticates session
app.use(passport.authenticate("session"));

// Use the user routes
app.use("/api/users", userRoutes);

// Use the login routes
app.use("/api/login", loginRoutes);

app.get("/", async (req, res) => {
  try {
    console.log("GET", req.body);
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Fetch data from the database
    const result = await db.collection("Users").find({}).toArray();

    // Send data as JSON (automatically sets Content-Type and ends the response)
    res.json(result);
  } catch (error) {
    // Handle any errors and send appropriate response
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/", async (req, res) => {
  try {
    console.log("POST", req.body);

    res.setHeader("Access-Control-Allow-Origin", "*");

    // Check if there are any existing users with matching IDs in test_data
    const existingUsers = await db
      .collection("Users")
      .find({ id: { $in: test_data.map((user) => user.id) } })
      .toArray();

    if (existingUsers.length > 0) {
      // If duplicates are found, return an error message with the duplicates
      return res.status(409).json({
        error: "Duplicate users found",
        duplicates: existingUsers.map((user) => user.id),
      });
    }

    // If no duplicates are found, proceed with the insertion
    const insertResult = await db.collection("Users").insertMany(test_data);
    console.log("Data inserted", insertResult);

    // Fetch and return the updated list of users
    const updatedResult = await db.collection("Users").find({}).toArray();
    res.json(updatedResult);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
