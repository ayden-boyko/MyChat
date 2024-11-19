//external
import { useContext, useEffect } from "react";
import { X, UserMinus, Ban, PlusCircleIcon } from "lucide-react";
//internal
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { UserContext } from "../../lib/UserContext";
import { MiniUser } from "../../interfaces/miniuser";
import { User } from "../../interfaces/userinterface";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MiniGroup } from "../../interfaces/minigroup";

interface FriendProfilePopupProps {
  isOpen: boolean;
  friend: MiniUser;
  onClose: () => void;
}

export default function FriendProfilePopup({
  isOpen,
  friend,
  onClose,
}: FriendProfilePopupProps) {
  const context = useContext(UserContext);

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  const { user, setUser } = context;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleFriendAction = async () => {
    try {
      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/friend/remove/${
          friend.user_uuid
        }/${user?.user_uuid}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("friend removed: ", result);
      alert(`You have unfriended ${friend.username}.`);
      setUser({
        ...user,
        friends:
          user?.friends.filter((f) => f !== friend) ?? ([] as MiniUser[]),
      } as User);
    } catch (error) {
      alert(`Failed to unfriend ${friend.username}.`);
      console.log("friend not removed: ", error);
    }
  };

  const handleBlockAction = async () => {
    try {
      const result = await fetch(
        `
        ${import.meta.env.VITE_BACKEND_API_URL}/api/friend/block/${
          friend.user_uuid
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mini_user: {
              user_uuid: user?.user_uuid,
              username: user?.username,
              user_profile: user?.user_profile,
            },
          }),
        }
      );
      console.log("friend blocked: ", result);
      alert(`You have blocked ${friend.username}.`);
      setUser({
        ...user,
        blocked: [...(user?.blocked ?? []), friend],
      } as User);
    } catch (error) {
      alert(`Failed to block ${friend.username}.`);
      console.log("friend not blocked: ", error);
    }
  };

  const handleInviteToGroup = async (group: MiniGroup) => {
    try {
      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/group/invite/${
          friend.user_uuid
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_uuid: group?.group_uuid,
            username: group?.group_name,
            user_profile: group?.group_profile,
          }),
        }
      );
      console.log("invite sent: ", result);
      alert(`Inviting ${friend.username} to a group.`);
    } catch (error) {
      alert(`Failed to invite ${friend.username} to a group.`);
      console.log("invite not sent: ", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 rounded shadow-lg">
        <CardHeader className="relative bg-blue-50 dark:bg-gray-700 ">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-gray-400 text-gray-700 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" // TODO CHANGE STYLING FOR FIREFOX
            onClick={onClose}
            aria-label="Close profile"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-blue-200 dark:border-blue-700">
              <AvatarImage src={friend.user_profile || ""} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                {friend.username[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-blue-700 dark:text-blue-300">
                {friend.username}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{friend.username}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button
                onClick={handleFriendAction}
                variant="default"
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                <UserMinus className="mr-2 h-4 w-4" /> Unfriend
              </Button>
              <Button
                onClick={handleBlockAction}
                variant="secondary"
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <Ban className="mr-2 h-4 w-4" /> Block
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Invite to Group
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {user?.groups?.map((group, index) => (
                  <DropdownMenuItem
                    onClick={() => handleInviteToGroup(group)}
                    key={index}
                    className="text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-blue-900"
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                    {`Invite to ${group.group_name}`}
                    <Avatar className="ml-2 h-4 w-4 border border-gray-300 dark:border-gray-600 p-3">
                      <AvatarImage src={group.group_profile} />
                      <AvatarFallback
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                      >
                        {group.group_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
