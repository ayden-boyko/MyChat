// routes/chat.js
import express from "express";
import db from "../db/conn.mjs";
import { addnotificationHandler } from "../middleware/notificationhandler.mjs";

const chatController = express.Router();

// TODO  so far this is only for direct messaging, not group messaging

chatController.get("/between/:user_uuid/:friend_uuid", async (req, res) => {
  console.log(
    "between received - 11 -",
    req.params.user_uuid,
    req.params.friend_uuid
  );
  try {
    const chat = await db.collection("chats").findOne({
      between: {
        $size: 2,
        $all: [req.params.user_uuid, req.params.friend_uuid],
      },
    });
    res.json(chat);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export default chatController;
