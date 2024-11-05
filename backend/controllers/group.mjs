// TODO WHEN SERVING GROUP'S MEMEBERS AND CHAT HISTORY USE DATA COMPRESSSION MAY BE ABLE TO SEND MORE MESSAGES IN HISTORY
// ! WHEN SENDING  AGROUP INVITE THE SENDER UUID SHOULD BE THE GROUP ID NOT THE PERSON WHO SENT THE INVITE

import express from "express";
import User from "../schemas/User.mjs"; // Import the User schema
import Group from "../schemas/Group.mjs";
import db from "../db/conn.mjs";
import checkRights from "../middleware/authenticationhandler.mjs"; //may be needed
import MiniUser from "../schemas/MiniUser.mjs";
import {
  addNotification,
  addnotificationHandler,
} from "../middleware/notificationhandler.mjs";

// group_num: String,
// group_name: String,
// group_profile: String,

const groupController = express.Router();

// create group
groupController.post("/create/:group_name", async (req, res) => {
  try {
    console.log(
      `create group: name: ${req.params.group_name} body: ${req.body}`
    );
    const groupMaker = {
      user_uuid: req.body.creator.user_uuid,
      username: req.body.creator.username,
      user_profile: req.body.creator.user_profile,
    };
    const newGroup = new Group({
      group_name: req.params.group_name,
      members: [groupMaker],
      owner: groupMaker,
      group_profile:
        req.body.group_profile !== null ? req.body.group_profile : "None",
      chat: [],
    });
    const result = await newGroup.save();
    console.log("group created!", result);
    //save group id to creator's group field
    await User.updateOne(
      { user_uuid: req.body.creator.user_uuid },
      {
        $push: {
          groups: {
            group_uuid: result.group_uuid,
            group_name: result.group_name,
            group_profile: result.group_profile,
          },
        },
      }
    );

    console.log("group created! user updated!", result);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: `An error occurred, group not created error is as follows: ${error}`,
    });
  }
});

// TODO, requires auth
// delete group
groupController.delete("/delete/:group_num", async (req, res) => {
  try {
    const result = await Group.deleteOne({ group_num: req.params.group_num });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, group not deleted" });
  }
});

// TODO, requires auth
// update group (for changing group name, profile)
groupController.put("/update/:group_num", async (req, res) => {
  try {
    const result = await Group.updateOne(
      { group_num: req.params.group_num }, // only sets name and profile if they are not an empty string
      {
        $set: Object.assign(
          {},
          req.body.group_name
            ? { group_name: req.body.group_name }
            : "Group NoName",
          req.body.group_profile
            ? { group_profile: req.body.group_profile }
            : "Group NoProfile"
        ),
      }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, group not updated" });
  }
});

// request ( to join ) group
groupController.put("/request/:group_num", async (req, res) => {
  try {
    // send a notification to the group creator

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, request not sent" });
  }
});

// leave group
groupController.put("/leave/:group_num", async (req, res) => {
  try {
    //! members are MiniUsers
    const result = await Group.updateOne(
      { group_num: req.params.group_num },
      { $pull: { members: { user_uuid: req.body.user_uuid } } }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, group not left" });
  }
});

// TODO, requires auth
// remove user from group
groupController.delete("/remove/:group_num/:user_uuid", async (req, res) => {
  try {
    //! members are MiniUsers
    const result = await Group.updateOne(
      { group_num: req.params.group_num },
      { $pull: { members: { user_uuid: req.body.user_uuid } } }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, user not removed" });
  }
});

// invite user to group
groupController.put(
  "/invite/:user_uuid",
  addnotificationHandler(3),
  async (req, res) => {
    try {
      //check that the user has recieved a notification whos sender contents are the same as the groups included in the req.body
      const result = await User.findOne(
        { user_uuid: req.body.user_uuid },
        {
          notifications: {
            $elemMatch: { "sender.user_uuid": req.body.group_uuid },
          },
        }
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "An error occurred, user not invited" });
    }
  }
);

// TODO, requires auth? probably should, maybe requires the uuid of a user already in it? something with a jwt token?
// add user to group
groupController.put("/add/:group_num/:user_uuid", async (req, res) => {
  try {
    const miniMember = await User.findOne({ user_uuid: req.params.user_uuid });
    const result = await Group.updateOne(
      { group_num: req.params.group_num },
      { $push: { members: miniMember } }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, user not added" });
  }
});

export default groupController;
