const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000; // ✅ important for Render

// Serve static files
app.use(express.static("public"));

// Video upload setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.post("/upload", upload.single("video"), (req, res) => {
  res.send("Upload complete!");
});

// Socket.IO video sync
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("video-event", (data) => socket.broadcast.emit("video-event", data));
  socket.on("disconnect", () => console.log("A user disconnected"));
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
