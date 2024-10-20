import { useContext, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Icons } from "../components/ui/icons.tsx";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../lib/UserContext.ts";

// TODO make sign in page white like the other pages
// TODO MAKE ALL TEXT BLACK SO IT CAN BE SEEN ON FIREFOX

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const context = useContext(UserContext);

  // Check if the context is defined
  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  const { user, setUser } = context;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formdata = {
      username: event.currentTarget.username.value,
      email: event.currentTarget.email.value,
      password: event.currentTarget.password.value,
    };

    if (
      event.currentTarget.password.value !==
      event.currentTarget.confirmedpassword.value
    ) {
      console.error("Passwords do not match");
      alert("Passwords do not match");
      setIsLoading(false);
      //clear passwords when passwords do not match
      event.currentTarget.password.value = "";
      event.currentTarget.confirmedpassword.value = "";
      return;
    }

    // Send the data to the server
    const result = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/users/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      }
    );

    const data = await result.json();
    if (result.ok && data.email && data.username) {
      console.log(data); // Log user data for debugging
      setUser({ ...user, ...data });
      navigate("/home"); // Redirect to HomePage on success
    }
    // Check for specific error message
    else if (data.error === "An internal server error occurred") {
      console.error("Error creating account:", data.error);
    } else {
      console.error("Unexpected response:", data);
    }
  };

  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="johndoe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmedpassword">Confirm Password</Label>
                <Input id="confirmedpassword" type="password" required />
              </div>
              <Button
                className="w-full hover:bg-gray-300"
                type="submit"
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign Up
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center w-full">
            By clicking Sign Up, you agree to our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
