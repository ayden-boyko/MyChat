import Notifications from "../schemas/Notifications.mjs";
import User from "../schemas/User.mjs";

/* EXAMPLE OF NOTIFICATION HANDLER IN USE
         Message route
router.post('/message', notificationMiddleware(1), async (req, res) => {
  const { message, recipientId, senderId } = req.body;

   Your message logic here
  try {
     Simulate sending a message, saving to database, etc.

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});
*/

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

// Global middleware to handle notifications for offline users
const notificationHandler = (eventType) => {
  return async (req, res, next) => {
    const { recipientId, sender } = req.body; // Assuming body contains recipientId, senderId, and event data

    try {
      /* notification text that will be shown to the user

        types 4: messages from user (1) or group (2), group invite (3), friend request(4), NULL (0) = autofail

        Payload will always be a string, but it will vary based on catagory
        if its a message from user or group it will be the message itself "MiniUser.Username or GroupName: message", 
        if its a group invite it will be "you where invited to GROUP NAME" 
        if its a friend request it will be "you have a friend request from MiniUser.Username"*/
      let eventData;
      switch (eventType) {
        case 1:
          eventData = `${sender.username} has sent you a message.`;
        case 2:
          eventData = `A new message has been sent to ${sender.username}.`;
        case 3:
          eventData = `You have been invited to join group ${sender.username}.`;
        case 4:
          eventData = `${sender.username} has sent you a friend request.`;
        default:
          break;
      }

      // Prepare the notification data
      const notificationData = new Notifications({
        sender: senderId,
        catagory: eventType,
        payload: eventData,
      });

      // Call the notification handler for offline users
      await addNotification(recipientId, notificationData);

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error("Error in notification middleware:", error);
      res
        .status(500)
        .json({ message: "Server error in notification handling" });
    }
  };
};

export default notificationHandler;
