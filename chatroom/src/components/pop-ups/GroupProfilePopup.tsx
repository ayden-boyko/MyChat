//external
import { useContext, useEffect, useState } from "react";
import { X, UserPlus, UserMinus } from "lucide-react";
//internal
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MiniGroup } from "../../interfaces/minigroup";
import { UserContext } from "../../lib/UserContext";

interface GroupProfilePopupProps {
  isOpen: boolean;
  group: MiniGroup;
  onClose: () => void;
  isMember: boolean;
}

export default function GroupProfilePopup({
  isOpen,
  group,
  onClose,
  isMember,
}: GroupProfilePopupProps) {
  const [members, setMembers] = useState<number>(0);
  const context = useContext(UserContext);

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  const { user } = context;

  const handleMembershipAction = async () => {
    // send join request to group
    const result = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/groups/request/${
        group.group_uuid
      }`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // Fix the capitalization here
        },
        body: JSON.stringify({
          user_uuid: user?.user_uuid,
          username: user?.username,
          user_profile: user?.user_profile,
        }),
      }
    );

    console.log("group join result", result);

    alert("Join request sent!");
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const result = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/groups/membercount/${
            group.group_uuid
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await result.json();
        setMembers(data.membercount);
      } catch (error) {
        console.error("member error", error);
      }
    };

    fetchMembers();
  }, []);

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
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 rounded shadow-lg">
        <CardHeader className="relative bg-blue-50 dark:bg-gray-700 ">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-gray-400 text-gray-700 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
            aria-label="Close group profile"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-blue-200 dark:border-blue-700">
              <AvatarImage src={group.group_profile} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                {group.group_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-blue-700 dark:text-blue-300">
                {group.group_name}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {members} members
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Button
              onClick={handleMembershipAction}
              className="w-full"
              variant={isMember ? "destructive" : "default"}
            >
              {isMember ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4" /> Leave Group
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Request to Join Group
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
