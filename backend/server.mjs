"use strict";
//local imports
import "./loadEnviroment.mjs"; // Load environment variables
import db from "./db/conn.mjs";
import userController from "./controllers/account.mjs";
import loginController from "./controllers/login.mjs";
import friendController from "./controllers/friend.mjs";
import notificationController from "./controllers/notification.mjs";

//external imports
import express from "express";
import cors from "cors";
import session from "express-session";
import mongoStore from "connect-mongo";
import passport from "passport";
import { Server } from "socket.io";
import http from "http";
import join from "path";
// TODO SET UP SOCKET.IO SERVERS
// TODO USE JWT FOR AUTHORIZATION
// TODO HAVE BACKEND SEND FRONTEND FILES
/*
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});
*/

const PORT = process.env.PORT || 8000;

const app = express();
// create socket io server for messages
const server = http.createServer(app);
const io = new Server(server);

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

// Use the user controller
app.use("/api/users", userController);

// Use the login controller
app.use("/api/login", loginController);

// Use the friend controller
app.use("/api/friend", friendController);

// Use the notification controller
app.use("/api/notification", notificationController);

// Use the chat controller
app.use("/api/chat", chatController);

app.get("/", async (req, res) => {
  try {
    console.log("server.mjs - 64 - GET", req.body);
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Fetch data from the database
    const result = await db.collection("users").find({}).toArray();

    // Send data as JSON (automatically sets Content-Type and ends the response)
    res.json(result);
  } catch (error) {
    // Handle any errors and send appropriate response
    res.status(500).json({ error: "An error occurred" });
  }
});

// socket io server logics

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
