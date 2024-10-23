import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Settings, LogOut, Search, Send, Bell } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../lib/UserContext";
import { User } from "../interfaces/userinterface";

// TODO USE PAGINATION WHEN SERVING CHAT MESSAGES TO 10 PER
// TODO MAKE ALL TEXT BLACK SO IT CAN BE SEEN ON FIREFOX

export default function HomePage() {
  const context = useContext(UserContext);
  const navigate = useNavigate();

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  const { user, setUser } = context;

  console.log("USER-HOME", user);

  const logout = async (user: User | null) => {
    try {
      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}api/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_uuid: user?.user_uuid }),
        }
      );
      console.log("LOGOUT", result);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Settings Sidebar */}
      <aside className="w-16 bg-gray-800 text-white p-4 flex flex-col items-center justify-between">
        <div className="space-y-4">
          <button
            className="p-2 rounded-md bg-gray-500 hover:bg-gray-700"
            aria-label="Settings"
            onClick={() => navigate("/settings")}
          >
            <Settings />
          </button>
          <button
            className="p-2 rounded-md bg-gray-500 hover:bg-gray-700"
            aria-label="Search"
            onClick={() => navigate("/search")}
          >
            <Search />
          </button>
          <button
            className="p-2 rounded-md bg-gray-500 hover:bg-gray-700"
            aria-label="Notifications"
            onClick={() => navigate("/notifications")}
          >
            <Bell />
          </button>
        </div>
        <button
          className="p-2 rounded-md bg-gray-500 hover:bg-gray-700"
          aria-label="Logout"
        >
          <LogOut
            onClick={() => {
              logout(user);
              setUser(null);
            }}
          />
        </button>
      </aside>

      {/* Group and Direct Messages Sidebar */}
      <aside className="w-64 bg-white border-r">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Groups</h2>
            <ul className="space-y-2">
              {/* Render the list of groups here, if none render "No groups found" */}
              {user?.groups === undefined ? (
                <li>No groups found</li>
              ) : (
                user?.groups.map((group, index) => (
                  <li key={index}>
                    <Button variant="ghost" className="w-full justify-start ">
                      # {group}
                    </Button>
                  </li>
                ))
              )}
            </ul>
            <Separator className="my-4" />
            <h2 className="text-lg font-semibold mb-2">Direct Messages</h2>
            <ul className="space-y-2">
              {/* Render the list of direct messages here, if none render "No direct messages found" */}
              {user?.friends === undefined ? (
                <li>No direct messages found</li>
              ) : (
                user?.friends.map((friend, index) => (
                  <li key={index}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${friend}`}
                        />
                        <AvatarFallback>{"USER"}</AvatarFallback>
                      </Avatar>
                      {friend}
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4">
          <h1 className="text-xl font-semibold">GROUP THATS BEEN SELECTED</h1>
        </header>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {[
              { sender: "Alice", message: "Hey everyone! How's it going?" },
              { sender: "Bob", message: "Pretty good, thanks! How about you?" },
              {
                sender: "Charlie",
                message: "Just finished a big project. Feeling accomplished!",
              },
            ].map((msg, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.sender}`}
                  />
                  <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{msg.sender}</p>
                  <p>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <footer className="bg-white border-t p-4">
          <form className="flex space-x-2">
            <Input className="flex-1" placeholder="Type a message..." />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </footer>
      </main>
    </div>
  );
}
