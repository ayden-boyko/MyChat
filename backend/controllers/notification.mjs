import User from "../schemas/User.mjs"; // Assuming you already have User schema with notifications embedded
import Notifications from "../schemas/Notifications.mjs";

// Middleware function to add notifications to the user's notifications field
const addNotification = async (userId, notificationData) => {
  try {
    // Find the user by userId (make sure this matches your schema field)

    await User.updateOne(
      { user_uuid: userId },
      { $push: { notifications: notificationData } }
    );
    console.log(`Notification added for offline user: ${userId}`);
  } catch (error) {
    console.error("Error adding notification:", error);
  }
};

export default addNotification;
