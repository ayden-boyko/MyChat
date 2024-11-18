import { createContext, Dispatch, SetStateAction } from "react";

interface DarkContextType {
  darkMode: boolean; // user state (can be null initially)
  setDarkMode: Dispatch<SetStateAction<boolean>>; // function to update user state
}

// Create the context with default values (null for user, an empty function for setUser)
export const DarkContext = createContext<DarkContextType>({
  darkMode: false, // Default user value
  setDarkMode: () => {}, // Default setUser is a no-op function
});
