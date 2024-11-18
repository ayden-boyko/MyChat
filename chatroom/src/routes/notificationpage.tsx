//external
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  UserPlus,
  Users,
  Bell,
  Home,
  TicketCheck,
  UserPen,
  MessagesSquare,
  Filter,
  MessageSquare,
  UserCircle,
} from "lucide-react";

//internal
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { UserContext } from "../lib/UserContext";
import { User } from "../interfaces/userinterface";
import { Notifications } from "../interfaces/notifications";
import { formatDate } from "../lib/dateformater";

import { FriendContext } from "../lib/FriendContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function NotificationPage() {
  const context = useContext(UserContext);
  const friendContext = useContext(FriendContext);
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");

  if (!context) {
    throw new Error("UserContext is not available");
  }

  if (!friendContext) {
    throw new Error("FriendContext is not available");
  }

  const { user, setUser } = context;
  const { setSelectedFriend } = friendContext;

  if (user?.username === "") {
    navigate("/");
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/notification/pending/${
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

      setUser({
        ...user,
        notifications: data.notifications,
      } as User);
    };
    fetchNotifications();
  }, []);

  const handleAction = async (
    notification: Notifications,
    action: "accept" | "decline"
  ) => {
    let result;
    if (action === "accept") {
      //console.log("accepting", notification);
      result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/notification/accept/${
          user?.user_uuid
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notification }),
        }
      );
    } else if (action === "decline") {
      console.log("declining", notification);
      result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/notification/decline/${
          user?.user_uuid
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notification }),
        }
      );
    }
    if (result?.ok) {
      setUser({
        ...user,
        notifications: user?.notifications?.filter((n) => n !== notification),
      } as User);
      // then redirect to chat with said user/group
      console.log("notification", notification);
      if (
        (action === "accept" && notification.catagory === 1) ||
        notification.catagory === 2 ||
        notification.catagory === 3
      ) {
        // also must check if user has an existing socket, otherwise create on for them
        if (user?.socket) {
          const newSocket = io(
            `${import.meta.env.VITE_BACKEND_API_URL}/${
              notification.sender && "U" === notification.sender.user_uuid[0]
                ? "user"
                : "group"
            }`
          );

          // join if its not a group invite
          if (notification.catagory !== 3) {
            newSocket.emit("join", {
              user_uuid: user?.user_uuid,
            });
          } else {
            //special join message for users who join a new group
            const end_portion = notification.payload.split(",")[1];
            const group_uuid = end_portion.slice(1, -1);
            newSocket.emit("new join", {
              group_uuid: group_uuid,
              miniUser: {
                user_uuid: user?.user_uuid,
                username: user?.username,
                user_profile: user?.user_profile,
              },
            });
          }

          await setUser({ ...user, socket: newSocket } as User);
        }

        //set selectedfriend to the user and set friendchat to their respective chat
        //must check if the notification is from a MiniUser or a MiniGroup
        setSelectedFriend(
          notification.sender && "U" === notification.sender.user_uuid[0]
            ? user?.friends.find(
                (friend) => friend.user_uuid === notification.sender.user_uuid
              ) ?? null
            : user?.groups.find(
                (group) => group.group_uuid === notification.sender.user_uuid
              ) ?? null
        );

        console.log("notification viewed: ", notification);

        navigate("/home");
      }
    } else {
      console.log(result);
      alert("Unable to process notification");
      throw new Error("Unable to process notification");
    }
  };

  const getIcon = (type: Notifications["catagory"]) => {
    switch (type) {
      case 4: // friend request
        return <UserPlus className="h-4 w-4" />;
      case 3: // group invite
        return <TicketCheck className="h-4 w-4" />;
      case 5: //group join request
        return <Users className="h-4 w-4" />;
      case 1: //user message
        return <UserPen className="h-4 w-4" />;
      case 2: // group message
        return <MessagesSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotifications =
    activeFilter === "all"
      ? user?.notifications
      : user?.notifications?.filter(
          (notification) => notification.catagory === activeFilter
        );

  const filterOptions = [
    { value: 0, label: "All", icon: Bell },
    { value: 4, label: "Friend Requests", icon: UserPlus },
    { value: 3, label: "Group Invites", icon: Users },
    { value: 1, label: "Direct Messages", icon: MessageSquare },
    { value: 2, label: "Group Messages", icon: Users },
    { value: 5, label: "Group Join Requests", icon: UserCircle },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-gray-800">
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => setActiveFilter(option.value)}
                  className={`${
                    option.value === activeFilter
                      ? "bg-blue-100 dark:bg-blue-900"
                      : ""
                  } text-gray-700 dark:text-gray-300`}
                >
                  <option.icon className="mr-2 h-4 w-4" />
                  <span>{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            Notifications
          </h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/home")}
          aria-label="Go to homepage"
          className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
        >
          <Home className="h-4 w-4" />
        </Button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64 p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <nav>
            <ul className="space-y-2">
              {filterOptions.map((option) => (
                <li key={option.value}>
                  <Button
                    variant={
                      activeFilter === option.value ? "default" : "ghost"
                    }
                    className={`w-full justify-start ${
                      activeFilter === option.value
                        ? "bg-blue-600 text-white hover:text-gray-700 dark:hover:text-gray-300"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50"
                    }`}
                    onClick={() => setActiveFilter(option.value)}
                  >
                    <option.icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-4 overflow-auto">
          <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded shadow-lg">
            <CardHeader className="bg-blue-50 dark:bg-gray-700">
              <CardDescription className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                Stay updated with your latest activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md border border-gray-200 dark:border-gray-700 p-4">
                {filteredNotifications?.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No notifications
                  </p>
                ) : (
                  filteredNotifications?.map((notification, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <Card className="bg-white dark:bg-gray-800 shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={notification.sender.user_profile}
                                alt={notification.sender.username}
                              />
                              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                                {notification.sender.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                                {notification.payload}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(notification.date)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getIcon(notification.catagory)}
                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleAction(notification, "accept")
                                  }
                                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                  {notification.catagory === 4 ||
                                  notification.catagory === 5 ||
                                  notification.catagory === 3
                                    ? "Accept"
                                    : "View"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleAction(notification, "decline")
                                  }
                                  className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700"
                                >
                                  {notification.catagory === 4 ||
                                  notification.catagory === 5 ||
                                  notification.catagory === 3
                                    ? "Decline"
                                    : "Close"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
