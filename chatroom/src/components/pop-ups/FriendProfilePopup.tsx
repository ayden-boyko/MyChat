import { useState } from "react";
import { X } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import React from "react";

interface Friend {
  id: number;
  name: string;
  status: string;
  bio: string;
}

interface FriendProfilePopupProps {
  friend: Friend;
  onClose: () => void;
  onBlock: (friendId: number) => void;
}

export default function FriendProfilePopup({
  friend,
  onClose,
  onBlock,
}: FriendProfilePopupProps) {
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const handleSendMessage = () => {
    setIsMessageVisible(true);
    setTimeout(() => setIsMessageVisible(false), 3000);
  };

  const handleBlockUser = () => {
    onBlock(friend.id);
    onClose();
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
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${friend.name}`}
              />
              <AvatarFallback>{friend.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{friend.name}</CardTitle>
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
            <Button className="w-full" onClick={handleSendMessage}>
              Send Message
            </Button>
            {isMessageVisible && (
              <p className="text-sm text-green-600 text-center">
                Message sent to {friend.name}!
              </p>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Block User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will block {friend.name}. You won't be able to send or
                    receive messages from them.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBlockUser}>
                    Block User
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
