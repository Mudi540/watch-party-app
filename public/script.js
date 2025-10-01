const socket = io();
const video = document.getElementById("videoPlayer");
const uploadForm = document.getElementById("uploadForm");

// Intercept form submission
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page refresh

  const formData = new FormData(uploadForm);

  try {
    // Upload to server (which uploads to Cloudinary)
    const res = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.url) {
      video.src = data.url;
      video.load();
      video.play();
    }
  } catch (err) {
    console.error("Upload failed:", err);
  }
});

let isRemoteSeek = false;
let seekTimeout;

// Listen for video URL broadcast from server
socket.on("videoUploaded", (url) => {
  video.src = url;
  video.load();
  video.play();
});

// Controls
video.addEventListener("play", () => socket.emit("play"));
video.addEventListener("pause", () => socket.emit("pause"));

video.addEventListener("seeked", () => {
  if (isRemoteSeek) {
    // Reset the guard so next local seek works normally
    isRemoteSeek = false;
    return;
  }

  // Debounce to avoid spamming on rapid seeks
  clearTimeout(seekTimeout);
  seekTimeout = setTimeout(() => {
    socket.emit("seek", video.currentTime);
  }, 300);
});

// Incoming events
socket.on("play", () => video.play());
socket.on("pause", () => video.pause());

socket.on("seek", (time) => {
  isRemoteSeek = true;
  video.currentTime = time;
});
