// routes/account.js
import express from "express";
import db from "../db/conn.mjs";

import MiniUser from "../schemas/MiniUser.mjs";

import { addnotificationHandler } from "../middleware/notificationhandler.mjs";

const friendController = express.Router();

// PUT friend request to user
// TODO MAKE SURE IF THE REQUEST HAS BEEN SENT, THEN IT CANNOT BE SENT AGAIN
friendController.put(
  "/request/:user_uuid",
  addnotificationHandler(4),
  async (req, res) => {
    try {
      console.log("friend.mjs - 18 -recieved", req.body);
      console.log(
        "friend.mjs - 19 - sent from the same user",
        req.body.user_uuid === req.params.user_uuid
      );
      //create new friend object based on MiniUser schema
      const newFriend = {
        MU_Num: req.body.user_uuid,
        username: req.body.username,
        user_profile: req.body.user_profile,
      };

      //check that the user isnt already friended with them
      const resultFriend = await db.collection("users").findOne({
        user_uuid: req.params.user_uuid,
        friends: { $elemMatch: { user_uuid: req.body.user_uuid } },
      });
      if (resultFriend) {
        //removes the notification if its already been sent
        console.log("friend.mjs - 53 - removing notification that was added");
        await User.updateOne(
          { user_uuid: userId },
          {
            $pull: {
              $elemMatch: {
                type: notificationData.type,
                sender: notificationData.sender,
                payload: notificationData.payload,
              },
            },
          }
        );
        return res
          .status(200)
          .json({ message: "You're already friends with this person" });
      }
      // check that the user hasnt already sent a friend request to them
      const resultAlreadyFriended = await db.collection("users").findOne({
        user_uuid: req.params.user_uuid,
        requests: { $elemMatch: newFriend },
      });
      if (resultAlreadyFriended) {
        //removes the notification if its already been sent
        console.log("friend.mjs - 53 - removing notification that was added");
        await User.updateOne(
          { user_uuid: userId },
          {
            $pull: {
              $elemMatch: {
                type: notificationData.type,
                sender: notificationData.sender,
                payload: notificationData.payload,
              },
            },
          }
        );
        return res.status(200).json({
          message: "You've already sent a friend request to this user",
        });
      }
      // dont let the user send a friend request to themself
      if (req.body.user_uuid === req.params.user_uuid) {
        //TODO turn notification remover into function
        //removes the notification if its already been sent
        console.log("friend.mjs - 53 - removing notification that was added");
        await User.updateOne(
          { user_uuid: userId },
          {
            $pull: {
              $elemMatch: {
                type: notificationData.type,
                sender: notificationData.sender,
                payload: notificationData.payload,
              },
            },
          }
        );
        return res
          .status(200)
          .json({ message: "You can't send a friend request to yourself" });
      }

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
