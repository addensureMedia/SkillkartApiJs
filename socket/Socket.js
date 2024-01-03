const { Server } = require("socket.io");

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("user connected")
    socket.on("join-room", (roomId, userId, user) => {
      console.log(userId);
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", userId, user);
      socket.on("create-message", (msg, user) => {
        console.log(msg)
        io.to(roomId).emit("get-msg", msg, user);
      });
      socket.on("messagesended", (sended) => {
        socket.to(roomId).emit("got-msg", sended);
      });
      socket.on("disconnect", () => {
        socket.to(roomId).emit("user-disconnected", userId);
      });
      socket.on("mic-off", (micoff) => {
        socket.to(roomId).emit("micoff", micoff);
      });
    });
  });

  return io;
};

module.exports = socketHandler;
