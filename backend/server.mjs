"use strict";
//local imports
import "./loadEnviroment.mjs"; // Load environment variables
import userController from "./controllers/account.mjs";
import loginController from "./controllers/login.mjs";
import friendController from "./controllers/friend.mjs";
import notificationController from "./controllers/notification.mjs";
import chatController from "./controllers/chat.mjs";
import UserNamespace from "./namespaces/usernamespace.mjs";
import GroupNamespace from "./namespaces/groupnamespace.mjs";
import groupController from "./controllers/group.mjs";
import SessionController from "./controllers/session.mjs";

//external imports
import express from "express";
import cors from "cors";
import session from "express-session";
import mongoStore from "connect-mongo";
import passport from "passport";
import { Server } from "socket.io";
import { createServer } from "http";
import { configDotenv } from "dotenv";
import crypto from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

configDotenv();

const PORT = process.env.PORT || 8000;

const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // Explicitly allow your frontend's origin
  credentials: true, // Allow credentials
};

app.use(express.json());
app.use(cors(corsOptions));

// Express session setup
console.log("creating sessions!");
app.use(
  session({
    genid: (req) => crypto.randomBytes(16).toString("hex"),
    secret: process.env.SESSION_SECRET_KEY, //signs the session ID cookie
    resave: false, //tells express to save session even if it wasnt modified
    saveUninitialized: true, //When false, it avoids storing sessions that haven’t been modified (user isn’t logged in).
    cookie: {
      //options for the session cookie
      maxAge: 1000 * 60 * 60 * 12, // expires in 12 hours
    },
    store: new mongoStore({
      mongoUrl: process.env.ATLAS_URI,
      // chatroom db
      dbName: "Chatroom",
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

// Use the group controller
app.use("/api/groups", groupController);

// Use the session controller
app.use("/api/session", SessionController);

// Correctly point to the 'dist' folder after build
const frontendPath = "/chatroom/dist"; // Adjust path if your output folder is different

// Serve static files from the 'dist' folder (built files)
app.use(express.static(frontendPath));

// Serve the index.html from the 'dist' folder (not the frontend source folder)
app.get("/*", (req, res) => {
  res.sendFile(join(frontendPath, "index.html"));
});

// create socket io server for messages
const server = createServer(app);
const io = new Server(server, {
  cleanupEmptyChildNamespaces: true,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

//namespaces for user and group messages
const userNamespace = io.of("/user");
new UserNamespace(userNamespace);
const groupNamespace = io.of("/group");
new GroupNamespace(groupNamespace);
