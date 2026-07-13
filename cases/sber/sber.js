const motionVideos = [...document.querySelectorAll(".sber-case__motion video")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function syncMotionPreference() {
  if (!motionVideos.length) return;

  motionVideos.forEach((video) => {
    if (reducedMotion.matches) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    video.play().catch(() => {});
  });
}

syncMotionPreference();
reducedMotion.addEventListener?.("change", syncMotionPreference);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    motionVideos.forEach((video) => video.pause());
    return;
  }

  syncMotionPreference();
});
