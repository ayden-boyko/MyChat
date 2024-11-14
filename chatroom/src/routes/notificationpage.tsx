//external
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  UserPlus,
  Users,
  MessageSquare,
  Bell,
  UserCircle,
  Home,
  TicketCheck,
  UserPen,
  MessagesSquare,
} from "lucide-react";

//internal
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { UserContext } from "../lib/UserContext";
import { User } from "../interfaces/userinterface";
import { Notifications } from "../interfaces/notifications";
import { formatDate } from "../lib/dateformater";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { FriendContext } from "../lib/FriendContext";

// TODO FIX STYLING

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

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="hidden md:block">
          <SidebarContent className="bg-white">
            <SidebarGroup>
              <SidebarGroupLabel>Filter</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveFilter("all")}
                      isActive={activeFilter === "all"}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      <span>All</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveFilter(4)}
                      isActive={activeFilter === 4}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Friend Requests</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveFilter(3)}
                      isActive={activeFilter === 3}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span>Group Invites</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveFilter(1)}
                      isActive={activeFilter === 1}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Direct Messages</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveFilter(2)}
                      isActive={activeFilter === 2}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span>Group Messages</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveFilter(5)}
                      isActive={activeFilter === 5}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Group Join Requests</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <SidebarTrigger className="md:hidden">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </SidebarTrigger>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigate("/home");
              }}
              aria-label="Go to homepage"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-full md:max-w-4xl lg:max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Stay updated with your latest activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-300px)] w-full rounded-md border p-4">
                    {filteredNotifications?.length === 0 ? (
                      <p>No notifications</p>
                    ) : (
                      filteredNotifications?.map((notification, index) => (
                        <div key={index} className="mb-4 last:mb-0">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <Avatar>
                                  <AvatarImage
                                    src={notification.sender.user_profile}
                                    alt={notification.sender.username}
                                  />
                                  <AvatarFallback>
                                    {notification.sender.username[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                  {notification.catagory === 5 ? (
                                    <>
                                      <p className="text-sm font-medium leading-none">
                                        {notification.payload.split(",")[0]}
                                      </p>
                                      <p className="text-sm leading-none">
                                        {notification.payload.split(",")[1]}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-sm font-medium leading-none">
                                      {notification.payload}
                                    </p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
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
                                    >
                                      {notification.catagory === 4 ||
                                      notification.catagory === 5 ||
                                      notification.catagory === 3
                                        ? "Accept"
                                        : "View"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleAction(notification, "decline")
                                      }
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
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
