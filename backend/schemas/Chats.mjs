import mongoose from "mongoose";

import MiniUser from "./MiniUser.mjs";

const { Schema, model } = mongoose;

const chatSchema = new Schema(
  {
    between: {
      type: [MiniUser],
      required: true,
      default: [],
    },
    sender: {
      type: MiniUser, // doesnt need to be unique since a user can send multiple things
      required: true,
      default: null,
    },
    message: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    validate: {
      validator: function (v) {
        if (v.between.length >= 50) {
          v.between.splice(0, 1);
          v.between.push(v);
        } else {
          v.between.push(v);
        }
        return v.between.length <= 50;
      },
      message: "Chat History is limited to 50 messages",
    },
  }
);

const Chats = model("chats", chatSchema);

export default Chats;
