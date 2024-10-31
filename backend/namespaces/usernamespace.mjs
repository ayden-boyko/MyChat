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
      socket.on("join", (user_uuid) => {
        usersOnline[user_uuid] = socket.id;
        console.log(
          `usernamespace - 21 - ${socket} joined with uuid: ${user_uuid}`
        );
      });

      socket.on("message", async (data) => {
        const sendee = data.sendee;
        //check the user to see if they are online
        const online = usersOnline[sendee];
        if (online) {
          console.log(
            `usernamespace - 31 - ${data.sender.username} sent: "${data.message}" to ${sendee}`
          );
          socket.to(users[sendee]).emit("message", data.message);
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
            type: 1,
            payload: `${data.sender.username} has sent you a message.`,
            date: new Date(),
            seen: false,
          };
          await addNotification(sendee, notificationData);
        }
        //upsert creates the chat if it doesnt exist
        console.log("updating || creating chat - 52 -", data.message);
        console.log("sender", data.sender);
        const chat = await Chats.findOne({
          between: { $all: [sendee, data.sender.user_uuid] },
        }).exec();
        try {
          if (chat) {
            // If a chat exists, update it by pushing the message
            chat.messages.push({
              sender: data.sender,
              message: data.message,
            });
            await chat.save();
          } else {
            // If no chat exists, create a new one
            await Chats.create({
              between: [sendee, data.sender.user_uuid],
              messages: [
                {
                  sender: data.sender,
                  message: data.message,
                },
              ],
            });
          }
        } catch (error) {
          console.log(
            `usernamespace - 84 - failed to update chat between ${sendee} and ${data.sender.user_uuid}, caused error: `,
            error
          );
        }
      });

      socket.on("disconnect", () => {
        delete usersOnline[socket.id]; // remove useres form the online array
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
              `usernamespace - 104 - failed to set user: ${user_uuid} online to false`
            );
          }
        });
        console.log(
          `usernamespace - 109 - set user: ${user_uuid} online to false`
        );
      });
    });
  }
}
