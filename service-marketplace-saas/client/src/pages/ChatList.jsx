import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";



export default function ChatList() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const socketRef = useRef(null);

  /* ================= STATES ================= */
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  /* ================= LOAD CHATS ================= */
  const loadChats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/chat/conversations/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        const sorted = (res.data.data || []).sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0) -
            new Date(a.lastMessage?.createdAt || 0)
        );

        setChats(sorted);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadChats();
  }, []);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!currentUser?._id) return;

    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.emit("join", currentUser._id);

    /* ONLINE USERS */
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users.map(String));
    });

    /* NEW MESSAGE */
    socket.on("newMessage", (msg) => {
      setChats((prev) => {
        const senderId = msg.sender?._id || msg.sender;
        const receiverId = msg.receiver?._id || msg.receiver;

        const otherUserId =
          senderId === currentUser._id ? receiverId : senderId;

        let found = false;

        let updated = prev.map((chat) => {
          if (chat.user._id === otherUserId) {
            found = true;

            return {
              ...chat,
              lastMessage: {
                text: msg.text,
                file: msg.file,
                image: msg.image,
                audio: msg.audio,
                createdAt: msg.createdAt,
              },
              unreadCount:
                receiverId === currentUser._id
                  ? (chat.unreadCount || 0) + 1
                  : 0,
            };
          }
          return chat;
        });

        /* NEW CHAT */
        if (!found) {
          updated = [
            {
              user:
                msg.sender._id === currentUser._id
                  ? msg.receiver
                  : msg.sender,
              lastMessage: {
                text: msg.text,
                createdAt: msg.createdAt,
              },
              unreadCount: 1,
            },
            ...updated,
          ];
        }

        /* SORT ALWAYS */
        return updated.sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0) -
            new Date(a.lastMessage?.createdAt || 0)
        );
      });
    });

    /* PROFILE UPDATE */
    socket.on("userUpdated", (data) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.user._id === data.userId
            ? {
                ...chat,
                user: {
                  ...chat.user,
                  avatar: data.avatar,
                  name: data.name || chat.user.name,
                },
              }
            : chat
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  /* ================= FILTER ================= */
  const filtered = chats.filter((chat) =>
    chat.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= TIME ================= */
  const formatTime = (time) => {
    if (!time) return "";

    const date = new Date(time);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  /* ================= CHAT ITEM ================= */
  const ChatItem = ({ chat, index }) => {
    const user = chat.user || {};
    const isOnline = onlineUsers.includes(String(user._id));

    /* LAST MESSAGE */
    let lastText =
      chat.lastMessage?.text ||
      (chat.lastMessage?.image && "📷 Image") ||
      (chat.lastMessage?.audio && "🎤 Voice") ||
      (chat.lastMessage?.file && "📎 File") ||
      "Start conversation";

    /* AVATAR */
    const avatar = user?.avatar
      ? `http://localhost:5000/${user.avatar}?t=${Date.now()}`
      : `https://ui-avatars.com/api/?name=${user?.name || "User"}`;

    /* CLICK */
    const openChat = () => {
      navigate("/chat", {
        state: {
          receiverId: user._id,
          receiverName: user.name,
        },
      });
    };

    return (
      <motion.div
        className="chat-item"
        onClick={openChat}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
      >
        {/* AVATAR */}
        <div className="avatars-wrapper">
          <div className="avatars">
            <img src={avatar} alt="avatar" />
          </div>
          {isOnline && <span className="online-dot"></span>}
        </div>

        {/* INFO */}
        <div className="chat-info">
          <div className="top-row">
            <h4>{user.name || "Unknown"}</h4>
            <span className="time">
              {formatTime(chat.lastMessage?.createdAt)}
            </span>
          </div>

          <p className="last-msg">{lastText}</p>
        </div>

        {/* UNREAD */}
        {chat.unreadCount > 0 && (
          <div className="unread">{chat.unreadCount}</div>
        )}
      </motion.div>
    );
  };

  /* ================= UI ================= */
  return (
    <div className="chat-list-page">
      {/* HEADER */}
      <div className="chat-list-header">
        <h2>Messages</h2>

        <div className="search-box">
          <FiSearch />
          <input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LIST */}
      <div className="chat-list">
        {loading ? (
          <p className="empty">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="empty">No conversations</p>
        ) : (
          filtered.map((chat, index) => (
            <ChatItem key={chat.user._id} chat={chat} index={index} />
          ))
        )}
      </div>
    </div>
  );
}