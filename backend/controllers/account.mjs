// routes/account.js
import express from "express";
import User from "../schemas/User.mjs"; // Import the User schema
import db from "../db/conn.mjs";
import crypto from "crypto";

const userRoutes = express.Router();

async function checkRights(req, res, next) {
  try {
    // Ensure req.user is defined
    if (!req.params || !req.body) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch the user from the database
    const userFromDb = await db
      .collection("users")
      .findOne({ user_num: parseInt(req.params.user_num) });

    // Ensure user exists in the database
    if (!userFromDb) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Compare the IDs
    if (req.body.id === userFromDb._id.toString()) {
      return next(); // User has access, proceed to the next middleware
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    console.error("Error checking rights:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// GET all users
userRoutes.get("/get/all", async (req, res) => {
  try {
    const users = await db.collection("users").find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

userRoutes.get("/get/:username", async (req, res) => {
  // TODO implement logic that retrives usernames close to entered name if none exist, maybe 5-10?
  try {
    const user = await db
      .collection("users")
      .findOne({ username: parseInt(req.params.username) });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// GET a user by ID
userRoutes.get("/get/:user_num", async (req, res) => {
  try {
    const user = await db
      .collection("users")
      .findOne({ user_num: parseInt(req.params.user_num) });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// POST new users
userRoutes.post("/create", async (req, res) => {
  console.log("starting");
  try {
    //console.log("body", req.body); // Log the user data

    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." });
    }

    // Generate salt and hash the password
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      async (err, hashedPassword) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res
            .status(500)
            .json({ error: "An error occurred while hashing the password" });
        }

        // Create a new user object
        const newUser = new User({
          email: email,
          username: username,
          hashed_password: hashedPassword.toString("hex"), // Store the hashed password as a string
          salt: salt,
          user_profile: "",
          friends: [],
          blocked: [],
          groups: [],
        });

        // Save the user to the database
        await newUser.save();
        //console.log(`User created: ${newUser}`);
        res.status(201).json(newUser);
      }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// ! MUST HAVE PROPER AUTHORIZATION TO DELETE USER
// DELETE user
userRoutes.delete("/delete/:user_num", checkRights, async (req, res) => {
  try {
    const result = await db
      .collection("users")
      .deleteOne({ user_num: parseInt(req.params.user_num) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// ! MUST HAVE PROPER AUTHORIZATION TO UPDATE USER
userRoutes.put("/update/:user_num", checkRights, async (req, res) => {
  // * empty values assume no change to that field
  console.log("Received PUT request with params:", req.params); // Log parameters
  try {
    const result = await db.collection("users").updateOne(
      { user_num: parseInt(req.params.user_num) },
      //updates name if it is not empty
      req.params.username != ""
        ? { $set: { username: req.body.username } }
        : {},
      //updates profile if it is not empty
      req.params.user_profile != ""
        ? { $set: { user_profile: req.body.user_profile } }
        : {}
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

export default userRoutes;
