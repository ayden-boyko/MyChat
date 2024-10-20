import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useToast } from "../hooks/use-toast";
import { X, Upload } from "lucide-react";

// TODO MAKE ALL TEXT BALCK SO IT CAN BE SEEN ON FIREFOX

interface Friend {
  id: number;
  name: string;
  avatarUrl: string;
}

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupIcon, setGroupIcon] = useState<string | null>(null);
  const [invitedFriends, setInvitedFriends] = useState<Friend[]>([]);
  const { toast } = useToast();

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = () => {
    // Here you would typically send the group data to your backend
    toast({
      title: "Group Created",
      description: `Your group "${groupName}" has been created successfully.`,
    });
  };

  const handleInviteFriend = () => {
    // This would typically open a friend selection dialog
    const newFriend: Friend = {
      id: invitedFriends.length + 1,
      name: `Friend ${invitedFriends.length + 1}`,
      avatarUrl: `https://api.dicebear.com/6.x/initials/svg?seed=Friend${
        invitedFriends.length + 1
      }`,
    };
    setInvitedFriends([...invitedFriends, newFriend]);
  };

  const handleRemoveFriend = (id: number) => {
    setInvitedFriends(invitedFriends.filter((friend) => friend.id !== id));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Group</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateGroup();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="group-icon">Group Icon</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                {groupIcon ? (
                  <AvatarImage src={groupIcon} alt="Group icon" />
                ) : (
                  <AvatarFallback>
                    <Upload className="h-8 w-8" />
                  </AvatarFallback>
                )}
              </Avatar>
              <Input
                id="group-icon"
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-description">Group Description</Label>
            <Textarea
              id="group-description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Invite Friends</Label>
            <div className="flex flex-wrap gap-2">
              {invitedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center bg-secondary rounded-full pl-1 pr-2 py-1"
                >
                  <Avatar className="w-6 h-6 mr-1">
                    <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm mr-1">{friend.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleInviteFriend}
              >
                Invite Friend
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Create Group
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
