import { Socket } from "socket.io-client";
import { MiniUser } from "./miniuser";
import { Notifications } from "./notifications";

export interface User {
  user_uuid?: string;
  email: string;
  username: string;
  hashed_password: string;
  salt: string;
  user_profile: string;
  friends: MiniUser[];
  blocked: MiniUser[];
  groups: number[];
  requests: MiniUser[];
  notifications: Notifications[];
  online: boolean;
  socket: Socket;
}

export interface UserContextValue {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
