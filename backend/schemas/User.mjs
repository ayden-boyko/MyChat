import mongoose from "mongoose";
import MiniUser from "../interfaces/friend.mjs";

const { Schema, model } = mongoose;
const userSchema = new Schema({
  user_num: {
    type: Number,
    unique: true, // Ensure user_num is unique
  },
  email: String,
  username: {
    type: String,
    default: "",
  },
  hashed_password: String,
  salt: String,
  user_profile: String,
  friends: { type: [MiniUser], default: [] },
  blocked: { type: [Number], default: [] },
  groups: { type: [Number], default: [] },
});

// Static method to get the next user number
userSchema.statics.getNextUserNum = async function () {
  const lastUser = await this.findOne({}, { user_num: 1 }).sort({
    user_num: -1,
  });
  return lastUser ? lastUser.user_num + 1 : 1; // Start from 1 if no users exist
};

// Pre-save hook to set user_num
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Only set user_num for new users
    this.user_num = await this.constructor.getNextUserNum();
  }
  next();
});

const User = model("users", userSchema);
export default User;
