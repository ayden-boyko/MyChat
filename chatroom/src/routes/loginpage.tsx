//external
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

//internal
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
import { UserContext } from "../lib/UserContext";

export default function LoginPage() {
  const context = useContext(UserContext);
  const navigate = useNavigate();

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  const { setUser } = context;

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
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("LOGIN RESULT", result);
        // Redirect to the home page upon successful login
        setUser(result.pulledUser);
        //set JWT for authorization in local storage
        localStorage.setItem("token", result.token);

        console.log("loginpage.tsx - 51- LOGIN success", result);

        navigate("/home");
      } else {
        const error = await response.json();
        console.error(error.message); // Show error message
        alert("Invalid email or password");
      }
    } catch (err) {
      console.error("An error occurred:", err);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4  dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="space-y-1 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center text-blue-700 dark:text-blue-300">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            id="login-form"
            action="api/login/password"
            method="post"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-200"
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
                className="w-full border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-200"
              >
                User Name
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="User123"
                required
                className="w-full border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-200"
              >
                Password
              </label>
              <div className="relative w-full">
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  className="w-full pr-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <img
                  src="./src/assets/eye_closed.svg"
                  alt="Toggle password visibility"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer h-5 w-5 text-gray-500 dark:text-gray-400"
                  id="toggle-password"
                  onClick={() => {
                    const icon = document.getElementById(
                      "toggle-password"
                    ) as HTMLImageElement;
                    const passwordInput =
                      icon.parentElement?.querySelector("input");
                    if (icon.src.includes("closed")) {
                      icon.src = "./src/assets/eye_open.svg";
                      icon.alt = "Hide password";
                      passwordInput?.setAttribute("type", "text");
                    } else {
                      icon.src = "./src/assets/eye_closed.svg";
                      icon.alt = "Show password";
                      passwordInput?.setAttribute("type", "password");
                    }
                  }}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            form="login-form"
          >
            Login
          </Button>
          <p className="text-sm text-center text-gray-600 dark:text-gray-300">
            Don't have an account?{" "}
            <a
              href="/sign_up"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
