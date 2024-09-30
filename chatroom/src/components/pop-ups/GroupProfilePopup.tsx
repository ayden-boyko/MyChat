import { useState } from "react";
import { X, UserPlus, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../../hooks/use-toast";

interface Group {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  memberCount: number;
}

interface GroupProfilePopupProps {
  group: Group;
  onClose: () => void;
  isMember: boolean;
}

export default function GroupProfilePopup({
  group,
  onClose,
  isMember,
}: GroupProfilePopupProps) {
  const [memberStatus, setMemberStatus] = useState(isMember);
  const { toast } = useToast();

  const handleMembershipAction = () => {
    setMemberStatus(!memberStatus);
    toast({
      title: memberStatus ? "Left Group" : "Joined Group",
      description: memberStatus
        ? `You have left ${group.name}.`
        : `You have joined ${group.name}.`,
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
            aria-label="Close group profile"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={group.iconUrl} />
              <AvatarFallback>{group.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{group.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {group.memberCount} members
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm">{group.description}</p>
            </div>
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
