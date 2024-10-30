// routes/chat.js
import express from "express";
import db from "../db/conn.mjs";
import { addnotificationHandler } from "../middleware/notificationhandler.mjs";

const chatController = express.Router();

// TODO CREATE CHAT, DELETE CHAT? might not be needed

chatController.get("/:user_uuid/:friend_uuid", async (req, res) => {
  try {
    const chat = await db.collection("chats").findOne({
      between: {
        $all: [
          { user_uuid: req.params.user_uuid },
          { user_uuid: req.params.friend_uuid },
        ],
      },
    });
    res.json(chat);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// TODO
chatController.post(
  "/:user_uuid/:friend_uuid",
  addnotificationHandler(1),
  async (req, res) => {
    try {
      const chat = await db
        .collection("chats")
        .insertOne({ between: [req.params.user_uuid, req.params.friend_uuid] });
      res.json(chat);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

export default chatController;
