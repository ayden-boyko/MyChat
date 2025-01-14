//external
import {
  Settings,
  LogOut,
  Search,
  Send,
  Bell,
  PlusCircle,
  ChevronDown,
} from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

//internal
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { UserContext } from "../lib/UserContext";
import { User } from "../interfaces/userinterface";
import { MiniUser } from "../interfaces/miniuser";
import GroupCreationPopup from "../components/pop-ups/createGroupPopup";
import { MiniGroup } from "../interfaces/minigroup";
import FriendProfilePopup from "../components/pop-ups/FriendProfilePopup";
import { formatDate } from "../lib/dateformater";
import GroupProfilePopup from "../components/pop-ups/GroupProfilePopup";
import { FriendContext } from "../lib/FriendContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function HomePage() {
  const context = useContext(UserContext);
  const friendContext = useContext(FriendContext);
  const [friendChat, setFriendChat] = useState<
    { sender: MiniUser; message: string; date: Date }[]
  >([]); // for use with individual friends or groups

  const [createGroup, setCreateGroup] = useState<boolean>(false);
  const [viewProfile, setViewProfile] = useState<boolean>(false);

  const navigate = useNavigate();

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  if (!friendContext) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a FriendProvider");
  }

  const { user, setUser } = context;
  const { selectedFriend, setSelectedFriend } = friendContext;

  const updateFriendChat = useCallback(
    (newMessage: { sender: MiniUser; message: string; date: Date }) => {
      setFriendChat((prevChat) => [...prevChat, newMessage]);
    },
    []
  );

  const handleSocketNamespaceSwitch = async () => {
    const newSocket = io(
      `${import.meta.env.VITE_BACKEND_API_URL}/${
        selectedFriend && "user_uuid" in selectedFriend ? "user" : "group"
      }`
    );
    newSocket.emit("join", { user_uuid: user?.user_uuid });
    setUser({ ...user, socket: newSocket } as User);
  };

  useEffect(() => {
    handleSocketNamespaceSwitch();
  }, [selectedFriend]);

  useEffect(() => {
    if (user?.socket) {
      if (selectedFriend && "user_uuid" in selectedFriend) {
        startChatting(selectedFriend as MiniUser);
      } else if (selectedFriend && "group_uuid" in selectedFriend) {
        startGroupChatting(selectedFriend as MiniGroup);
      }
    }
  }, [user?.socket, selectedFriend]);

  //waits for incoming messages
  useEffect(() => {
    try {
      if (user?.socket) {
        const messageType =
          selectedFriend && "user_uuid" in selectedFriend
            ? "message"
            : "group message";
        user?.socket.on(
          messageType,
          (data: { sender: MiniUser; message: string; date: Date }) =>
            updateFriendChat({
              sender: data.sender,
              message: data.message,
              date: data.date,
            })
        );
        user?.socket.on("new join", (data: MiniUser) => {
          updateFriendChat({
            sender: data,
            message: `${data.username} has joined the chat`,
            date: new Date(),
          });
        });
      }
    } catch {
      console.log("socket error");
      navigate("/");
    }
  }, [user?.socket, updateFriendChat]);

  // pull data from database and update the user
  useEffect(() => {
    const updateUser = async () => {
      if (!user?.user_uuid) return;
      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/users/get/id/${
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
  }, []); // changed from [user] to [user?.user_uuid] to prevent re-running when user changes

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
      //disconnet user socket
      user?.socket?.disconnect();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const startGroupChatting = async (group: MiniGroup) => {
    user?.socket.emit("group join", {
      user_uuid: user?.user_uuid,
      group_uuid: group.group_uuid,
    });

    if (group === null) {
      alert("Please select a group to start chatting");
      return;
    }
    const chat = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/chat/${group.group_uuid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const chatData = await chat.json();

    //if messages are null, make them empty
    if (chatData.chat.length === 0) {
      setFriendChat([]);
      return;
    }
    setFriendChat([]); // Set friendChat to an empty array
    chatData.chat.forEach(
      (message: { sender: MiniUser; message: string; date: Date }) => {
        updateFriendChat(message); // Update friendChat with each message
      }
    );
  };

  const startChatting = async (friend: MiniUser) => {
    user?.socket.emit("join", {
      user_uuid: user?.user_uuid,
    });

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

    //if messages are null, make them empty
    if (chatData === null) {
      setFriendChat([]);
      return;
    }
    setFriendChat([]); // Set friendChat to an empty array
    if (chatData.messages !== 0) {
      chatData.messages.forEach(
        (message: { sender: MiniUser; message: string; date: Date }) => {
          updateFriendChat(message); // Update friendChat with each message
        }
      );
    }
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const message = document.getElementById("msg") as HTMLInputElement;

    //if the selected friend is MiniUser, then call the code
    if (selectedFriend && "user_uuid" in selectedFriend) {
      // to refresh the chat incase they sent something
      await startChatting(selectedFriend as MiniUser); //as MiniUser
    } else if (selectedFriend && "group_uuid" in selectedFriend) {
      //selected frined is a group
      await startGroupChatting(selectedFriend as MiniGroup);
    } else {
      // there is no selected friend
      alert("Please select a friend or group to start chatting");
      return;
    }

    if (message.value === "") {
      alert("Please enter a message");
      return;
    }

    //update friendchat to have the message we are about to send

    const newMessage = {
      sender: {
        username: user?.username,
        user_uuid: user?.user_uuid,
        user_profile: user?.user_profile,
      } as MiniUser,
      message: message.value,
      date: new Date(),
    };
    setFriendChat((prevChat) => [...prevChat, newMessage]);

    // check if user or group message is being sent
    const reciever =
      selectedFriend && "user_uuid" in selectedFriend
        ? selectedFriend?.user_uuid
        : selectedFriend?.group_uuid;

    const message_type =
      selectedFriend && "user_uuid" in selectedFriend
        ? "message"
        : "group message";

    user?.socket.emit(message_type, {
      sendee: reciever,
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

  const SidebarContent = ({ inDropdown = false }) => (
    <>
      <div className={inDropdown ? "" : "p-4"}>
        <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">
          Groups
        </h2>
        <ul className="space-y-2">
          {user?.groups && user.groups.length > 0 ? (
            user.groups.map((group: MiniGroup, index: number) => (
              <li key={index}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 dark:text-gray-700 dark:hover:text-gray-300 bg-blue-100 hover:bg-blue-200 dark:hover:bg-blue-900 "
                  onClick={() => {
                    if (selectedFriend === group) {
                      setViewProfile(true);
                      return;
                    }
                    setSelectedFriend(group);
                  }}
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
          ) : (
            <li className="text-gray-500 dark:text-gray-400">
              No groups found
            </li>
          )}
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start text-blue-600 dark:text-blue-600 bg-blue-100 hover:bg-blue-200 dark:hover:bg-blue-900 dark:hover:text-gray-300"
              onClick={() => setCreateGroup(true)}
            >
              <PlusCircle className="mr-2" />
              Create Group
            </Button>
          </li>
        </ul>
        <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />
        <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">
          Direct Messages
        </h2>
        <ul className="space-y-2">
          {user?.friends && user.friends.length > 0 ? (
            user.friends.map((friend: MiniUser, index: number) => (
              <li key={index}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 dark:text-gray-900 bg-blue-100 hover:bg-blue-200 dark:hover:bg-blue-900 dark:hover:text-gray-300"
                  onClick={() => {
                    if (selectedFriend === friend) {
                      setViewProfile(true);
                      return;
                    }
                    setSelectedFriend(friend);
                  }}
                >
                  <Avatar className="w-6 h-6 mr-2 border-black border-2">
                    <AvatarImage src={friend.user_profile} />
                    <AvatarFallback>{friend.username[0]}</AvatarFallback>
                  </Avatar>
                  {friend.username}
                </Button>
              </li>
            ))
          ) : (
            <li className="text-gray-500 dark:text-gray-400">
              No direct messages found
            </li>
          )}
        </ul>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      {/* Settings Sidebar */}
      <aside className="w-16 bg-blue-600 dark:bg-gray-800 text-white p-4 flex flex-col items-center justify-between">
        <div className="space-y-4">
          <button
            className="p-2 rounded-md bg-blue-500 hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600"
            aria-label="Settings"
            onClick={() => navigate("/settings")}
          >
            <Settings />
          </button>
          <button
            className="p-2 rounded-md bg-blue-500 hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600"
            aria-label="Search"
            onClick={() => navigate("/search")}
          >
            <Search />
          </button>
          <button
            className={`p-2 rounded-md bg-blue-500 hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600 ${
              user?.notifications?.length !== 0 ? "ring-2 ring-white" : ""
            }`}
            aria-label="Notifications"
            onClick={() => navigate("/notifications")}
          >
            <Bell />
          </button>
        </div>
        <button
          className="p-2 rounded-md bg-blue-500 hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600"
          aria-label="Logout"
          onClick={() => {
            localStorage.clear();
            logout(user);
            setUser(null);
          }}
        >
          <LogOut />
        </button>
      </aside>

      {/* Group and Direct Messages Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
        <ScrollArea className="h-full">
          <SidebarContent />
        </ScrollArea>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        <header className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
              Messages to{" "}
              {(selectedFriend as MiniUser)?.username ||
                (selectedFriend as MiniGroup)?.group_name}{" "}
            </h1>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  Chats <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800">
                <DropdownMenuLabel className="text-blue-700 dark:text-blue-300">
                  Chats
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <ScrollArea className="h-[400px]">
                  <SidebarContent inDropdown={true} />
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {friendChat?.length === 0 || selectedFriend === null ? (
              <p className="text-gray-500 dark:text-gray-400">No messages</p>
            ) : (
              friendChat
                ?.filter((msg) => !user?.blocked?.includes(msg.sender))
                .sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                )
                .map((msg, index) => (
                  <div key={index} className="flex space-x-2 w-full">
                    {msg.sender.user_uuid === user?.user_uuid ? (
                      <div className="flex-1 flex justify-end">
                        <div className="flex space-x-2">
                          <div className="max-w-xs p-2 rounded-md bg-blue-500 text-white">
                            <p className="text-xs font-semibold">
                              {user?.username}
                            </p>
                            <p className="text-base">{msg.message}</p>
                            <p className="text-xs">{formatDate(msg.date)}</p>
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
                        <div className="max-w-xs p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                          <p className="text-xs font-semibold">
                            {(selectedFriend as MiniUser)?.username ||
                              (selectedFriend as MiniGroup)?.group_name}
                          </p>
                          <p className="text-base">{msg.message}</p>
                          <p className="text-xs">{formatDate(msg.date)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
        {selectedFriend === null ? (
          <p className="text-center p-4 text-gray-500 dark:text-gray-400">
            Select a friend or group to start chatting
          </p>
        ) : (
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <form className="flex space-x-2" onSubmit={sendMessage}>
              <Input
                className="flex-1 text-gray-500 focus:text-gray-800 dark:focus:text-gray-300 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="Type a message..."
                id="msg"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </footer>
        )}

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

        {/* checks that viewProfile is not null and is a MiniGroup before rendering the group popup */}
        {viewProfile && selectedFriend && "group_name" in selectedFriend && (
          <GroupProfilePopup
            isOpen={viewProfile}
            onClose={() => {
              setViewProfile(false);
            }}
            group={selectedFriend as MiniGroup}
            isMember={true}
          />
        )}
      </main>
    </div>
  );
}
