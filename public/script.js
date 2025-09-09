const socket = io();
const video = document.getElementById("videoPlayer");
const uploadForm = document.getElementById("uploadForm");

socket.on("videoUploaded", (url) => {
  video.src = url;
  video.load();
  video.play();
});

// Controls
video.addEventListener("play", () => socket.emit("play"));
video.addEventListener("pause", () => socket.emit("pause"));
video.addEventListener("seeked", () => socket.emit("seek", video.currentTime));

socket.on("play", () => video.play());
socket.on("pause", () => video.pause());
socket.on("seek", (time) => {
  video.currentTime = time;
});
