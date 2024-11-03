import mongoose from "mongoose";
import MiniUser from "../interfaces/userinterface";
import { v4 as uuidv4 } from "uuid";
s;

const { Schema, model } = mongoose;

const groupSchema = new Schema({
  group_uuid: String,
  group_name: String,
  group_profile: String,
  members: { type: [MiniUser], default: [] },
  chat: {
    type: [{ sender: MiniUser, message: String }],
    validate: {
      validator: function (v) {
        if (v.between.length >= 100) {
          v.between.splice(0, 1);
          v.between.push(v);
        } else {
          v.between.push(v);
        }
        return v.between.length <= 100;
      },
      message: "Group Chat History is limited to 100 messages",
    },
    default: [],
  },
});
// Method to add a message to the chat
groupSchema.methods.addMessage = function (messageId, messageContent, sender) {
  if (this.chat.length >= 100) {
    // Remove the oldest message (first element in the array)
    this.chat.shift();
  }
  // Add the new message
  this.chat.push({ sender, message: messageContent });
};

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
