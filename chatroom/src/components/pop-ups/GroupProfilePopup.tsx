import { useEffect, useState } from "react";
import { X, UserPlus, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../../hooks/use-toast";
import { MiniGroup } from "../../interfaces/MiniGroup";

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
  const [memberStatus, setMemberStatus] = useState(isMember);
  const [members, setMembers] = useState<number>(0);
  const { toast } = useToast();

  const handleMembershipAction = () => {
    setMemberStatus(!memberStatus);
    toast({
      title: memberStatus ? "Left Group" : "Joined Group",
      description: memberStatus
        ? `You have left ${group.group_name}.`
        : `You have joined ${group.group_name}.`,
    });
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
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
            aria-label="Close group profile"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={group.group_profile} />
              <AvatarFallback>{group.group_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{group.group_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{members} members</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleMembershipAction}
              className="w-full"
              variant={memberStatus ? "destructive" : "default"}
            >
              {memberStatus ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4" /> Leave Group
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Join Group
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
