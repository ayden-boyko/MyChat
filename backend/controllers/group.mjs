// TODO WHEN SERVING GROUP'S MEMEBERS AND CHAT HISTORY USE DATA COMPRESSSION MAY BE ABLE TO SEND MORE MESSAGES IN HISTORY
// ! WHEN SENDING  AGROUP INVITE THE SENDER UUID SHOULD BE THE GROUP ID NOT THE PERSON WHO SENT THE INVITE
// TODO, when creating groupm inlcude creator info as miniuser

import express from "express";
import User from "../schemas/User.mjs"; // Import the User schema
import Group from "../schemas/Group.mjs";
import db from "../db/conn.mjs";
import checkRights from "../middleware/authenticationhandler.mjs"; //may be needed

// group_num: String,
// group_name: String,
// group_profile: String,

const groupController = express.Router();

// create group
groupController.post("/create/:group_name", async (req, res) => {
  try {
    const newGroup = new Group({
      group_name: req.params.group_name,
      members: [req.body.creator],
    });
    const result = await newGroup.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, group not created" });
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
          req.body.group_name ? { group_name: req.body.group_name } : {},
          req.body.group_profile
            ? { group_profile: req.body.group_profile }
            : {}
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
      { $pull: { members: req.body.user_uuid } }
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
      { $pull: { members: req.params.user_uuid } }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, user not removed" });
  }
});

// TODO, maybe requires auth
// invite user to group
groupController.put("/invite/:group_num/:user_uuid", async (req, res) => {
  try {
    // send a notification to the user
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, user not invited" });
  }
});

// TODO, requires auth
// add user to group
groupController.put("/add/:group_num/:user_uuid", async (req, res) => {
  try {
    //TODO get MiniUser from user_uuid
    const result = await Group.updateOne(
      { group_num: req.params.group_num },
      { $push: { members: req.params.user_uuid } }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, user not added" });
  }
});

export default groupController;
