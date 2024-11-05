import { useContext, useEffect, useState } from "react";
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
import {
  UserPlus,
  Users,
  MessageSquare,
  Bell,
  UserCircle,
  Home,
} from "lucide-react";
import { UserContext } from "../lib/UserContext";
import { User } from "../interfaces/userinterface";
import { Notifications } from "../interfaces/notifications";
import { useNavigate } from "react-router-dom";
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
} from "../components/ui/sidebar";

export default function NotificationPage() {
  const context = useContext(UserContext);
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");

  if (!context) {
    throw new Error("UserContext is not available");
  }

  const { user, setUser } = context;

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
      result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/notification/decline/${
          user?.user_uuid
        }/${notification.date}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    if (result?.ok) {
      setUser({
        ...user,
        notifications: user?.notifications?.filter((n) => n !== notification),
      } as User);
    } else {
      console.log(result);
      alert("Unable to process notification");
      throw new Error("Unable to process notification");
    }
  };

  const getIcon = (type: Notifications["catagory"]) => {
    switch (type) {
      case 4:
        return <UserPlus className="h-4 w-4" />;
      case 3:
      case 5:
        return <Users className="h-4 w-4" />;
      case 1:
      case 2:
        return <MessageSquare className="h-4 w-4" />;
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
        <Sidebar>
          <SidebarContent>
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
                      onClick={() => setActiveFilter(2)}
                      isActive={activeFilter === 2}
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
                      onClick={() => setActiveFilter(3)}
                      isActive={activeFilter === 3}
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
        <div className="flex-1">
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/home")}
              aria-label="Go to homepage"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
          <div className="container mx-auto py-10 w-max">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Notifications
                </CardTitle>
                <CardDescription>
                  Stay updated with your latest activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-200px)] w-full rounded-md border p-4">
                  {filteredNotifications === null ||
                  filteredNotifications?.length === 0 ? (
                    <p>No notifications</p>
                  ) : (
                    filteredNotifications?.map((notification, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
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
                                <p className="text-sm font-medium leading-none">
                                  {notification.payload}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(notification.date)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getIcon(notification.catagory)}
                                {
                                  <>
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
                                  </>
                                }
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
    </SidebarProvider>
  );
}
