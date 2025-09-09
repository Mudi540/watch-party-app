const socket = io();
els.video.addEventListener('play', () => emitControl('play'));
els.video.addEventListener('pause', () => emitControl('pause'));


let seekTimer = null;
['seeking', 'seeked'].forEach(evt => {
els.video.addEventListener(evt, () => {
clearTimeout(seekTimer);
seekTimer = setTimeout(() => emitControl('seek'), 100);
});
});


// Incoming socket events
socket.on('host-changed', ({ hostId }) => {
const amHostNow = socket.id === hostId;
setHostUI(amHostNow);
});


socket.on('video-ready', ({ url }) => {
const autoPlay = !els.video.src; // autoplay on first set
els.video.src = url;
if (autoPlay) els.video.play().catch(() => {});
});


socket.on('control', ({ type, time }) => {
suppressEvents = true;
if (Math.abs(els.video.currentTime - time) > 0.3) {
els.video.currentTime = time;
}
if (type === 'play') {
els.video.play().catch(() => {});
} else if (type === 'pause') {
els.video.pause();
} else if (type === 'seek') {
// nothing else needed; time already adjusted
}
setTimeout(() => (suppressEvents = false), 50);
});


socket.on('sync-state', ({ time, paused }) => {
suppressEvents = true;
els.video.currentTime = time || 0;
if (paused) {
els.video.pause();
} else {
els.video.play().catch(() => {});
}
setTimeout(() => (suppressEvents = false), 50);
});


socket.on('user-joined', () =>