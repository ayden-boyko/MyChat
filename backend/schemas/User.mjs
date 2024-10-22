import mongoose from "mongoose";
import MiniUser from "../interfaces/friend.mjs";
import { v4 as uuidv4 } from "uuid";

// TODO IMPLEMENT USER PROFILES IMAGES, MULTER?

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
  user_profile: String,
  friends: { type: [MiniUser], default: [] },
  blocked: { type: [Number], default: [] },
  groups: { type: [Number], default: [] },
  requests: { type: [MiniUser], default: [] },
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
