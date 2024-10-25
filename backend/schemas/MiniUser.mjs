import mongoose from "mongoose";

const { Schema } = mongoose;
const MiniUser = new Schema({
  user_uuid: {
    type: String,
    required: true,
    default: "",
  },
  username: {
    type: String,
    required: true,
    default: "",
  },
  user_profile: {
    type: String,
    required: true,
    default: "",
  },
});
export default MiniUser;
