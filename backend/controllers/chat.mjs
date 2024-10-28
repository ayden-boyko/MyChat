// routes/chat.js
import express from "express";
import db from "../db/conn.mjs";

import MiniUser from "../schemas/MiniUser.mjs";

const chatController = express.Router();

// TODO CREATE CHAT, DELETE CHAT

chatController.get("/:user_uuid", async (req, res) => {
  try {
    const chat = await db.collection("chats").findOne({
      between: {
        $all: [
          { user_uuid: req.params.user_uuid },
          { user_uuid: req.body.user_uuid },
        ],
      },
    });
    res.json(chat);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export default chatController;
