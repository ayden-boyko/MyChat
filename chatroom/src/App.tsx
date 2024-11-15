// external
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Socket } from "socket.io-client";

//internal
import "./output.css";
import { FriendContext } from "./lib/FriendContext.ts";
import { UserContext } from "./lib/UserContext.ts";

//routes
import HomePage from "./routes/homepage.tsx";
import LoginPage from "./routes/loginpage.tsx";
import SettingsPage from "./routes/settingspage.tsx";
import SignUpPage from "./routes/signuppage.tsx";
import SearchPage from "./routes/searchpage.tsx";
import NotificationPage from "./routes/notificationpage.tsx";

//interfaces
import { User } from "./interfaces/userinterface.ts";
import { MiniUser } from "./interfaces/miniuser.ts";
import { MiniGroup } from "./interfaces/minigroup.ts";

function App() {
  const [user, setUser] = useState<User | null>({
    user_uuid: "",
    email: "",
    username: "",
    hashed_password: "",
    salt: "",
    user_profile: "",
    friends: [] as MiniUser[],
    blocked: [] as MiniUser[],
    groups: [] as MiniGroup[],
    requests: [],
    notifications: [],
    online: true,
    socket: {} as Socket,
  });

  const [selectedFriend, setSelectedFriend] = useState<
    MiniUser | MiniGroup | null
  >(null); // for use with individual friends or groups

  // TODO set colors for the pages

  return (
    <div className="App min-h-screen w-full overflow-x-hidden">
      <UserContext.Provider value={{ user, setUser }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* specifically for handling notifications/chats */}

          <Route
            path="/home"
            element={
              <FriendContext.Provider
                value={{ selectedFriend, setSelectedFriend }}
              >
                <HomePage />
              </FriendContext.Provider>
            }
          />
          <Route
            path="/notifications"
            element={
              <FriendContext.Provider
                value={{ selectedFriend, setSelectedFriend }}
              >
                <NotificationPage />
              </FriendContext.Provider>
            }
          />

          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/sign_up" element={<SignUpPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </UserContext.Provider>
    </div>
  );
}

export default App;
