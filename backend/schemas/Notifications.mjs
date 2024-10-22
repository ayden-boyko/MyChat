import mongoose from "mongoose";
import MiniUser from "./MiniUser.mjs";

const { Schema } = mongoose;
const Notifications = new Schema({
  sender: {
    type: MiniUser, // doesnt need to be unique since a user can send multiple things
    required: true,
    default: null,
  },
  catagory: {
    // types 4: messages from user (1) or group (2), group invite (3), friend request(4), NULL (0) = autofail
    type: Number,
    default: 0,
  },
  /*
  Payload will always be a string, but it will vary based on catagory
  if its a message from user or group it will be the message itself "MiniUser.Username or GroupName: message", 
  if its a group invite it will be "you where invited to GROUP NAME" 
  if its a friend request it will be "you have a friend request from MiniUser.Username"*/
  payload: {
    //handler is responsible for this geting set
    type: String,
    default: "",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  seen: {
    type: Boolean,
    default: false,
  },
});
export default Notifications;
