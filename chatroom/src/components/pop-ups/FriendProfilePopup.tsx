import { useState } from "react";
import { X, UserPlus, UserMinus, Ban, UserCheck } from "lucide-react";
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
import { useToast } from "../../hooks/use-toast";

interface Friend {
  id: number;
  username: string;
  name: string;
  status: string;
  bio: string;
  avatarUrl: string;
}

interface FriendProfilePopupProps {
  friend: Friend;
  onClose: () => void;
  isFriend: boolean;
  isBlocked: boolean;
}

export default function FriendProfilePopup({
  friend,
  onClose,
  isFriend,
  isBlocked,
}: FriendProfilePopupProps) {
  const [friendStatus, setFriendStatus] = useState(isFriend);
  const [blockedStatus, setBlockedStatus] = useState(isBlocked);
  const { toast } = useToast();

  const handleFriendAction = () => {
    setFriendStatus(!friendStatus);
    toast({
      title: friendStatus ? "Friend Removed" : "Friend Added",
      description: friendStatus
        ? `You have removed ${friend.name} from your friends list.`
        : `You have added ${friend.name} to your friends list.`,
    });
  };

  const handleBlockAction = () => {
    setBlockedStatus(!blockedStatus);
    toast({
      title: blockedStatus ? "User Unblocked" : "User Blocked",
      description: blockedStatus
        ? `You have unblocked ${friend.name}.`
        : `You have blocked ${friend.name}.`,
    });
  };

  const handleInviteToGroup = () => {
    // This would typically open a group selection dialog
    toast({
      title: "Invite Sent",
      description: `You have invited ${friend.name} to join a group.`,
    });
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
              <AvatarImage src={friend.avatarUrl} />
              <AvatarFallback>{friend.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{friend.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                @{friend.username}
              </p>
              <p className="text-sm text-muted-foreground">{friend.status}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Bio</h3>
              <p className="text-sm">{friend.bio}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleFriendAction}
                variant={friendStatus ? "destructive" : "default"}
              >
                {friendStatus ? (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" /> Unfriend
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Friend
                  </>
                )}
              </Button>
              <Button
                onClick={handleBlockAction}
                variant={blockedStatus ? "outline" : "secondary"}
              >
                {blockedStatus ? (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" /> Unblock
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" /> Block
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={handleInviteToGroup}
              variant="outline"
              className="w-full"
            >
              Invite to Group
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
