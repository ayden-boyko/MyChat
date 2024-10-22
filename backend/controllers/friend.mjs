// routes/account.js
import express from "express";
import db from "../db/conn.mjs";

import MiniUser from "../schemas/MiniUser.mjs";

const friendController = express.Router();

// PUT friend request to user
// TODO MAKE SURE IF THE REQUEST HAS BEEN SENT, THEN IT CANNOT BE SENT AGAIN
friendController.put("/request/:user_uuid", async (req, res) => {
  try {
    const newFriend = new MiniUser(req.body.mini_user); //create new friend object based on MiniUser schema

    const result = await db.collection("users").updateOne(
      { user_uuid: req.params.user_uuid },
      {
        $addToSet: {
          requests: {
            newFriend,
          },
        },
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error sending friend request: ", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// TODO friend accept, how will this work?
// PUT accept request from user
friendController.put("/accept/:user_uuid", async (req, res) => {
  try {
    return;
  } catch (error) {
    console.error("Error accepting user:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// PUT unfriend user
friendController.delete("/remove/:user_uuid", async (req, res) => {
  try {
    const result = await db
      .collection("users")
      .deleteOne(
        { user_uuid: register.body.mini_user.user_uuid },
        { $pull: { friends: parseInt(req.params.user_uuid) } }
      );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error unfriending user:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// PUT block user

friendController.put("/block/:user_uuid", async (req, res) => {
  try {
    const result = await db.collection("users").updateOne(
      { user_uuid: req.body.mini_user.user_uuid },
      {
        $set: { blocked: parseInt(req.params.user_uuid) },
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// PUT unblock user

friendController.put("/unblock/:user_uuid", async (req, res) => {
  try {
    const result = await db
      .collection("users")
      .updateOne(
        { user_uuid: req.body.mini_user.user_uuid },
        { $pull: { blocked: parseInt(req.params.user_uuid) } }
      );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

export default friendController;
