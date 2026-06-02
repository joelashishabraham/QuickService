import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5000");

    socket.emit("join", user._id);

    socket.on("new-booking", (data) => {
      setNotifications((prev) => [...prev, data.message]);
    });

    return () => socket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ notifications }}>
      {children}
    </SocketContext.Provider>
  );
};