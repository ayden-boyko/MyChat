import { useState } from "react";
import "./output.css";
//import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { UserContext } from "./lib/UserContext.ts";

//routes
import HomePage from "./routes/homepage.tsx";
import LoginPage from "./routes/loginpage.tsx";
import SettingsPage from "./routes/settingspage.tsx";
import SignUpPage from "./routes/signuppage.tsx";
import SearchPage from "./routes/searchpage.tsx";
import NotificationPage from "./routes/notificationpage.tsx";
import { User } from "./interfaces/userinterface.ts";
//const API = "http://localhost:8000/";

// TODO IMPLEMENT DARK MODE
// TODO WHEN A USER LOGS OUT SET THE ONLINE STATUS TO OFFLINE
/* TODO WHEN A USER ENTERS A NEW PAGE ONLY PULL DATA FROM NOTIFICATIONS SO THAT WAY IT ONLY UPDATES
  WHEN SAID USER NAVIGATES TO A PAGE THAT HAS A NOTIFICATION ASSOCIATED WITH IT, PULL DATA FOR THAT PAGE ONLY
  AND THEN REMOVE SAID NOTIFICATION FROM THE NOTIFFAICATION FIELD/PAGE
*/
function App() {
  const [user, setUser] = useState<User | null>({
    user_uuid: null,
    email: "",
    username: "",
    hashed_password: "",
    salt: "",
    user_profile: "",
    friends: [],
    blocked: [],
    groups: [],
  });

  return (
    <div className="App h-screen overflow-hidden">
      <UserContext.Provider value={{ user, setUser }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/sign_up" element={<SignUpPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
        </Routes>
      </UserContext.Provider>
    </div>
  );
}

export default App;
