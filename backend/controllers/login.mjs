// routes/login.js
import express from "express";
//import User from "../schemas/User.mjs"; // Import the User schema
import db from "../db/conn.mjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"; //middleware for authentication
import crypto from "crypto";
import User from "../schemas/User.mjs";
import { register } from "module";

const loginController = express.Router();

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
      console.log("login.mjs - 46 -Password Hashing Error:", error);
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

loginController.post("/password", (req, res, next) => {
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
        .findOne({ email: user.email }, { projection: { chat: 0 } });

      console.log(
        "login.mjs - 81 -pulled user from login credentials",
        pulledUser
      );

      await User.updateOne(
        { user_uuid: pulledUser.user_uuid },
        { $set: { online: true } }
      );

      console.log("login.mjs - 88 - logged in"); // Log after successful login
      res.status(200).json(pulledUser);
    });
  })(req, res, next);
});

loginController.post("/sign_out", (req, res, next) => {
  req.logout(async (err) => {
    if (err) {
      return next(err);
    }
    await User.updateOne(
      { user_uuid: req.body.user_uuid },
      { $set: { online: false } }
    );
    res.redirect("/");
  });
});

export default loginController;
