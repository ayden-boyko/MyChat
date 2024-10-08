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
    const test_data = req.body; // Assume this is an array of user objects

    const existingUsers = await db
      .collection("Users")
      .find({ user_num: { $in: test_data.map((user) => user.user_num) } })
      .toArray();

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: "Duplicate users found",
        duplicates: existingUsers.map((user) => user.id),
      });
    }

    const newUser = new User({
      name: test_data[0].name,
      user_name: test_data[0].user_name,
      password: test_data[0].password,
      user_profile: test_data[0].user_profile,
      friends: test_data[0].friends,
      blocked: test_data[0].blocked,
      groups: test_data[0].groups,
    });

    // Insert new users
    await newUser.save();
    const insertResult = await db
      .collection("Users")
      .find({ user_num: { $in: newUser.user_num } })
      .toArray();

    res.json(insertResult);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
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
  "/update/:user_num/:user_name/:user_profile",
  async (req, res) => {
    // * empty values assume no change to that field
    console.log("Received PUT request with params:", req.params); // Log parameters
    try {
      const result = await db.collection("Users").updateOne(
        { user_num: parseInt(req.params.user_num) },
        //updates name if it is not empty
        req.params.user_name != ""
          ? { $set: { user_name: req.params.user_name } }
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
