import { createContext } from "react";
import { Dispatch, SetStateAction } from "react";
import { MiniGroup } from "../interfaces/minigroup";
import { MiniUser } from "../interfaces/miniuser";

// Define the type of the context
interface FriendContextType {
  selectedFriend: MiniUser | MiniGroup | null; // user state (can be null initially)
  setSelectedFriend: Dispatch<SetStateAction<MiniUser | MiniGroup | null>>; // function to update user state
}

// Create the context with default values (null for user, an empty function for setUser)
export const FriendContext = createContext<FriendContextType | undefined>({
  selectedFriend: null, // Default user value
  setSelectedFriend: () => {}, // Default setUser is a no-op function
});
