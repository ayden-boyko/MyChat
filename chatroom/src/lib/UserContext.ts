import { createContext } from "react";
import { User } from "../interfaces/userinterface";
import { Dispatch, SetStateAction } from "react";

// Define the type of the context
interface UserContextType {
  user: User | null; // user state (can be null initially)
  setUser: Dispatch<SetStateAction<User | null>>; // function to update user state
}

// Create the context with default values (null for user, an empty function for setUser)
export const UserContext = createContext<UserContextType | undefined>({
  user: null, // Default user value
  setUser: () => {}, // Default setUser is a no-op function
});
