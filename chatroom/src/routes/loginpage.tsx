import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../lib/UserContext";

export default function LoginPage() {
  const context = useContext(UserContext);
  const navigate = useNavigate();

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  const { user, setUser } = context;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior

    const formData = new FormData(event.currentTarget); // Get form data

    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/login/password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(result); // Success message
        // Redirect to the home page upon successful login
        setUser({ ...user, ...result.user });
        navigate("/home");
      } else {
        const error = await response.json();
        console.error(error.message); // Show error message
      }
    } catch (err) {
      console.error("An error occurred:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="login-form"
            action="api/login/password"
            method="post"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="test@example.com"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  User Name
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text" // Changed from 'username' to 'text'
                  placeholder="User123"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password
                </label>
                <div className="relative w-full">
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                    className="w-full pr-10"
                  />
                  <img
                    src="./src/assets/eye_closed.svg"
                    alt="open eye"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer h-full"
                    id="toggle-password"
                    onClick={() => {
                      const icon = document.getElementById(
                        "toggle-password"
                      ) as HTMLImageElement;
                      // Toggles between 'open eye' and 'closed eye'
                      if (icon.src.includes("closed")) {
                        icon.src = "./src/assets/eye_open.svg";
                        icon.alt = "closed eye";
                        icon.parentElement
                          ?.querySelector("input")
                          ?.setAttribute("type", "text");
                      } else {
                        icon.setAttribute("src", "./src/assets/eye_closed.svg");
                        icon.alt = "open eye";
                        icon.parentElement
                          ?.querySelector("input")
                          ?.setAttribute("type", "password");
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full hover:bg-gray-300"
            form="login-form"
          >
            Login
          </Button>
          <p className="text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <a href="/sign_up" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
