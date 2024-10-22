import mongoose from "mongoose";

const { Schema } = mongoose;
const MiniUser = new Schema({
  MU_Num: {
    type: String,
    unique: true, // Ensure user_uuid is unique
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
