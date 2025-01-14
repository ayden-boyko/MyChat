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

//get group by name
groupController.get("/get/name/:group_name", async (req, res) => {
  try {
    const group = await db
      .collection("groups")
      .aggregate([
        {
          $search: {
            index: "groupnameSearchIndex",
            text: {
              query: req.params.group_name,
              path: "group_name",
              fuzzy: {
                maxEdits: 2, // Allow up to 2 changes (insertion, deletion, substitution)
                prefixLength: 2, // Require at least 2 starting characters to match
                maxExpansions: 100, // Limit the number of expansions for the fuzzy search
              },
            },
          },
        },
      ])
      .toArray();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// get member count
groupController.get("/membercount/:group_uuid", async (req, res) => {
  try {
    const group = await Group.findOne({ group_uuid: req.params.group_uuid });
    res.status(200).json({ membercount: group.members.length });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// create group
groupController.post("/create/:group_name", async (req, res) => {
  try {
    const groupMaker = {
      user_uuid: req.body.creator.user_uuid,
      username: req.body.creator.username,
      user_profile: req.body.creator.user_profile,
    };
    const newGroup = new Group({
      group_name: req.params.group_name,
      group_profile: req.body.group_avatar,
      members: [groupMaker],
      owner: groupMaker,
      group_profile:
        req.body.group_avatar !== null ? req.body.group_avatar : "None",
      chat: [],
    });
    const result = await newGroup.save();
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

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: `An error occurred, group not created error is as follows: ${error}`,
    });
  }
});

// delete group
groupController.delete("/delete/:group_num", async (req, res) => {
  try {
    const result = await Group.deleteOne({ group_num: req.params.group_num });
    // remove group from members group list
    await User.updateMany(
      { "groups.group_num": req.params.group_num },
      { $pull: { groups: { group_num: req.params.group_num } } }
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, group not deleted" });
  }
});

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
groupController.put(
  "/request/:group_num",
  addnotificationHandler(5),
  async (req, res) => {
    try {
      res.status(200).json(`request sent to group ${req.params.group_num}`);
    } catch (error) {
      res.status(500).json({ error: "An error occurred, request not sent" });
    }
  }
);

// leave group
groupController.put("/leave/:group_num", async (req, res) => {
  try {
    //! members are MiniUsers
    const result = await Group.updateOne(
      { group_num: req.params.group_num },
      { $pull: { members: { user_uuid: req.body.user_uuid } } }
    );
    //remove group from users froup list
    await User.updateOne(
      { user_uuid: req.body.user_uuid },
      { $pull: { groups: { group_num: req.params.group_num } } }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred, group not left" });
  }
});

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
