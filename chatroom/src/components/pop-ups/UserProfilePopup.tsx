//external
import { X, UserPlus } from "lucide-react";
//internal
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
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 rounded shadow-lg">
        <CardHeader className="relative bg-blue-50 dark:bg-gray-700">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-gray-400 text-gray-700 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
            aria-label="Close profile"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-blue-200 dark:border-blue-700">
              <AvatarImage src={user?.user_profile} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                {user?.username[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-blue-700 dark:text-blue-300">
                {user?.username}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                User ID: {user?.user_uuid.slice(0, 9)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Button
              onClick={handleSendFriendRequest}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Send Friend Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
