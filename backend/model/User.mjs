import mongoose from "mongoose";
const { Schema, model } = mongoose;
const userSchema = new Schema({
  user_num: {
    type: Number,
    unique: true, // Ensure user_num is unique
  },
  email: String,
  user_name: {
    type: String,
    default: "",
  },
  password: String,
  user_profile: String,
  friends: { type: [Number], default: [] },
  blocked: { type: [Number], default: [] },
  groups: { type: [Number], default: [] },
});

// Static method to get the next user number
userSchema.statics.getNextUserNum = async function () {
  const lastUser = await this.findOne({}, { user_num: 1 }).sort({
    user_num: -1,
  });
  return lastUser ? lastUser.user_num + 1 : 1; // Start from 1 if no users exist
};

// Pre-save hook to set user_num
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Only set user_num for new users
    this.user_num = await this.constructor.getNextUserNum();
  }
  next();
});

const User = model("Users", userSchema);
export default User;
