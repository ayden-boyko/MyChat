import { MiniUser } from "./miniuser";

export interface Notifications {
  sender: MiniUser; // doesnt need to be unique since a user can send multiple things

  // types 4: messages from user (1) or group (2), group invite (3), friend request(4), group join request(5), NULL (0) = autofail
  catagory: number;

  /*
      Payload will always be a string, but it will vary based on catagory
      if its a message from user or group it will be the message itself "MiniUser.Username or GroupName: message", 
      if its a group invite it will be "you where invited to GROUP NAME" 
      if its a friend request it will be "you have a friend request from MiniUser.Username"*/
  //handler is responsible for this geting set
  payload: string;

  date: Date;
  seen: boolean;
}
