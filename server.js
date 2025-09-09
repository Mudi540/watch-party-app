const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static("public"));

// File upload config
const upload = multer({ dest: "uploads/" });

// Upload route
app.post("/upload", upload.single("video"), (req, res) => {
  res.json({ file: `/uploads/${req.file.filename}` });
});

// Socket.IO sync events
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("play", () => socket.broadcast.emit("play"));
  socket.on("pause", () => socket.broadcast.emit("pause"));
  socket.on("seek", (time) => socket.broadcast.emit("seek", time));

  socket.on("disconnect", () => console.log("User disconnected"));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
