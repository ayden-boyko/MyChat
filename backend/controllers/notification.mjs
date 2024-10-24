import User from "../schemas/User.mjs";
import express from "express";

const NotificationController = express.Router();

NotificationController.get("/pending/:user_uuid", async (req, res) => {
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

export default NotificationController;
