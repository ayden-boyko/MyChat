// external
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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

//reset local session data (i.e pages, ect)
window.addEventListener("beforeunload", function () {
  localStorage.removeItem("lastVisitedPage"); // Remove the saved page URL
});

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

  const [isSessionLoaded, setIsSessionLoaded] = useState(false); // Add a flag to track session load status

  const navigate = useNavigate();
  const location = useLocation();

  // Store the current path in localStorage whenever the route changes
  useEffect(() => {
    const currentPath = location.pathname;
    localStorage.setItem("lastVisitedPage", currentPath);
  }, [location]);

  useEffect(() => {
    const lastPage = localStorage.getItem("lastVisitedPage");

    const fetchSession = async () => {
      try {
        const UserSession = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/session/get`,
          {
            credentials: "include",
          }
        );
        const data = await UserSession.json();

        // Ensure session data exists before accessing it
        if (data && data.session) {
          const parsedSession = JSON.parse(data.session.session);

          // Update user only if session is valid
          if (parsedSession.user && !user) {
            // Only set the user if it's not already set
            setUser(parsedSession.user);
          }
        } else {
          // Handle case when session data is missing or invalid
          console.error("Session data is missing or invalid");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsSessionLoaded(true); // Mark session as loaded, regardless of success or failure
      }
    };

    // Only redirect if the last page exists and we're on the homepage
    if (lastPage && location.pathname === "/") {
      // Avoid unnecessary rerendering by checking if session has been fetched
      if (!isSessionLoaded) {
        fetchSession().then(() => {
          if (user) {
            navigate(lastPage); // Only navigate after session is loaded and user state is set
          }
        });
      }
    } else {
      setIsSessionLoaded(true); // Ensure session state is set
    }
  }, [location, navigate, user, isSessionLoaded]);

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
