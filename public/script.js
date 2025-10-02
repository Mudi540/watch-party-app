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

// === Cloudinary Media Library Integration ===
const cloudName = dx58lo8kg;   // 🔹 replace with your Cloudinary cloud name
const apiKey = 137231655629768;         // 🔹 replace with your Cloudinary API key

const ml = cloudinary.createMediaLibrary(
  {
    cloud_name: cloudName,
    api_key: apiKey,
    multiple: false,
    max_files: 1,
    resource_type: "video"
  },
  {
    insertHandler: (data) => {
      if (data.assets && data.assets.length > 0) {
        const selectedUrl = data.assets[0].secure_url;

        // Tell server so everyone sees the chosen video
        socket.on("videoUploaded", selectedUrl);

        // Update local video player
        video.src = selectedUrl;
        video.load();
        video.play();
      }
    }
  },
  "#chooseVideo" // 🔹 this is the ID of your "Choose from Library" button
);


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
