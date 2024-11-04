import mongoose from "mongoose";
import MiniUser from "./MiniUser.mjs";
import { v4 as uuidv4 } from "uuid";

const { Schema, model } = mongoose;

const groupSchema = new Schema({
  group_uuid: String,
  group_name: String,
  group_profile: String,
  owner: MiniUser,
  members: { type: [MiniUser], default: [] },
  chat: {
    type: [{ sender: MiniUser, message: String, date: Date }],
    validate: {
      validator: function (chatArray) {
        if (chatArray.length > 100) {
          chatArray.sort((a, b) => a.timestamp - b.timestamp);
          chatArray.splice(0, chatArray.length - 100);
        }
        return true;
      },
      message: "Group Chat History is limited to 100 messages",
    },
    default: [],
  },
});

// Static method to get the next user number
groupSchema.statics.getNextUserUuid = async function () {
  const lastUser = `G${uuidv4()}`;
  return lastUser;
};

// Pre-save hook to set user_uuid
groupSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Only set user_uuid for new users
    this.group_uuid = await this.constructor.getNextUserUuid();
  }
  next();
});

const Group = model("groups", groupSchema);
export default Group;
