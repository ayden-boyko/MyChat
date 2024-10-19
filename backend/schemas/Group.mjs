import mongoose from "mongoose";
import MiniUser from "../interfaces/userinterface";

const { Schema, model } = mongoose;

const groupSchema = new Schema({
  group_num: Number,
  group_name: String,
  group_profile: String,
  members: { type: [MiniUser], default: [] }, // [MiniUser],
  chat: {
    type: [{ sender: MiniUser, message: String }],
    validate: {
      validator: function (v) {
        return v.length <= 100; // Limit to 100 elements
      },
      message: "Chat History is limited to 100 messages",
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

const Group = model("Groups", groupSchema);
export default Group;
