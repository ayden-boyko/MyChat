// routes/login.js
import express from "express";
import User from "../model/User.mjs"; // Import the User model
import db from "../db/conn.mjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"; //middleware for authentication
import crypto from "crypto";

const loginRoutes = express.Router();

//configuring local strategy
passport.use(
  //checks if users exists in database
  new LocalStrategy(async (username, password, done) => {
    const user = await db
      .collection("Users")
      .findOne({ username: username, password: password });
    if (user) {
      return done(null, user);
    }
    if (!user) {
      return done(null, false, { message: "Incorrect username or password" });
    }
    try {
      //checks if password is correct
      crypto.pbkdf2(
        password,
        row.salt,
        310000,
        32,
        "sha256",
        function (err, hashedPassword) {
          if (err) {
            return cb(err);
          }
          if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
            return cb(null, false, {
              message: "Incorrect username or password.",
            });
          }
          return cb(null, row);
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

loginRoutes.post(
  "/password",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })
);

loginRoutes.post("/sign_out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

export default loginRoutes;
