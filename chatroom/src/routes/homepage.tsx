import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Settings, LogOut, Search, Send, Bell, PlusCircle } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../lib/UserContext";
import { User } from "../interfaces/userinterface";
import { cn } from "../lib/utils";
import { MiniUser } from "../interfaces/miniuser";
import { io } from "socket.io-client";
import GroupCreationPopup from "../components/pop-ups/createGroupPopup";
import { MiniGroup } from "../interfaces/MiniGroup";
import FriendProfilePopup from "../components/pop-ups/FriendProfilePopup";
import { formatDate } from "../lib/dateformater";

// TODO MAKE ALL TEXT BLACK SO IT CAN BE SEEN ON FIREFOX

export default function HomePage() {
  const context = useContext(UserContext);
  const [friendChat, setFriendChat] = useState<
    { sender: MiniUser; message: string; date: Date }[]
  >([]); // for use with individual friends or groups
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<
    MiniUser | MiniGroup | null
  >(null); // for use with individual friends or groups
  const [createGroup, setCreateGroup] = useState<boolean>(false);
  const [viewProfile, setViewProfile] = useState<boolean>(false);

  const navigate = useNavigate();

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  const { user, setUser } = context;

  const updateFriendChat = useCallback(
    (newMessage: { sender: MiniUser; message: string; date: Date }) => {
      setFriendChat((prevChat) => {
        return [...prevChat, newMessage];
      });
    },
    [setFriendChat]
  );

  useEffect(() => {
    if (user?.username === "") {
      navigate("/");
    }

    if (!hasJoined) {
      const createSocket = async () => {
        // instantiate user socket
        const socket = io("http://localhost:8000/user", {
          query: {
            user_uuid: user?.user_uuid, // include user_uuid here
          },
        });
        setUser({ ...user, socket: socket } as User);
        // join the user namespace
        socket.emit("join", user?.user_uuid);
        setHasJoined(true);
      };

      createSocket();
    }
  }, []); // changed from [user] to [] to prevent re-running when user changes

  useEffect(() => {
    if (user?.socket) {
      user.socket.on(
        "message",
        (data: { sender: MiniUser; message: string; date: Date }) =>
          updateFriendChat({
            sender: data.sender,
            message: data.message,
            date: data.date,
          })
      );
    }
  }, [user?.socket, updateFriendChat]);

  useEffect(() => {
    // pull data from database and update the user
    const updateUser = async () => {
      if (!user?.user_uuid) return;

      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/users/get/${
          user?.user_uuid
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await result.json();

      setUser({ ...user, ...data } as User);
    };
    updateUser();
  }, [user?.user_uuid]); // changed from [user] to [user?.user_uuid] to prevent re-running when user changes

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

  const startGroupChatting = async (group: MiniGroup) => {
    console.log("homepage.tsx - 100 - GROUP", group);
    if (group === null) {
      alert("Please select a group to start chatting");
      return;
    }
    const chat = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/chat/between/${
        user?.user_uuid
      }/${group.group_uuid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const chatData = await chat.json();

    console.log("homepage.tsx - 122 - GROUPCHATDATA", chatData);

    setSelectedFriend(group);

    //if messages are null, make them empty
    if (chatData === null) {
      setFriendChat([]);
      return;
    }
    setFriendChat(chatData.messages);
  };

  const startChatting = async (friend: MiniUser) => {
    if (selectedFriend == friend) {
      setViewProfile(true);
      return;
    }
    console.log("homepage.tsx - 80 - FRIEND", friend);
    if (friend === null) {
      alert("Please select a friend to start chatting");
      return;
    }
    const chat = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/chat/between/${
        user?.user_uuid
      }/${friend.user_uuid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const chatData = await chat.json();
    console.log("homepage.tsx - 103 - CHATDATA", chatData);

    setSelectedFriend(friend); //sets friend regarldess of whether caht is null or not

    //if messages are null, make them empty
    if (chatData === null) {
      setFriendChat([]);
      return;
    }
    setFriendChat(chatData.messages);
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("sending message");
    event?.preventDefault();
    const message = document.getElementById("msg") as HTMLInputElement;
    console.log("homepage.tsx - 104 - MESSAGE", message.value);

    await startChatting(selectedFriend as MiniUser); // to refresh the chat incase they sent something

    if (message.value === "") {
      return;
    }

    //update friendchat to have the message we are about to send
    updateFriendChat({
      sender: {
        username: user?.username,
        user_uuid: user?.user_uuid,
        user_profile: user?.user_profile,
      } as MiniUser,
      message: message.value,
      date: new Date(),
    });

    //send message with socket.io, the message will be added to the chat on the backend
    user?.socket.emit("message", {
      sendee:
        (selectedFriend as MiniUser)?.user_uuid ||
        (selectedFriend as MiniGroup)?.group_uuid,
      message: message.value,
      //sender is in the format of a MiniUser
      sender: {
        username: user?.username,
        user_uuid: user?.user_uuid,
        user_profile: user?.user_profile,
      },
      date: new Date(),
    });

    //clear input with id 'msg'
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
                    <Button
                      variant="ghost"
                      className="w-full justify-start "
                      onClick={() => startGroupChatting(group)}
                    >
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${group.group_name[0]}`}
                        />
                        <AvatarFallback>{group.group_name[0]}</AvatarFallback>
                      </Avatar>
                      {group.group_name}
                    </Button>
                  </li>
                ))
              )}
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setCreateGroup(true);
                  }}
                >
                  <PlusCircle />
                  Create Group
                </Button>
              </li>
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
            Messages to{" "}
            {(selectedFriend as MiniUser)?.username ||
              (selectedFriend as MiniGroup)?.group_name}
          </h1>
        </header>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {friendChat?.length === 0 || selectedFriend === null ? (
              <p>No messages</p>
            ) : (
              friendChat //sorts the chat by date from newest to oldest then maps it
                ?.slice()
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map(
                  (
                    msg: { sender: MiniUser; message: string; date: Date },
                    index
                  ) => (
                    <div key={index} className="flex space-x-2 w-full">
                      {msg.sender.user_uuid === user?.user_uuid ? (
                        <div className="flex-1 flex justify-end">
                          <div className="flex space-x-2">
                            <div className="max-w-xs p-2 rounded-md bg-blue-400 text-white">
                              <p className="text-xs font-semibold ">
                                {user?.username}
                              </p>
                              <p className="text-base">{msg.message}</p>
                              <p>{formatDate(msg.date)}</p>
                            </div>
                            <Avatar>
                              <AvatarImage src={msg.sender.user_profile} />
                              <AvatarFallback>
                                {msg.sender.username[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex justify-start">
                          <Avatar>
                            <AvatarImage src={msg.sender.user_profile} />
                            <AvatarFallback>
                              {msg.sender.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="max-w-xs p-2 rounded-md bg-gray-200 text-black">
                            <p className="text-xs font-semibold ">
                              {(selectedFriend as MiniUser)?.username ||
                                (selectedFriend as MiniGroup)?.group_name}
                            </p>
                            <p className="text-base">{msg.message}</p>
                            <p>{formatDate(msg.date)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )
            )}
          </div>
        </ScrollArea>
        <GroupCreationPopup
          isOpen={createGroup}
          onClose={() => {
            setCreateGroup(false);
          }}
        />

        {/* checks that viewProfile is not null and is not a MiniGroup before rendering the friend popup */}
        {viewProfile && selectedFriend && "user_uuid" in selectedFriend && (
          <FriendProfilePopup
            isOpen={viewProfile}
            onClose={() => {
              setViewProfile(false);
            }}
            friend={selectedFriend as MiniUser}
          />
        )}

        {/* */}

        {selectedFriend === null ? (
          <p>Select a friend or group to start chatting</p>
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
