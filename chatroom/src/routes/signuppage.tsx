//external
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

//internal
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Icons } from "../components/ui/icons";
import { UserContext } from "../lib/UserContext";

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
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="space-y-1 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center sm:text-3xl text-blue-700 dark:text-blue-300">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-300">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-gray-700 dark:text-gray-200"
              >
                Username
              </Label>
              <Input
                id="username"
                placeholder="johndoe"
                required
                className="w-full text-gray-400 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-700 dark:text-gray-200"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                required
                className="w-full text-gray-400 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-gray-700 dark:text-gray-200"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                className="w-full text-gray-400 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmedpassword"
                className="text-gray-700 dark:text-gray-200"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmedpassword"
                type="password"
                required
                className="w-full text-gray-400 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
