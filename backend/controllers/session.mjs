import db from "../db/conn.mjs";
import express from "express";

const SessionController = express.Router();

SessionController.get("/get", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Explicitly allow frontend
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (!req.session) {
    return res.sendStatus(401);
  }
  try {
    const session = await db
      .collection("sessions")
      .findOne({ _id: req.sessionID });

    res.status(200).json({ session: session });
  } catch (error) {
    console.log("session.mjs - 20 - error", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

export default SessionController;
