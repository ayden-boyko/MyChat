import User from "../schemas/User.mjs";
import Chats from "../schemas/Chats.mjs";
import { addNotification } from "../middleware/notificationhandler.mjs";
import Group from "../schemas/Group.mjs";

// for storing online users and their sockets/uuids
const usersOnline = {};

const getOfflineGroupMembers = (group_uuid) => {
  //gets all members that are offline
  return Group.findOne({ group_uuid }).then((group) => {
    return group.members.filter((member) => {
      return !usersOnline[member.user_uuid];
    });
  });
};

export default class GroupNamespace {
  constructor(namespace) {
    this.namespace = namespace;
    this.initialize();
  }

  // TODO USER SOCKETIO ROOMS FOR GROUP CHATS
  // users can just join thier room based on the group id
  // * ex: socket.join(G63dc82ksj...); would join that group
  // * to message their group, socket.to(G63dc82ksj...).emit("message", data);
  // get all online group members socket.in(G63dc82ksj...).fetchSockets();
  // workflow is as follows:
  // 1. user joins group
  // 2. user sends message
  // 3. message is sent to all online group members
  // 4. get all offline members
  // 5. all offline group member's notifications are updated
  // the most recent notification takes precedence over the older ones

  initialize() {
    console.log("initializing group namespace");

    this.namespace.on("connection", (socket) => {
      socket.on("join", (data) => {
        console.log("user socket id:", socket.id);
        usersOnline[data.user_uuid] = socket.id;
        socket.join(data.group_uuid);
        console.log(
          `groupnamespace - 21 - ${socket.id} joined with uuid: ${data.user_uuid} and has joined group: ${data.group_uuid}`
        );
      });

      socket.on("new join", (data) => {
        usersOnline[data.miniUser.user_uuid] = socket.id;
        console.log(
          `groupnamespace - 21 - ${socket} has newly joined with uuid: ${data.miniUser.user_uuid}`
        );
        // send message to all online users in the group that the new user has joined
        socket.to(data.group_uuid).emit("new join", data.miniUser);
        // notify offline group members that the new user has joined
        getOfflineGroupMembers(data.group_uuid).then((res) => {
          res.forEach((user) => {
            addNotification(user.user_uuid, {
              sender: data.miniUser,
              catagory: 1,
              payload: `${data.miniUser.username} has joined the group.`,
              date: new Date(),
              seen: false,
            });
          });
        });
      });

      socket.on("message", async (data) => {
        const sendee = data.sendee;

        //sends the message to all online users in the group
        socket.to(data.group_uuid).emit("message", {
          sender: data.sender,
          message: data.message,
          date: data.date,
        });
        const notificationData = {
          sender: data.sender,
          catagory: 1,
          payload: `${data.sender.username} has sent you a message.`,
          date: new Date(),
          seen: false,
        };
        // notify all offline members of the group
        setImmediate(() => {
          const offline = getOfflineGroupMembers(data.group_uuid);
          //update all offline user's notifications
          offline.then((res) => {
            res.forEach((user) => {
              addNotification(user.user_uuid, notificationData);
            });
          });
        });

        //upsert creates the chat if it doesnt exist
        console.log("updating || creating chat - 52 -", data.message);
        console.log("sender", data.sender);

        //update chat if it exists, else create it
        try {
          await Group.findOneAndUpdate(
            { group_uuid: data.group_uuid },
            { $push: { chats: data.message } },
            { upsert: true }
          );
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
