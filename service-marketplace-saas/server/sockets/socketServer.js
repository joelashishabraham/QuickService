const { Server } = require("socket.io");
const Message = require("../models/Message");

module.exports = function (server) {

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("🔌 Socket.IO initialized");

  /* ================= ONLINE USERS ================= */

  const onlineUsers = new Map();

  const getUserSockets = (userId) =>
    onlineUsers.get(userId)?.sockets || new Set();

  const isUserOnline = (userId) => onlineUsers.has(userId);

  const emitToUser = (userId, event, data) => {
    getUserSockets(userId).forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  };

  const broadcastOnlineUsers = () => {
    io.emit("onlineUsers", [...onlineUsers.keys()]);
  };

  /* ================= CONNECTION ================= */

  io.on("connection", (socket) => {
    console.log("⚡ Connected:", socket.id);

    /* ================= JOIN ================= */

    socket.on("join", (userId) => {
      if (!userId) return;

      userId = userId.toString();

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, {
          sockets: new Set(),
          lastSeen: null,
        });
      }

      onlineUsers.get(userId).sockets.add(socket.id);

      socket.join(userId);

      broadcastOnlineUsers();

      console.log(`🟢 ${userId} is online`);
    });

    /* ================= SEND MESSAGE ================= */

    socket.on("sendMessage", async (msg) => {
      try {
        if (!msg?.sender || !msg?.receiver) return;

        const sender = msg.sender.toString();
        const receiver = msg.receiver.toString();

        console.log("📩 Message:", sender, "→", receiver);

        /* SAVE MESSAGE */
        const saved = await Message.create({
          sender,
          receiver,
          text: msg.text || "",
          image: msg.image || null,
          audio: msg.audio || null,
          file: msg.file || null,
          replyTo: msg.replyTo || null,
          reaction: null,
          seen: false,
          delivered: false,
        });

        /* POPULATE */
        const fullMessage = await Message.findById(saved._id)
          .populate("sender", "name avatar")
          .populate("receiver", "name avatar")
          .populate("replyTo");

        /* SEND MESSAGE TO BOTH USERS */
        emitToUser(receiver, "newMessage", fullMessage);
        emitToUser(sender, "newMessage", fullMessage);

        /* DELIVERY STATUS */
        if (isUserOnline(receiver)) {
          await Message.findByIdAndUpdate(saved._id, { delivered: true });
          emitToUser(sender, "messageDelivered", saved._id);
        }

        /* NOTIFICATION */
        if (sender !== receiver) {
          emitToUser(receiver, "notification", {
            type: "message",
            text: `New message from ${fullMessage.sender.name}`,
            message: fullMessage,
            createdAt: new Date(),
          });
        }

      } catch (err) {
        console.error("❌ sendMessage error:", err);
      }
    });

    /* ================= EDIT ================= */

    socket.on("editMessage", async ({ messageId, text }) => {
      try {
        if (!messageId) return;

        const updated = await Message.findByIdAndUpdate(
          messageId,
          { text },
          { new: true }
        ).populate("sender", "name avatar");

        if (!updated) return;

        emitToUser(updated.sender._id.toString(), "messageEdited", updated);
        emitToUser(updated.receiver.toString(), "messageEdited", updated);

      } catch (err) {
        console.log("Edit error:", err);
      }
    });

    /* ================= DELETE ================= */

    socket.on("deleteMessage", async ({ messageId, sender, receiver }) => {
      try {
        if (!messageId) return;

        await Message.findByIdAndDelete(messageId);

        emitToUser(sender, "messageDeleted", messageId);
        emitToUser(receiver, "messageDeleted", messageId);

      } catch (err) {
        console.log("Delete error:", err);
      }
    });

    /* ================= TYPING ================= */

    socket.on("typing", ({ sender, receiver }) => {
      if (receiver) emitToUser(receiver, "typing", { sender });
    });

    socket.on("stopTyping", ({ sender, receiver }) => {
      if (receiver) emitToUser(receiver, "stopTyping", { sender });
    });

    /* ================= SEEN ================= */

    socket.on("seenMessages", async ({ sender, receiver }) => {
      try {
        await Message.updateMany(
          { sender, receiver, seen: false },
          { seen: true }
        );

        emitToUser(sender, "messagesSeen", { by: receiver });

      } catch (err) {
        console.log("Seen error:", err);
      }
    });

    /* ================= DISCONNECT ================= */

    socket.on("disconnect", () => {
      for (const [userId, data] of onlineUsers.entries()) {
        if (data.sockets.has(socket.id)) {
          data.sockets.delete(socket.id);

          if (data.sockets.size === 0) {
            onlineUsers.delete(userId);
          }
        }
      }

      broadcastOnlineUsers();

      console.log("🔴 Disconnected:", socket.id);
    });

  });

  return io;
};