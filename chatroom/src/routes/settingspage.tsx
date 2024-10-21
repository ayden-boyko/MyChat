import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
} from "../components/ui/alert-dialog";
import { UserContext } from "../lib/UserContext";
import { useContext } from "react";
import { User } from "../interfaces/userinterface";
import { useNavigate } from "react-router-dom";

// TODO MAKE ALL TEXT BLACK SO IT CAN BE SEEN ON FIREFOX

export default function SettingsPage() {
  const context = useContext(UserContext);
  const navigate = useNavigate();

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }
  const { user, setUser } = context;

  let changedProfile = "";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        reader.readAsDataURL(file);
        changedProfile = reader.result as string;
      };
    }
    e.preventDefault();
  };

  const handleSaveChanges = async () => {
    console.log(
      (document.getElementById("username") as HTMLInputElement)?.value
    );
    const result = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/users/update/${
        user?.user_uuid
      }`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: (user as unknown as { _id: string })?._id,
          username: (document.getElementById("username") as HTMLInputElement)
            ?.value,
          user_profile: changedProfile,
        }),
      }
    );

    if (result.ok) {
      alert("Your changes have been saved.");
      setUser({
        ...user,
        username: (document.getElementById("username") as HTMLInputElement)
          ?.value,
        user_profile: changedProfile,
      } as User);
      navigate("/home");
    } else {
      alert("Failed to save changes.");
    }
  };

  const handleDeleteAccount = async () => {
    const result = await fetch(`/api/users/delete:${user?.user_uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_uuid: user?.user_uuid }),
    });

    if (result.ok) {
      setUser(null);
      alert("Your account has been deleted.");
    } else {
      alert("Failed to delete account.");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account settings and set email preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.user_profile} alt={user?.username} />
                <AvatarFallback>{"NONE"}</AvatarFallback>
              </Avatar>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue={user?.username} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSaveChanges}>
            Save Changes
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount}>
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
