import React from "react";
import ReactDOM from "react-dom/client";
//import App from "./App.tsx";
import "./output.css";
//import { BrowserRouter } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
