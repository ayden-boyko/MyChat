import User from "../schemas/User.mjs";
import db from "../db/conn.mjs";

// TODO check that message notifications are working
const prenotifCheck = async (userId, notificationData) => {
  let hasbeenNotified = false;
  let resultType = true;

  // TODO CASE 2, 3, 5
  switch (notificationData.type) {
    case 1: // for messaging, not needed here in case of future requirements
      break;

    case 4: // friend request
      //check that the user isnt already friended with them
      resultType = await db.collection("users").findOne({
        user_uuid: userId,
        friends: {
          $elemMatch: { user_uuid: notificationData.sender.user_uuid },
        },
      });
      break;
  }

  if (resultType) {
    //removes the notification if its already been sent, regadless of type
    console.log(
      "notificationHandler.mjs - 28 - removing notification that was added"
    );
    await User.updateOne(
      { user_uuid: userId },
      {
        $pull: {
          $elemMatch: {
            type: notificationData.type,
            "sender.user_uuid": notificationData.sender.user_uuid,
            "sender.username": notificationData.sender.username,
            "sender.user_profile": notificationData.sender.user_profile,
            payload: notificationData.payload,
          },
        },
      }
    );
    hasbeenNotified = true;
  }
  // check that the sender data isn't the same, minus the objectID (_id)
  const resultAlreadySent = await db.collection("users").findOne({
    user_uuid: userId,
    notifications: {
      $elemMatch: {
        "sender.user_uuid": notificationData.sender.user_uuid,
        "sender.username": notificationData.sender.username,
        "sender.user_profile": notificationData.sender.user_profile,
      },
    },
  });

  if (resultAlreadySent) {
    //removes the notification if its already been sent
    console.log(
      "notificationHandler.mjs - 61 - removing notification that was added"
    );
    await User.updateOne(
      { user_uuid: userId },
      {
        $pull: {
          $elemMatch: {
            type: notificationData.type,
            "sender.user_uuid": notificationData.sender.user_uuid,
            "sender.username": notificationData.sender.username,
            "sender.user_profile": notificationData.sender.user_profile,
            payload: notificationData.payload,
          },
        },
      }
    );
    hasbeenNotified = true;
  }

  // dont let the user send a friend request to themself
  if (userId === notificationData.sender.user_uuid) {
    //removes the notification if its already been sent
    console.log(
      "notificationHandler.mjs - 84 - removing notification that was added"
    );
    await User.updateOne(
      { user_uuid: userId },
      {
        $pull: {
          $elemMatch: {
            type: notificationData.type,
            "sender.user_uuid": notificationData.sender.user_uuid,
            "sender.username": notificationData.sender.username,
            "sender.user_profile": notificationData.sender.user_profile,
            payload: notificationData.payload,
          },
        },
      }
    );
    hasbeenNotified = true;
  }
  return hasbeenNotified;
};

// Middleware function to add notifications to the user's notifications field
const addNotification = async (userId, notificationData) => {
  try {
    console.log(
      "notificationData post add",
      await prenotifCheck(userId, notificationData)
    );
    if (await prenotifCheck(userId, notificationData)) {
      console.log(
        `notificationHandler.mjs - 114 - Notification already sent to for offline user: ${userId}`
      );
      return;
    } else {
      console.log(
        `notificationHandler.mjs - 119 - Notification added for offline user: ${userId}`
      );
      await User.updateOne(
        { user_uuid: userId },
        { $addToSet: { notifications: notificationData } }
      );
    }
  } catch (error) {
    console.error("Error adding notification - 127 -:", error);
  }
};

// Global middleware to handle notifications for users
// adds all requests to the user's notifications field, creates a notification
const addnotificationHandler = (eventType) => {
  return async (req, res, next) => {
    try {
      console.log(
        "notificaionHandler.mjs - 137 - Received request",
        req.body.user_profile
      );
      // console.log("recipient", req.params.user_uuid);

      /* notification text that will be shown to the user

        types 5: messages from user (1) or group (2), group invite (3), friend request(4), group join request(5), NULL (0) = autofail

        Payload will always be a string, but it will vary based on catagory
        if its a message from user or group it will be the message itself "MiniUser.Username or GroupName: message", 
        if its a group invite it will be "you where invited to GROUP NAME" 
        if its a friend request it will be "you have a friend request from MiniUser.Username"*/
      let eventData;
      switch (eventType) {
        case 1:
          eventData = `${req.body.username} has sent you a message.`;
        case 2:
          eventData = `A new message has been sent to ${req.body.username}.`;
        case 3:
          eventData = `You have been invited to join group ${req.body.username}.`;
        case 4:
          eventData = `${req.body.username} has sent you a friend request.`;
        case 5:
          eventData = `${req.body.username} wants to join your group.`;
        default:
          break;
      }

      // Prepare the notification data
      const notificationData = {
        sender: {
          user_uuid: req.body.user_uuid,
          username: req.body.username,
          user_profile: req.body.user_profile,
        },
        catagory: eventType,
        payload: eventData,
        date: new Date(),
        seen: false,
      };

      console.log(
        "notificationHandler.mjs - 180 - notificationData pre add",
        notificationData
      );

      //check that request isnt from a user within the blocked users list of the user
      const blockedUser = await User.findOne({
        user_uuid: req.params.user_uuid,
        blocked: { $in: [req.body.user_uuid] },
      });

      // Call the notification handler for offline users, if the user isnt blocked
      if (blockedUser === null) {
        await addNotification(req.params.user_uuid, notificationData);
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error("Error in notification middleware - 198 -:", error);
      res
        .status(500)
        .json({ message: "Server error in notification handling" });
    }
  };
};

//executes what the notifaction requires, i.e. accepts the friend/group request or join group request
const notificationExecuterHandler = async (userId, notificationData, next) => {
  // TODO MAKE EACH CASE A FUNCTION Might not be needed
  try {
    const notificationInstructions = notificationData;
    let result;
    switch (notificationInstructions.catagory) {
      //group invite
      case 3:
        break;
      //friend request
      case 4:
        //add the user to the user's friend list
        result = await User.updateOne(
          { user_uuid: userId },
          {
            $push: {
              friends: {
                user_uuid: notificationInstructions.sender.user_uuid,
                username: notificationInstructions.sender.username,
                user_profile: notificationInstructions.sender.user_profile,
              },
            },
          }
        );
        //remove the friend request from the user's request list
        result = await User.updateOne(
          { user_uuid: userId },
          {
            $pull: {
              friend_requests: {
                user_uuid: notificationInstructions.sender.user_uuid,
              },
            },
          }
        );

        //get the users username and profile picture
        result = await User.findOne({
          user_uuid: userId,
        });

        //add the user to the sender's friend list
        result = await User.updateOne(
          { user_uuid: notificationInstructions.sender.user_uuid },
          {
            $push: {
              friends: {
                user_uuid: result.user_uuid,
                username: result.username,
                user_profile: result.user_profile,
              },
            },
          }
        );
        break;
      //group join request
      case 5:
        break;
      default:
        throw new Error("Invalid notification type");
    }
    console.log("notificationhandler - 275 - notification executed", result);
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error executing notification:", error);
  }
};

export { addnotificationHandler, notificationExecuterHandler };
