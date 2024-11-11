// routes/chat.js
import express from "express";
import db from "../db/conn.mjs";
import Group from "../schemas/Group.mjs";
import Chats from "../schemas/Chats.mjs";

const chatController = express.Router();

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

chatController.get("/:group_uuid", async (req, res) => {
  try {
    console.log("group received - 31 -", req.params.group_uuid);
    //find chat between users
    const chat = await Group.findOne(
      { group_uuid: req.params.group_uuid },
      { chat: 1 }
    );
    res.json(chat);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export default chatController;
