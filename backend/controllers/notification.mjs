import User from "../schemas/User.mjs";
import express from "express";

import { notificationExecuterHandler } from "../middleware/notificationhandler.mjs";

const NotificationController = express.Router();

//gets the pending notifications
NotificationController.get("/pending/:user_uuid", async (req, res) => {
  if (req.session.cookie.expired) {
    return res.sendStatus(401);
  }
  try {
    const user = await User.findOne({ user_uuid: req.params.user_uuid });
    res.status(200).json({ notifications: user.notifications });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

NotificationController.delete("/clear/:user_uuid", async (req, res) => {
  try {
    const result = await User.updateOne(
      { user_uuid: req.params.user_uuid },
      { $set: { notifications: [] } }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

/*  IMPLEMENTED ACCEPTING THE NOTIFICATION
 MAY NEED ADDITION HANDLER FOR TYPES OF REQUESTS OF WHICH THERE ARE 5
 messages from user (1) or group (2), group invite (3), friend request(4), group join request(5)
 for 1 & 2, just redirect them to that chat
 for 3, 4, & 5 just accept the request 
 get them from: notifications.catagory

 req.body.notification is the following format


     sender: {
       user_uuid: 'U88ab7079-dba9-4218-aef9-410715a5bf07',
       username: 'John',
       user_profile: '',
       _id: '671bc9b256691e534f27b2e8'
     },
     catagory: 4,
     payload: 'John has sent you a friend request.',
     date: '2024-10-25T16:39:14.857Z',
     seen: false,
     _id: '671bc9b256691e534f27b2e7'
*/

// maybe a request handler that executes what the notification requres
NotificationController.put(
  "/accept/:user_uuid",
  async (req, res, next) =>
    notificationExecuterHandler(
      req.params.user_uuid,
      req.body.notification,
      next
    ),
  async (req, res) => {
    try {
      const result = await User.updateOne(
        { user_uuid: req.params.user_uuid },
        { $pull: { notifications: { _id: req.body.notification._id } } }
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Unable to accept notification" });
    }
  }
);

NotificationController.put("/decline/:user_uuid", async (req, res) => {
  try {
    console.log("decline notification", req.body.notification);
    const result = await User.updateOne(
      { user_uuid: req.params.user_uuid },
      { $pull: { notifications: req.body.notification } }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Unable to decline notification" });
  }
});

export default NotificationController;
