// routes/account.js
import express from "express";
import User from "../model/User.mjs"; // Import the User model
import db from "../db/conn.mjs";

const userRoutes = express.Router();

// GET all users
userRoutes.get("/get/all", async (req, res) => {
  try {
    const users = await db.collection("Users").find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// GET a user by ID
userRoutes.get("/get/:user_num", async (req, res) => {
  try {
    const user = await db
      .collection("Users")
      .findOne({ user_num: parseInt(req.params.user_num) });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// POST new users
userRoutes.post("/create", async (req, res) => {
  try {
    console.log(req.body); // Log the user data

    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await db.collection("Users").findOne({ email: email });
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
          return res
            .status(500)
            .json({ error: "An error occurred while hashing the password" });
        }

        // Create a new user object
        const newUser = new User({
          email: email,
          username: username,
          password: hashedPassword.toString("hex"), // Store the hashed password as a string
          user_profile: "",
          friends: [],
          blocked: [],
          groups: [],
        });

        // Save the user to the database
        await newUser.save();
        res.status(201).json({ message: "User created successfully!" });
      }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// ! MUST HAVE PROPER AUTHORIZATION TO DELETE USER
// DELETE user
userRoutes.delete("/delete/:user_num", async (req, res) => {
  try {
    const result = await db
      .collection("Users")
      .deleteOne({ user_num: parseInt(req.params.user_num) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

userRoutes.put(
  "/update/:user_num/:username/:user_profile",
  async (req, res) => {
    // * empty values assume no change to that field
    console.log("Received PUT request with params:", req.params); // Log parameters
    try {
      const result = await db.collection("Users").updateOne(
        { user_num: parseInt(req.params.user_num) },
        //updates name if it is not empty
        req.params.username != ""
          ? { $set: { username: req.params.username } }
          : {},
        //updates profile if it is not empty
        req.params.user_profile != ""
          ? { $set: { user_profile: req.params.user_profile } }
          : {}
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }
);

export default userRoutes;
