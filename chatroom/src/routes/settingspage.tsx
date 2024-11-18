//external
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import imageCompression from "browser-image-compression";

//internal
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
import { User } from "../interfaces/userinterface";

export default function SettingsPage() {
  const context = useContext(UserContext);
  const navigate = useNavigate();

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }
  const { user, setUser } = context;

  if (user?.username === "") {
    navigate("/");
  }

  let changedProfile = "";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    if (file) {
      //compresses the profile image
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        changedProfile = reader.result as string;
      };
      reader.readAsDataURL(compressedFile);
    }
    e.preventDefault();
  };

  const handleSaveChanges = async () => {
    console.log(
      "settingspage.tsx - 61 - ",
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_uuid: user?.user_uuid,
          username: (document.getElementById("username") as HTMLInputElement)
            ?.value,
          user_profile: changedProfile,
        }),
      }
    );

    if (result.ok) {
      console.log(result);
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
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-screen  dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            navigate("/home");
          }}
          aria-label="Go to homepage"
          className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <CardTitle className="text-2xl sm:text-3xl text-blue-700 dark:text-blue-300">
            Account Settings
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Manage your account settings and set email preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label
              htmlFor="avatar"
              className="text-gray-700 dark:text-gray-200"
            >
              Profile Picture
            </Label>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Avatar className="w-20 h-20 border-2 border-blue-200 dark:border-blue-700">
                <AvatarImage src={user?.user_profile} alt={user?.username} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  {"NONE"}
                </AvatarFallback>
              </Avatar>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-full sm:w-auto border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-gray-700 dark:text-gray-200"
            >
              Username
            </Label>
            <Input
              id="username"
              defaultValue={user?.username}
              className="w-full border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <Button
            variant="outline"
            onClick={handleSaveChanges}
            className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
              >
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <AlertDialogCancel className="w-full sm:w-auto bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
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
