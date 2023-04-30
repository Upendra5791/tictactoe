const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:4200",
      "https://upendra5791.github.io",
      "http://127.0.0.1"
    ],
  },
});

let rooms = [];

io.on("connection", (socket) => {
  console.log("New socket connected", socket.id);

  socket.on("PLAYER_MOVE", (cells, playerId, roomId, callback) => {
    console.log(cells);
    callback("acknowledged");
    io.to(roomId).emit("PLAYER_MOVE", {
      cells,
      playerId,
    });
  });

  socket.on("INITIATE_GAME", (player, callback) => {
    const code = generateUniqueGameCode(player);
    rooms.push({
      roomId: code,
      players: [player],
    });
    socket.join(code);
    callback({
      status: 0,
      message: "New Room created and waiting for opponent",
      gameCode: code,
    });
  });

  socket.on("JOIN_GAME", (player, code, callback) => {
    const room = rooms.find((f) => f.roomId === code);
    if (!!room) {
      room.players.push(player);
      socket.join(room.roomId);
      if (room.players.length < 2) {
        callback({
          status: 0,
          message: "No opponent for this game. Start a new game.",
          gameCode: code,
        });
      } else if (room.players.length === 2) {
        callback({
          status: 1,
          message: "ready to start",
          gameCode: code,
        });
        io.to(room.roomId).emit("GAME_START", {
          roomId: room.roomId,
          initiator: room.players[0],
        });
      } else if (room.players.length > 2) {
        callback({
          status: 0,
          message: "Room already full. Start a new game",
          gameCode: code,
        });
      }
    } else {
      callback({
        status: 0,
        message: "Room not found",
        gameCode: code,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("EXIT_GAME", (roomId, callback) => {
    callback("acknowledged");
    io.to(roomId).emit("EXIT_GAME");
    rooms = rooms.filter(f => f.roomId !== roomId);
  });
});

const generateUniqueGameCode = (playerCode) => {
  return playerCode.substr(0, 5);
};

httpServer.listen(3000, () => {
  console.log("Socket.IO server running at http://localhost:3000");
});
