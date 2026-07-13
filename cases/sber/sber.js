const motionVideos = [...document.querySelectorAll(".sber-case__motion video")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let playbackRequest = 0;

function waitUntilPlayable(video) {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    video.addEventListener("canplay", resolve, { once: true });
  });
}

function syncMotionPreference() {
  if (!motionVideos.length) return;

  const request = ++playbackRequest;
  motionVideos.forEach((video) => video.pause());

  if (reducedMotion.matches || document.hidden) {
    if (reducedMotion.matches) {
      motionVideos.forEach((video) => {
        video.currentTime = 0;
      });
    }
    return;
  }

  Promise.all(motionVideos.map(waitUntilPlayable)).then(() => {
    if (playbackRequest !== request || reducedMotion.matches || document.hidden) return;

    motionVideos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });

    requestAnimationFrame(() => {
      motionVideos.forEach((video) => video.play().catch(() => {}));
    });
  });
}

syncMotionPreference();
reducedMotion.addEventListener?.("change", syncMotionPreference);

document.addEventListener("visibilitychange", () => {
  syncMotionPreference();
});
