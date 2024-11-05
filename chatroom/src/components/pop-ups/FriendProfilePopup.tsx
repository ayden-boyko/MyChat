import { useContext, useEffect } from "react";
import { X, UserMinus, Ban, PlusCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "../ui/alert-dialog";
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

// TODO test group drop down, test block and unfriend

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
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
            aria-label="Close profile"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={friend.user_profile} />
              <AvatarFallback>{friend.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{friend.username}</CardTitle>
              <p className="text-sm text-muted-foreground">
                @{friend.username}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button onClick={handleFriendAction} variant={"default"}>
                <UserMinus className="mr-2 h-4 w-4" /> Unfriend
              </Button>
              <Button onClick={handleBlockAction} variant={"secondary"}>
                <Ban className="mr-2 h-4 w-4" /> Block
              </Button>
            </div>
            {/* group invite menu */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>Invite to Group</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {user?.groups?.map((group) => (
                  <DropdownMenuItem onClick={() => handleInviteToGroup(group)}>
                    <PlusCircleIcon className="mr-2 h-4 w-4" /> Invite to
                    {group.group_name}
                    <Avatar className="ml-2 h-4 w-4">
                      <AvatarImage src={group.group_profile} />
                      <AvatarFallback>{group.group_name[0]}</AvatarFallback>
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
