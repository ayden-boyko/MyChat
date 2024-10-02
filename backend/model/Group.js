import mongoose from "mongoose";
const { Schema, model } = mongoose;

const groupSchema = new Schema({
  group_num: Number,
  group_name: String,
  group_profile: String,
  members: [Number],
  chat: {
    type: Map,
    of: String,
    validate: {
      validator: function (v) {
        return v.size <= 50; // Limit to 50 elements
      },
      message: "Chat History is limited to 50 messages",
    },
  },
});

// Method to add a message to the chat
groupSchema.methods.addMessage = function (messageId, messageContent) {
  if (this.chat.size >= 50) {
    // Remove the oldest message (first inserted)
    const firstKey = Array.from(this.chat.keys())[0]; // Get the first key
    this.chat.delete(firstKey); // Delete the oldest message
  }

  this.chat.set(messageId, messageContent); // Add the new message
};

const Group = model("Groups", groupSchema);
export default Group;
