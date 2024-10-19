// routes/login.js
import express from "express";
//import User from "../schemas/User.mjs"; // Import the User schema
import db from "../db/conn.mjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"; //middleware for authentication
import crypto from "crypto";

const loginRoutes = express.Router();

//configuring local strategy
passport.use(
  //checks if users exists in database
  new LocalStrategy(async (username, password, done) => {
    const user = await db.collection("users").findOne({ username: username });
    if (!user) {
      return done(null, false, { message: "Incorrect username or password" });
    }
    try {
      //checks if password is correct
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        function (err, hashedPassword) {
          if (err) {
            return done(err);
          }

          const storedHashedPassword = Buffer.from(user.hashed_password, "hex");

          // Compare the hashed password with the stored hash
          if (!crypto.timingSafeEqual(storedHashedPassword, hashedPassword)) {
            return done(null, false, {
              message: "Incorrect username or password.",
            });
          }
          return done(null, user);
        }
      );
    } catch (error) {
      console.log("Password Hashing Error:", error);
    }
  })
);

passport.serializeUser((user, done) => {
  process.nextTick(function () {
    done(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser((user, done) => {
  process.nextTick(function () {
    return done(null, user);
  });
});

loginRoutes.post("/password", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "An error occurred during authentication" });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return res.status(500).json({ message: "Error during login" });
      }
      let pulledUser = await db
        .collection("users")
        .findOne({ email: user.email });
      console.log("logged in"); // Log after successful login
      res.status(200).json(pulledUser);
    });
  })(req, res, next);
});

loginRoutes.post("/sign_out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

export default loginRoutes;
