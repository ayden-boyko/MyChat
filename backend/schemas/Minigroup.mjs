import mongoose from "mongoose";
import MiniUser from "./MiniUser.mjs";
import { v4 as uuidv4 } from "uuid";

const { Schema, model } = mongoose;

const MiniGroup = new Schema({
  group_uuid: { type: String, required: true, default: "" },
  group_name: { type: String, required: true, default: "" },
  group_profile: { type: String, required: true, default: "" },
});
export default MiniGroup;
