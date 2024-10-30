import User from "../schemas/User.mjs";
import Chats from "../schemas/Chats.mjs";

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
          `usernamespace - 18 - ${socket} joined with uuid: ${user_uuid}`
        );
      });

      socket.on("message", (data) => {
        const sendee = data.sendee;
        //check the user to see if they are online
        const online = User.findOne({ user_uuid: sendee });
        if (online) {
          console.log(
            `usernamespace - 25 - ${data.sender.username} sent: "${data.message}" to ${sendee}`
          );
          socket.to(users[sendee]).emit("message", data.message);
        } else {
          console.log(
            `usernamespace - 30 - ${data.sender.username} could not send: ${data.message} to ${sendee} as they are offline`
            // TODO SEND A NOTIFICATION
          );
          return;
        }
        // if the chat doesnt exist, create one between data.sender and data.sendee, order doesnt matter
        Chats.findOne({
          between: { $size: 2, $all: [sendee, data.sender.user_uuid] },
        }).then((chat) => {
          if (chat === null) {
            console.log("creating chat");
            Chats.create({
              between: [sendee, data.sender.user_uuid],
              messages: [{ sender: data.sender, message: data.message }],
            });
          } else {
            console.log("updating chat");
            Chats.updateOne(
              {
                between: {
                  $size: 2,
                  $all: [sendee, data.sender.user_uuid],
                },
              },
              {
                $push: {
                  messages: {
                    sender: data.sender,
                    message: data.message,
                  },
                },
              }
            ).then((res) => {
              if (res.nModified === 0) {
                console.log(
                  `usernamespace - 55 - failed to update chat between ${sendee} and ${data.sender.user_uuid}`
                );
              }
            });
          }
        });
      });

      socket.on("disconnect", () => {
        for (let user_uuid in users) {
          if (users[user_uuid] === socket.id) {
            delete users[user_uuid];
            console.log(
              `usernamespace - 56 - ${user_uuid} disconnected from user namespace`
            );
            // mark them as offline
            User.updateOne(
              { user_uuid: user_uuid },
              { $set: { online: false } }
            ).then((res) => {
              if (res.nModified === 0) {
                console.log(
                  `usernamespace - 79 - failed to set user: ${user_uuid} online to false`
                );
              }
            });
            console.log(
              `usernamespace - 81 - set user: ${user_uuid} online to false`
            );
            break;
          }
        }
      });
    });
  }
}
