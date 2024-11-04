import mongoose from "mongoose";

import MiniUser from "./MiniUser.mjs";

const { Schema, model } = mongoose;

const chatSchema = new Schema({
  between: {
    type: [String],
    required: true,
    default: [],
  },
  messages: {
    type: [
      {
        sender: MiniUser,
        message: String,
        date: Date,
      },
    ],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 50;
      },
      message: "Chat History is limited to 50 messages",
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Chats = model("chats", chatSchema);
export default Chats;
