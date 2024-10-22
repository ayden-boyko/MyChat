import { useState } from "react";
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
import { Search, Users, Hash } from "lucide-react";

interface Person {
  id: string;
  username: string;
  avatarUrl: string;
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
  avatarUrl: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [collection, setCollection] = useState("user");
  const [searchResults, setSearchResults] = useState<{
    people: Person[];
    groups: Group[];
  }>({
    people: [],
    groups: [],
  });

  // TODO SET UP GROUP SERACH LOGIC, ONLY USER EXISTS RN
  const handleSearch = async () => {
    if (!searchQuery) alert("Please enter a search query");

    console.log("preparing search", searchQuery);

    const result = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/users/get/${searchQuery}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("got data!");

    const data = await result.json();

    if (collection === "user") {
      setSearchResults({ people: data, groups: [] });
    } else {
      setSearchResults({ people: [], groups: data });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Find people and groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Input
              placeholder="Search for people or groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>

          <Tabs defaultValue="people">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="people" onClick={() => setCollection("user")}>
                People
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                onClick={() => setCollection("group")}
              >
                Groups
              </TabsTrigger>
            </TabsList>
            <TabsContent value="people">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {searchResults.people.length > 0 ? (
                  searchResults.people.map((person, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 mb-4"
                    >
                      <Avatar>
                        <AvatarImage
                          src={person.avatarUrl}
                          alt={person.username}
                        />
                        <AvatarFallback>{person.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {person.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{person.username}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    {searchResults.people.length === 0
                      ? "No results found"
                      : "Loading"}
                  </p>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="groups">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {searchResults.groups.length > 0 ? (
                  searchResults.groups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center space-x-4 mb-4"
                    >
                      <Avatar>
                        <AvatarImage src={group.avatarUrl} alt={group.name} />
                        <AvatarFallback>{group.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {group.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {group.memberCount} members
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
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
    </div>
  );
}
