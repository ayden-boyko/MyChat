import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Settings, LogOut, Search, Send, Bell } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../lib/UserContext";
import { User } from "../interfaces/userinterface";
import { cn } from "../lib/utils";
import { MiniUser } from "../interfaces/miniuser";
import { io } from "socket.io-client";

// TODO MAKE ALL TEXT BLACK SO IT CAN BE SEEN ON FIREFOX

export default function HomePage() {
  const context = useContext(UserContext);
  const [friendChat, setFriendChat] = useState<
    { sender: string; message: string }[] | null
  >(null);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<MiniUser | null>(null);
  const navigate = useNavigate();

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  const { user, setUser } = context;

  if (user?.username === "") {
    navigate("/");
  }

  useEffect(() => {
    if (!hasJoined) {
      const createSocket = async () => {
        // instantiate user socket
        const socket = io("http://localhost:8000/user");
        setUser({ ...user, socket: socket } as User);
        // join the user namespace
        socket.emit("join", user?.user_uuid);
        setHasJoined(true);
      };

      createSocket();
    }

    user?.socket?.on("message", (data) =>
      setFriendChat((prevChat) => {
        if (prevChat === null)
          return [{ sender: data.sender, message: data.message }];
        return [...prevChat, { sender: data.sender, message: data.message }];
      })
    );
  }, [user]);

  console.log("hompage.tsx - 60 - USER-HOME", user);

  const logout = async (user: User | null) => {
    try {
      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/login/sign_out`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_uuid: user?.user_uuid }),
        }
      );
      console.log("homepage.tsx - 45 -LOGOUT", result);
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const startChatting = async (friend: MiniUser) => {
    console.log("homepage.tsx - 80 - FRIEND", friend);
    if (friend === null) {
      alert("Please select a friend to start chatting");
      return;
    }
    const chat = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/chat/${user?.user_uuid}/${
        friend.user_uuid
      }`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const chatData = await chat.json();
    console.log("homepage.tsx - 84 - CHAT", chatData);
    setFriendChat(chatData);
    setSelectedFriend(friend);
  };

  // TODO ONCE FRIEND HAS BEEN SELECTED PULL THE CHAT HISTORY TO DISPLAY IT
  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const message = document.getElementById("msg") as HTMLInputElement;
    console.log("homepage.tsx - 104 - MESSAGE", message.value);

    startChatting(selectedFriend as MiniUser); // to refresh the caht incase they sent something

    if (message.value === "") {
      return;
    }
    //update friendcaht to have the message we are about to send
    if (friendChat !== null) {
      setFriendChat((prevChat) => {
        if (prevChat === null)
          return [{ sender: user?.username ?? "", message: message.value }];
        return [
          ...prevChat,
          { sender: user?.username ?? "", message: message.value },
        ];
      });
    }

    //send message with socket.io, the message will be added to the chat on the backend
    user?.socket.emit("message", {
      sendee: selectedFriend?.user_uuid,
      message: message.value,
      //sender is in the format of a MiniUser
      sender: {
        username: user?.username,
        user_uuid: user?.user_uuid,
        user_profile: user?.user_profile,
      },
    });
    //clear form
    message.value = "";
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
            className={cn("p-2 rounded-md bg-gray-500 hover:bg-gray-700", {
              "ring-2 ring-red-500": user?.notifications.length !== 0,
            })}
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
              {user?.groups === undefined ||
              user?.groups === null ||
              user?.groups.length === 0 ? (
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
              {user?.friends === undefined ||
              user?.friends === null ||
              user?.friends.length === 0 ? (
                <li>No direct messages found</li>
              ) : (
                user?.friends.map((friend, index) => (
                  <li key={index}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => startChatting(friend)}
                    >
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${friend.username[0]}`}
                        />
                        <AvatarFallback>{friend.username[0]}</AvatarFallback>
                      </Avatar>
                      {friend.username}
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
          <h1 className="text-xl font-semibold">
            Messages to {selectedFriend?.username}
          </h1>
        </header>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {friendChat?.length === 0 || selectedFriend === null ? (
              <p>No messages</p>
            ) : (
              friendChat?.map((msg, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Avatar>
                    <AvatarImage src={selectedFriend?.avatarUrl} />
                    <AvatarFallback>
                      {selectedFriend?.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex ${
                      msg.sender === user?.user_uuid
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs p-2 rounded-md ${
                        msg.sender === user?.user_uuid
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <p className="font-semibold">
                        {msg.sender === user?.user_uuid
                          ? "You"
                          : selectedFriend?.username}
                      </p>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        {selectedFriend === null ? (
          <p>Select a friend to start chatting</p>
        ) : (
          <footer className="bg-white border-t p-4">
            <form className="flex space-x-2" onSubmit={sendMessage}>
              <Input
                className="flex-1"
                placeholder="Type a message..."
                id="msg"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </footer>
        )}
      </main>
    </div>
  );
}
