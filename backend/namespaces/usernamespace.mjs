import User from "../schemas/User.mjs";
import Chats from "../schemas/Chats.mjs";
import { addNotification } from "../middleware/notificationhandler.mjs";

// for storing online users and their sockets/uuids
const usersOnline = {};

export default class UserNamespace {
  constructor(namespace) {
    this.namespace = namespace;
    this.initialize();
  }

  initialize() {
    console.log("initializing user namespace");

    this.namespace.on("connection", (socket) => {
      socket.on("join", (data) => {
        usersOnline[data.user_uuid] = socket.id;
        console.log(
          `usernamespace - 21 - ${socket.id} joined with uuid: ${data.user_uuid}`
        );
      });

      socket.on("message", async (data) => {
        const sendee = data.sendee;
        if (sendee[0] === "G") {
          console.log("THIS IS A GROUP ID, WRONG NAMESPACE");
          return;
        }
        console.log("usernamespace - 27 - data", data);
        //check the user to see if they are online
        const online = usersOnline[sendee];
        if (online) {
          console.log(
            `usernamespace - 31 - ${data.sender.username} sent: "${data.message}" to ${sendee} at ${data.date}`
          );
          socket.to(usersOnline[sendee]).emit("message", data);
        } else {
          console.log(
            `usernamespace - 36 - ${data.sender.username} could not send: ${data.message} to ${sendee} as they are offline`
          );
          const notificationData = {
            sender: {
              user_uuid: data.sender.user_uuid,
              username: data.sender.username,
              user_profile: data.sender.user_profile,
            },
            catagory: 1,
            payload: `${data.sender.username} has sent you a message.`,
            date: new Date(),
            seen: false,
          };
          console.log("notificationData", notificationData);
          await addNotification(sendee, notificationData);
        }
        //upsert creates the chat if it doesnt exist
        console.log("updating || creating chat - 52 -", data.message);
        console.log("sender", data.sender, "sendee", sendee);
        try {
          let result;
          //check if the chat already exists
          const chat = await Chats.findOne({
            between: { $all: [data.sender.user_uuid, sendee] },
          });
          if (!chat) {
            // if it doesn't exist, create a new one
            const newChat = new Chats({
              between: [data.sender.user_uuid, sendee],
              messages: [
                { sender: data.sender, message: data.message, date: data.date },
              ],
            });
            result = await newChat.save();
          } else {
            // if it does exist, update the chat
            chat.messages.push({
              sender: data.sender,
              message: data.message,
              date: data.date,
            });
            result = await chat.save();
          }

          console.log("result", result);
        } catch (error) {
          console.log(
            `usernamespace - 84 - failed to update chat between ${sendee} and ${data.sender.user_uuid}, caused error: `,
            error
          );
        }
      });

      socket.on("disconnect", () => {
        //remove user from online who has a socket.id that matches the diconnected socket
        const userId = Object.keys(usersOnline).find(
          (key) => usersOnline[key] === socket.id
        );
        if (userId) {
          delete usersOnline[userId];
        }
        console.log(
          `usernamespace - 95 - ${socket.id} disconnected from user namespace`
        );
        // mark them as offline
        User.updateOne(
          { user_uuid: socket.id },
          { $set: { online: false } }
        ).then((res) => {
          if (res.nModified === 0) {
            console.log(
              `usernamespace - 104 - failed to set user: ${socket.id} online to false`
            );
          }
        });
        console.log(
          `usernamespace - 109 - set user: ${socket.id} online to false`
        );
      });
    });
  }
}
