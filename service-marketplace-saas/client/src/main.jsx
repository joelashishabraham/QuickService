import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import "./styles/global.css";
import "./styles/animations.css";
import "./styles/theme.css";
import "./styles/chat.css";
import "./styles/dashboard.css";
import "./styles/createservice.css";
import "./styles/admin.css";
import "./styles/home.css";
import "./styles/navbar.css";
import "./styles/animatedCards.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);