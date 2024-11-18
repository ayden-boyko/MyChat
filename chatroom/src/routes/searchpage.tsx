//external
import { useContext, useEffect, useState } from "react";
import { Home, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

//internal
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { MiniUser } from "../interfaces/miniuser";
import UserProfilePopup from "../components/pop-ups/UserProfilePopup";
import { UserContext } from "../lib/UserContext";
import { MiniGroup } from "../interfaces/minigroup";
import GroupProfilePopup from "../components/pop-ups/GroupProfilePopup";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [collection, setCollection] = useState("user");
  const [searchResults, setSearchResults] = useState<{
    people: MiniUser[];
    groups: MiniGroup[];
  }>({
    people: [],
    groups: [],
  });
  const [selectedUser, setSelectedUser] = useState<MiniUser | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<MiniGroup | null>(null);

  const context = useContext(UserContext);
  const navigate = useNavigate();

  const user = context?.user;

  useEffect(() => {
    if (user?.username === "") {
      navigate("/");
    }
  });

  const handleSearch = async () => {
    if (!searchQuery) alert("Please enter a search query");

    console.log("searchpage.tsx - 53 - preparing search", searchQuery);

    const result = await fetch(
      `${
        import.meta.env.VITE_BACKEND_API_URL
      }/api/${collection}/get/name/${searchQuery}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!result.ok) {
      console.error("searchpage.tsx - 63 - search failed", result);
      return;
    }

    const data = await result.json();

    if (collection === "users") {
      setSearchResults({ people: data, groups: [] });
    } else {
      setSearchResults({ people: [], groups: data });
    }
  };

  const handleClick = (user: MiniGroup | MiniUser) => {
    console.log("searchpage.tsx - 84 -user", user);
    if ("username" in user) {
      console.log("searchpage.tsx - 86 -group", user);
      setSelectedUser(user);
    } else if ("group_name" in user) {
      console.log("searchpage.tsx - 89 -group", user);
      setSelectedGroup(user);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  const handleSendFriendRequest = async () => {
    try {
      console.log("searchpage.tsx - 86 -sender", user);
      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/friend/request/${
          selectedUser?.user_uuid
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_uuid: user?.user_uuid,
            username: user?.username,
            user_profile: user?.user_profile,
          }),
        }
      );
      const message = await result.json();

      console.log("searchpage.tsx - 105 -friend result", message);
      if (
        message.message === "You're already friends with this person" ||
        message.message ===
          "You've already sent a friend request to this user" ||
        message.message === "You can't send a friend request to yourself"
      ) {
        alert(message.message);
      } else if (result.ok) {
        alert("Friend request sent");
      }
    } catch (error) {
      console.log("searchpage.tsx - 116 -error", error);
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
      <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <CardHeader className=" dark:bg-gray-700 ">
          <CardTitle className="text-2xl sm:text-3xl text-blue-700 dark:text-blue-300">
            Search
          </CardTitle>
          <CardDescription className="text-gray-700 dark:text-gray-300 ">
            Find people and groups
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
            <Input
              placeholder="Search for people or groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
            <Button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>

          <Tabs defaultValue="people" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="people"
                onClick={() => setCollection("users")}
                className="data-[state=active]:bg-white data-[state=inactive]:bg-gray-200 dark:data-[state=inactive]:bg-gray-700 dark:data-[state=active]:bg-gray-200 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-700"
              >
                People
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                onClick={() => setCollection("groups")}
                className="data-[state=active]:bg-white data-[state=inactive]:bg-gray-200 dark:data-[state=inactive]:bg-gray-700 dark:data-[state=active]:bg-gray-200 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-700"
              >
                Groups
              </TabsTrigger>
            </TabsList>
            <TabsContent value="people">
              <ScrollArea className="h-[300px] sm:h-[400px] w-full rounded-md border border-gray-200 dark:border-gray-700 p-4">
                {searchResults.people.length > 0 ? (
                  searchResults.people.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 mb-4"
                    >
                      <Avatar>
                        <AvatarImage
                          src={user.user_profile}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        onClick={() => handleClick(user)}
                        className="cursor-pointer"
                      >
                        <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                          {user.username}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.user_uuid.slice(0, 9)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </p>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="groups">
              <ScrollArea className="h-[300px] sm:h-[400px] w-full rounded-md border border-gray-200 dark:border-gray-700 p-4">
                {searchResults.groups.length > 0 ? (
                  searchResults.groups.map((group) => (
                    <div
                      key={group.group_uuid}
                      className="flex items-center space-x-4 mb-4 cursor-pointer"
                      onClick={() => handleClick(group)}
                    >
                      <Avatar>
                        <AvatarImage
                          src={group.group_profile}
                          alt={group.group_name}
                        />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {group.group_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                          {group.group_name}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    {searchResults.groups.length === 0
                      ? "No Groups found"
                      : "Loading"}
                  </p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Profile Popup */}
      {selectedUser && (
        <UserProfilePopup
          user={selectedUser}
          onClose={handleClose}
          onSendFriendRequest={handleSendFriendRequest}
        />
      )}

      {/* Group Profile Popup */}
      {selectedGroup && (
        <GroupProfilePopup
          isOpen={selectedGroup !== null}
          isMember={false} // This should be determined based on the user's group membership
          group={selectedGroup}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
