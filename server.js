import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import path from "path";

const app = express();
const server = createServer(app);
const io = new Server(server);

// Cloudinary config (replace with your own values)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(express.static(path.join(process.cwd(), "public")));
const upload = multer();

// Store current video URL
let currentVideoUrl = null;

// Upload route → uploads to Cloudinary
app.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  try {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "video" },
      (error, result) => {
        if (error) return res.status(500).send(error);
        currentVideoUrl = result.secure_url;

        // Notify everyone a new video is ready
        io.emit("videoUploaded", currentVideoUrl);
        res.json({ url: currentVideoUrl });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Socket.io for sync play/pause/seek
io.on("connection", (socket) => {
  console.log("New user connected");

  // Send current video to new user
  if (currentVideoUrl) {
    socket.emit("videoUploaded", currentVideoUrl);
  }

  socket.on("play", () => socket.broadcast.emit("play"));
  socket.on("pause", () => socket.broadcast.emit("pause"));
  socket.on("seek", (time) => socket.broadcast.emit("seek", time));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
