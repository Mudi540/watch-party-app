const socket = io();
const video = document.getElementById("videoPlayer");
const uploadForm = document.getElementById("uploadForm");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(uploadForm);
  const res = await fetch("/upload", { method: "POST", body: formData });
  const data = await res.json();
  video.src = data.file;
  video.play();
});

video.addEventListener("play", () => socket.emit("play"));
video.addEventListener("pause", () => socket.emit("pause"));
video.addEventListener("seeked", () => socket.emit("seek", video.currentTime));

socket.on("play", () => video.play());
socket.on("pause", () => video.pause());
socket.on("seek", (time) => { video.currentTime = time; });
