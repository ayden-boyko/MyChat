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
import { User } from "./interfaces/userinterface.ts";
//const API = "http://localhost:8000/";

// TODO IMPLEMENT DARK MODE

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
        </Routes>
      </UserContext.Provider>
    </div>
  );
}

export default App;
