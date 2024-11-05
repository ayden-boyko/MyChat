// controllers/account.js
import express from "express";
import User from "../schemas/User.mjs"; // Import the User schema
import db from "../db/conn.mjs";
import crypto from "crypto";
import checkRights from "../middleware/authenticationhandler.mjs";

const userController = express.Router();

// GET all users
userController.get("/get/all", async (req, res) => {
  try {
    const users = await db.collection("users").find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "An error while getting all users" });
  }
});

// GET a user by USERNAME
userController.get("/get/name/:username", async (req, res) => {
  try {
    // Search for users that utilizes fuzzy search for usernames
    const user = await db
      .collection("users")
      .aggregate([
        {
          $search: {
            index: "usernameSearchIndex",
            text: {
              query: req.params.username,
              path: "username",
              fuzzy: {
                maxEdits: 2, // Allow up to 2 changes (insertion, deletion, substitution)
                prefixLength: 2, // Require at least 2 starting characters to match
                maxExpansions: 100, // Limit the number of expansions for the fuzzy search
              },
            },
          },
        },
      ])
      .toArray();
    //console.log("users", user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "An error while getting user by USERNAME" });
  }
});

// GET a user by ID
userController.get("/get/id/:user_uuid", async (req, res) => {
  try {
    const user = await db
      .collection("users")
      .findOne({ user_uuid: req.params.user_uuid });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "An error while getting user by ID" });
  }
});

// POST create new users
userController.post("/create", async (req, res) => {
  console.log("account.mjs - 94 -starting");
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
        });

        // Save the user to the database
        await newUser.save();
        //console.log(`User created: ${newUser}`);
        res.status(201).json(newUser);
      }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// DELETE user, uses JWT
userController.delete("/delete/:user_uuid", checkRights, async (req, res) => {
  try {
    const result = await db
      .collection("users")
      .deleteOne({ user_uuid: req.params.user_uuid });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// PUT update username/profile (may have parameters change after JWT is implemented)
userController.put("/update/:user_uuid", checkRights, async (req, res) => {
  // * empty values assume no change to that field
  console.log(
    "account.mjs - 161 - Received PUT request with params:",
    req.params
  ); // Log parameters
  try {
    const result = await db.collection("users").updateOne(
      { user_uuid: req.params.user_uuid },
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
    res.status(500).json({ error: "An error while updating the user profile" });
  }
});

// TODO reset mith email? theres gotta be a better way, checkrights needs to implement JWT
// PUT update password
userController.put(
  "/update/password/:user_uuid",
  checkRights,
  async (req, res) => {
    try {
      const salt = crypto.randomBytes(16).toString("hex");
      crypto.pbkdf2(
        req.body.password,
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
          const result = await db.collection("users").updateOne(
            { user_uuid: req.params.user_uuid },
            {
              $set: {
                hashed_password: hashedPassword.toString("hex"),
                salt: salt,
              },
            }
          );
          res.json(result);
        }
      );
    } catch (error) {
      res.status(500).json({ error: "An error while updating password" });
    }
  }
);

export default userController;
