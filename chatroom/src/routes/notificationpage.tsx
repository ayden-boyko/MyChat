import React, { useContext, useEffect } from "react";
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
import { Badge } from "../components/ui/badge";
import { UserPlus, Users, MessageSquare, Bell } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { UserContext } from "../lib/UserContext";

interface Notification {
  id: string;
  type:
    | "friend_request"
    | "group_invite"
    | "group_join_request"
    | "unseen_message";
  from: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  groupName?: string;
}

// TODO ENABLE SORTING OF NOTIFICATIONS BY TYPE: 1, 2, 3, 4

export default function NotificationPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const context = useContext(UserContext);

  if (!context) {
    throw new Error("UserContext is not available");
  }

  const { user } = context;

  useEffect(() => {
    const fetchNotifications = async () => {
      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}api/notification/pending/${
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
      setNotifications(data);
    };
    fetchNotifications();
  }, [user?.user_uuid]);

  const handleAction = (
    notification: Notification,
    action: "accept" | "decline"
  ) => {
    // This is where you would handle the action, redirect to the chat, or other logic
    toast({
      title: action === "accept" ? "Accepted" : "Declined",
      description: `You have ${
        action === "accept" ? "accepted" : "declined"
      } the ${notification.type.replace("_", " ")}.`,
    });
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "friend_request":
        return <UserPlus className="h-4 w-4" />;
      case "group_invite":
      case "group_join_request":
        return <Users className="h-4 w-4" />;
      case "unseen_message":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Notifications</CardTitle>
          <CardDescription>
            Stay updated with your latest activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="mb-4 last:mb-0">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={notification.from.avatar}
                            alt={notification.from.name}
                          />
                          <AvatarFallback>
                            {notification.from.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {notification.content}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.timestamp}
                          </p>
                          {notification.groupName && (
                            <Badge variant="secondary" className="mt-1">
                              {notification.groupName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getIcon(notification.type)}
                          {(notification.type === "friend_request" ||
                            notification.type === "group_invite" ||
                            notification.type === "group_join_request") && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleAction(notification, "accept")
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAction(notification, "decline")
                                }
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {notification.type === "unseen_message" && (
                            <Button size="sm">View</Button>
                          )}
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
  );
}
