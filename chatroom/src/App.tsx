import React from "react";
import "./output.css";
//import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./routes/homepage.tsx";
import LoginPage from "./routes/loginpage.tsx";
import SettingsPage from "./routes/settingspage.tsx";
import SignUpPage from "./routes/signuppage.tsx";

// interface User {
//   user_num: number;
//   name: string;
//   username: string;
//   user_profile: string;
//   friends: number[];
//   blocked: number[];
//   groups: number[];
// }

//const API = "http://localhost:8000/";

function App() {
  return (
    <div className="App h-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/sign_up" element={<SignUpPage />} />
      </Routes>
    </div>
  );
}

export default App;

// const [users, setUsers] = useState<User[]>([]);

// async function getData() {
//   const response = await fetch(API, { method: "GET" });
//   const fetched_users: any[] = await response.json();
//   console.log("Fetched Users:", fetched_users);

//   // Ensure it’s an array before setting state
//   if (Array.isArray(fetched_users)) {
//     setUsers(fetched_users);
//   } else {
//     console.error("Expected an array but got something else:", fetched_users);
//   }
// }

// async function postData() {
//   const response = await fetch(API, { method: "POST" });
//   const fetched_users = await response.json();
//   console.log("Fetched Users after POST:", fetched_users);

//   // Ensure it’s an array before setting state
//   if (Array.isArray(fetched_users)) {
//     setUsers(fetched_users);
//   } else {
//     setUsers([
//       {
//         user_num: 0,
//         name: "DUPLICATE USERS",
//         username: "",
//         user_profile: "",
//         friends: [],
//         blocked: [],
//         groups: [],
//       },
//     ]);
//   }
// }

// return (
//   <div className="App">
//     <header className="App-header">
//       <button onClick={postData}>Post Users</button>
//       <button onClick={getData}>Get Users</button>
//       {users.length === 0 ? (
//         <p>No Users</p>
//       ) : (
//         users.map((user, index) => (
//           <p key={index}>
//             {user.user_num} : {user.name}
//           </p>
//         ))
//       )}
//     </header>
//   </div>
// );
