import mongoose from "mongoose";
import MiniUser from "../interfaces/userinterface";

const { Schema, model } = mongoose;

const groupSchema = new Schema({
  group_num: String,
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

const Group = model("groups", groupSchema);
export default Group;
