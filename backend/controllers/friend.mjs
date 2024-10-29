// routes/account.js
import express from "express";
import db from "../db/conn.mjs";
import User from "../schemas/User.mjs";

import MiniUser from "../schemas/MiniUser.mjs";

import { addnotificationHandler } from "../middleware/notificationhandler.mjs";

const friendController = express.Router();

// PUT friend request to user
friendController.put(
  "/request/:user_uuid",
  addnotificationHandler(4),
  async (req, res) => {
    try {
      console.log("friend.mjs - 18 -recieved", req.body);

      const blockedUser = await User.findOne({
        user_uuid: req.params.user_uuid,
        blocked: { $in: [req.body.user_uuid] },
      });

      if (blockedUser === null) {
        //create new friend object based on MiniUser schema
        const newFriend = {
          MU_Num: req.body.user_uuid,
          username: req.body.username,
          user_profile: req.body.user_profile,
        };

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
      }
    } catch (error) {
      console.error("Error sending friend request: ", error);
      res.status(500).json({ error: "Error sending friend request" });
    }
  }
);

// PUT accept request from user
friendController.put("/accept/:user_uuid", async (req, res) => {
  try {
    //add ourselves to the user's friends
    const result = await db
      .collection("users")
      .updateOne(
        { user_uuid: req.params.user_uuid },
        { $addToSet: { friends: req.body.mini_user } }
      );

    // remove from requests
    const requests = await db
      .collection("users")
      .updateOne(
        { user_uuid: req.body.mini_user.user_uuid },
        { $pull: { requests: { MU_Num: req.params.user_uuid } } }
      );

    //create mini user based on the request sender, this will be added to our friends,
    // this reduces the amount of data sent, but increases the requests by 1
    const { username, user_profile } = await db
      .collection("users")
      .findOne(
        { user_uuid: req.params.user_uuid },
        { projection: { username: 1, user_profile: 1 } }
      );

    const newFriend = new MiniUser({
      user_uuid: req.params.user_uuid,
      username,
      user_profile,
    });

    //add user to our friends
    const result2 = await db
      .collection("users")
      .updateOne(
        { user_uuid: req.body.mini_user.user_uuid },
        { $addToSet: { friends: newFriend } }
      );
    res.status(200).json({
      message1: "What they see",
      result: result,
      message2: "What you see",
      result2: result2,
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Error accepting friend request" });
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
    res.status(500).json({ error: "Error unfriending user" });
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
    res.status(500).json({ error: "Error blocking user" });
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
    res.status(500).json({ error: "Error unblocking user" });
  }
});

export default friendController;
