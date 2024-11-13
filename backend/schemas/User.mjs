import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import MiniUser from "./MiniUser.mjs";
import MiniGroup from "./Minigroup.mjs";
import Notifications from "./Notifications.mjs";

const { Schema, model } = mongoose;
const userSchema = new Schema({
  user_uuid: {
    type: String,
    unique: true, // Ensure user_uuid is unique
  },
  email: String,
  username: {
    type: String,
    default: "",
  },
  hashed_password: String,
  salt: String,
  user_profile: { type: String, default: "" },
  friends: { type: [MiniUser], default: [] },
  blocked: { type: [String], default: [] },
  //reason blocked isnt miniuser[] is because their name and profile arent needed, if they are blocked all their content wont be shown
  groups: { type: [MiniGroup], default: [] },
  requests: { type: [MiniUser], default: [] },
  notifications: { type: [Notifications], default: [] },
  online: { type: Boolean, default: true },
});

// Static method to get the next user number
userSchema.statics.getNextUserUuid = async function () {
  const lastUser = `U${uuidv4()}`;
  return lastUser;
};

// Pre-save hook to set user_uuid
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Only set user_uuid for new users
    this.user_uuid = await this.constructor.getNextUserUuid();
  }
  next();
});

const User = model("users", userSchema);
export default User;
