import mongoose from "mongoose";
const { Schema, model } = mongoose;
const userSchema = new Schema({
  user_num: Number,
  name: String,
  user_name: Boolean,
  password: String,
  user_profile: String,
  friends: [Number],
  blocked: [Number],
  groups: [Number],
});
const User = model("Users", userSchema);
export default User;
