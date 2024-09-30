"use strict";
import express from "express";
import "./loadEnviroment.mjs"; // Load environment variables
import db from "./db/conn.mjs";

const test_data = [
  {
    user_num: 1,
    name: "Ayden Boyko",
    user_name: "bbtornado",
    user_profile: "",
    friends: [],
    blocked: [],
    groups: [],
  },
  {
    user_num: 2,
    name: "Justin Detran",
    user_name: "Gnarfle",
    user_profile: "",
    friends: [],
    blocked: [],
    groups: [],
  },
  {
    user_num: 3,
    name: "Matthew Mauro",
    user_name: "Hax Activated",
    user_profile: "",
    friends: [],
    blocked: [],
    groups: [],
  },
  {
    user_num: 4,
    name: "Jaden Rivera",
    user_name: "Maard Beet",
    user_profile: "",
    friends: [],
    blocked: [],
    groups: [],
  },
];

const PORT = process.env.PORT || 8000;

const app = express();

app.get("/", async (req, res) => {
  try {
    console.log("GET", req.body);
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Fetch data from the database
    const result = await db.collection("Users").find({}).toArray();

    // Send data as JSON (automatically sets Content-Type and ends the response)
    res.json(result);
  } catch (error) {
    // Handle any errors and send appropriate response
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/", async (req, res) => {
  try {
    console.log("POST", req.body);

    res.setHeader("Access-Control-Allow-Origin", "*");

    // Check if there are any existing users with matching IDs in test_data
    const existingUsers = await db
      .collection("Users")
      .find({ id: { $in: test_data.map((user) => user.id) } })
      .toArray();

    if (existingUsers.length > 0) {
      // If duplicates are found, return an error message with the duplicates
      return res.status(409).json({
        error: "Duplicate users found",
        duplicates: existingUsers.map((user) => user.id),
      });
    }

    // If no duplicates are found, proceed with the insertion
    const insertResult = await db.collection("Users").insertMany(test_data);
    console.log("Data inserted", insertResult);

    // Fetch and return the updated list of users
    const updatedResult = await db.collection("Users").find({}).toArray();
    res.json(updatedResult);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});