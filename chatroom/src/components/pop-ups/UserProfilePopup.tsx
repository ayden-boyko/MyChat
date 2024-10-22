import { X, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MiniUser } from "../../interfaces/miniuser";

interface UserProfilePopupProps {
  user: MiniUser | null;
  onClose: () => void;
  onSendFriendRequest: (userId: string | undefined) => void;
}

export default function UserProfilePopup({
  user,
  onClose,
  onSendFriendRequest,
}: UserProfilePopupProps) {
  const handleSendFriendRequest = () => {
    onSendFriendRequest(user?.user_uuid);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white">
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
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.username[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle>{user?.username}</CardTitle>
              <p className="text-sm text-muted-foreground">
                User ID: {user?.user_uuid.slice(0, 9)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleSendFriendRequest} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" /> Send Friend Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
