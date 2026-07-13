const motionVideo = document.querySelector(".sber-case__motion video");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function syncMotionPreference() {
  if (!motionVideo) return;

  if (reducedMotion.matches) {
    motionVideo.pause();
    motionVideo.currentTime = 0;
    return;
  }

  motionVideo.play().catch(() => {});
}

syncMotionPreference();
reducedMotion.addEventListener?.("change", syncMotionPreference);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    motionVideo?.pause();
    return;
  }

  syncMotionPreference();
});
