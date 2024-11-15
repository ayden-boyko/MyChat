// routes/login.js
import express from "express";
//import User from "../schemas/User.mjs"; // Import the User schema
import db from "../db/conn.mjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"; //middleware for authentication
import crypto from "crypto";
import User from "../schemas/User.mjs";
// import jsonwebtoken
import jwt from "jsonwebtoken";

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
      const returnedUser = await db
        .collection("users")
        .findOne({ email: user.email }, { projection: { chat: 0 } });

      // console.log(
      //   "login.mjs - 81 -pulled user from login credentials",
      //   returnedUser
      // );

      await User.updateOne(
        { user_uuid: returnedUser.user_uuid },
        { $set: { online: true } }
      );

      const jwttoken = jwt.sign(
        { user_uuid: returnedUser.user_uuid },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "24h",
        }
      );

      req.session.token = jwttoken;
      req.session.user = returnedUser;
      req.session.isLoggedOut = false;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
        } else {
          console.log("Session saved with session ID:", req.sessionID);
          res.status(200).json({ pulledUser: returnedUser, token: jwttoken });
        }
      });
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

    req.session.isLoggedOut = true;
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      } else {
        console.log("Session saved with session ID:", req.sessionID);
      }
    });
    res.redirect("/");
  });
});

export default loginController;
