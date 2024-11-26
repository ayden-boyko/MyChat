//utilizes JWT for authentication

import jwt from "jsonwebtoken";
import db from "../db/conn.mjs";

export default async function checkRights(req, res, next) {
  try {
    // get token from header
    const token = req.headers.authorization.split(" ")[1];

    const header = JSON.parse(
      Buffer.from(token.split(".")[0], "base64").toString()
    );

    if (!token) {
      return res.status(403).json({ message: "Access denied invalid token" });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        console.error("Error verifying token:", err);
        return res
          .status(403)
          .json({ message: "Access denied, verification failed" });
      }
      req.body.user_uuid = decoded.user_uuid;

      // Fetch the user from the database
      const userFromDb = await db
        .collection("users")
        .findOne({ user_uuid: req.body.user_uuid });

      // Ensure user exists in the database
      if (!userFromDb) {
        return res
          .status(403)
          .json({ message: "Access denied user doesnt exist" });
      }

      // Compare the IDs
      if (req.body.user_uuid === userFromDb.user_uuid) {
        return next(); // User has access, proceed to the next middleware
      } else {
        return res
          .status(403)
          .json({ message: "Access denied ids do not match" });
      }
    });
  } catch (error) {
    console.error("Error checking rights:", error);
    return res.status(500).json({ message: "Error checking rights" });
  }
}
