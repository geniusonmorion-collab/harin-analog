const cases = [
  {
    title: "Ювелирцентр",
    subtitle: "Mobile app",
    year: "2026",
    video: "./assets/cases/uvelircentr-cover.mp4?v=hq-source",
    poster: "./assets/cases/uvelircentr-poster.jpg?v=hq-source",
    href: "./cases/uvelircentr/?v=square-content-grid",
    alt: "Видео-обложка кейса Ювелирцентр с мобильными экранами ювелирного приложения",
    tint: "a",
    category: "Product Design",
    caption: "Mobile app for a jewelry retail chain",
    description:
      "Mobile app for a jewelry retail chain: catalogue, product card, navigation, sale mechanics and a quick path to purchase.",
  },
  {
    title: "Сбер",
    subtitle: "Smart home",
    year: "2026",
    backgroundVideo: "./assets/cases/sber/background-video.mp4",
    backgroundPoster: "./assets/cases/sber/background-poster.jpg",
    video: "./assets/cases/sber/smart-animate.mp4",
    poster: "./assets/cases/sber/smart-step1.png",
    href: "./cases/sber/?v=sber-synced-start",
    disabled: true,
    alt: "Обложка кейса Сбер с интерфейсом умного дома",
    tint: "f",
    category: "Product Design",
    caption: "Smart home interface concept",
    description:
      "Product interface concept for a smart device ecosystem, connecting home scenarios, device control and assistant-driven routines.",
  },
  {
    title: "Долями",
    subtitle: "Mobile payment flow",
    year: "2026",
    image: "./assets/cases/dolinew.png",
    href: "./cases/dolyami/?v=dolyami-case",
    alt: "Обложка кейса Долями с интерфейсом оплаты частями",
    tint: "e",
    category: "Product Design",
    caption: "Mobile payment flow for installments",
    description:
      "Checkout and installment-flow research: reframing payment by parts as budget control rather than a credit-like experience.",
  },
  {
    title: "KERN®",
    subtitle: "Promo site (Awwwards HM)",
    year: "2025",
    video: "./assets/cases/kern/kern-home-preview.mp4",
    poster: "./assets/cases/kern/kern-home-poster.jpg",
    href: "https://kern.taptop.site/",
    external: true,
    wide: true,
    alt: "Видеообложка промосайта KERN",
    tint: "b",
    category: "Web Design, 3D Design",
    caption: "Promo site · Awwwards HM",
    description:
      "Brand concept, 3D ski model, art direction, website design and production. Seven international awards, including Awwwards Honorable Mention.",
  },
];

const gallery = document.querySelector("#gallery");
const viewButtons = document.querySelectorAll(".view-switch__button");
const viewPanels = document.querySelectorAll(".view-panel");
const viewer = document.querySelector("#viewer");
const viewerStage = viewer.querySelector(".viewer__stage");
const viewerCount = viewer.querySelector(".viewer__count");
const viewerTitle = viewer.querySelector(".viewer__title");
const closeButton = viewer.querySelector(".viewer__close");
const previousButton = viewer.querySelector(".viewer__nav--prev");
const nextButton = viewer.querySelector(".viewer__nav--next");
const caseSheet = document.querySelector("#caseSheet");
const caseSheetFrame = caseSheet.querySelector(".case-sheet__frame");
const caseSheetClose = caseSheet.querySelector(".case-sheet__close");
let activeIndex = 0;
let wheelLock = false;
let touchStartY = 0;
let caseSheetIndex = 0;
let caseSheetClearTimer = 0;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const synchronizedPlaybackRequests = new WeakMap();

function pad(value) {
  return String(value).padStart(2, "0");
}

function layeredSberMedia(item, large = false) {
  return `
    <div class="sber-cover-media" role="img" aria-label="${item.alt}">
      <video class="sber-cover-media__background" src="${item.backgroundVideo}" poster="${item.backgroundPoster}" preload="auto" data-autoplay="true" muted loop playsinline aria-hidden="true"></video>
      <div class="sber-cover-media__stage" aria-hidden="true">
        <video class="sber-cover-media__interface" src="${item.video}" poster="${item.poster}" preload="auto" data-autoplay="true" muted loop playsinline></video>
      </div>
    </div>
  `;
}

function waitUntilPlayable(video) {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    video.addEventListener("canplay", resolve, { once: true });
  });
}

function syncSberMediaGroup(group) {
  const videos = [...group.querySelectorAll("video[data-autoplay='true']")];
  if (!videos.length) return;

  const request = (synchronizedPlaybackRequests.get(group) || 0) + 1;
  synchronizedPlaybackRequests.set(group, request);
  videos.forEach((video) => video.pause());

  if (reducedMotion.matches || document.hidden) {
    if (reducedMotion.matches) {
      videos.forEach((video) => {
        video.currentTime = 0;
      });
    }
    return;
  }

  Promise.all(videos.map(waitUntilPlayable)).then(() => {
    if (synchronizedPlaybackRequests.get(group) !== request) return;
    if (reducedMotion.matches || document.hidden) return;

    videos.forEach((video) => {
      video.currentTime = 0;
    });

    requestAnimationFrame(() => {
      videos.forEach((video) => video.play().catch(() => {}));
    });
  });
}

function syncAutoplayVideos(root = document) {
  root.querySelectorAll(".sber-cover-media").forEach(syncSberMediaGroup);

  root.querySelectorAll("video[data-autoplay='true']").forEach((video) => {
    if (video.closest(".sber-cover-media")) return;

    if (reducedMotion.matches || document.hidden) {
      video.pause();
      if (reducedMotion.matches) video.currentTime = 0;
      return;
    }

    video.play().catch(() => {});
  });
}

function coverMarkup(item, large = false) {
  const media = item.backgroundVideo
    ? layeredSberMedia(item, large)
    : item.video
    ? `<video src="${item.video}" poster="${item.poster}" aria-label="${item.alt}" preload="${large ? "auto" : "metadata"}" autoplay muted loop playsinline></video>`
    : `<img src="${item.image}" alt="${item.alt}" loading="${large ? "eager" : "lazy"}" decoding="async" />`;

  return `
    <figure class="case-cover${large ? " case-cover--large" : ""}">
      ${media}
    </figure>
  `;
}

function caseMediaMarkup(item) {
  const media = item.backgroundVideo
    ? layeredSberMedia(item)
    : item.video
    ? `<video src="${item.video}" poster="${item.poster}" aria-label="${item.alt}" preload="auto" autoplay data-autoplay="true" muted loop playsinline></video>`
    : `<img src="${item.image}" alt="${item.alt}" loading="lazy" decoding="async" />`;

  return `
    <div class="gallery" tabindex="-1" aria-label="${item.alt}">
      <div class="gallery-track">
        <div class="slide">${media}</div>
      </div>
    </div>
  `;
}

function renderGallery() {
  gallery.innerHTML = cases
    .map(
      (item, index) => `
        <article class="case${item.disabled ? " case--disabled" : ""}${item.wide ? " case--wide" : ""}" data-index="${index}" data-tint="${item.tint}" ${item.disabled ? 'aria-disabled="true"' : `tabindex="0" role="button" aria-label="${item.external ? "Открыть сайт" : "Открыть кейс"} ${item.title}"`}>
          ${caseMediaMarkup(item)}
          <div class="case-caption" aria-hidden="true">
            <p class="case-caption__label">${item.title}</p>
            <p class="case-caption__text">${item.caption}</p>
            <span class="case-caption__arrow" aria-hidden="true">↗</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderViewer() {
  const item = cases[activeIndex];
  viewerStage.innerHTML = coverMarkup(item, true);
  syncAutoplayVideos(viewerStage);
  viewerCount.textContent = `${pad(activeIndex + 1)} / ${pad(cases.length)}`;
  viewerTitle.textContent = item.title;
}

function openViewer(index) {
  activeIndex = index;
  renderViewer();
  viewer.classList.add("is-open", "viewer--case");
  viewer.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("is-locked");
  closeButton.focus({ preventScroll: true });
}

function closeViewer() {
  viewer.classList.remove("is-open");
  viewer.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("is-locked");
  const trigger = gallery.querySelector(`[data-index="${activeIndex}"]`);
  trigger?.focus({ preventScroll: true });
}

function openCaseSheet(index) {
  const item = cases[index];
  if (!item?.href || item.disabled) return;

  window.clearTimeout(caseSheetClearTimer);
  caseSheetIndex = index;
  caseSheetFrame.title = `Кейс ${item.title}`;
  caseSheetFrame.src = item.href;
  caseSheet.classList.add("is-open");
  caseSheet.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("is-locked");
  caseSheetClose.focus({ preventScroll: true });
}

function closeCaseSheet() {
  caseSheet.classList.remove("is-open");
  caseSheet.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("is-locked");

  const trigger = gallery.querySelector(`[data-index="${caseSheetIndex}"]`);
  trigger?.focus({ preventScroll: true });
  caseSheetClearTimer = window.setTimeout(() => {
    caseSheetFrame.src = "about:blank";
  }, 720);
}

function showNext(direction) {
  activeIndex = (activeIndex + direction + cases.length) % cases.length;
  renderViewer();
}

function activateCase(index) {
  const item = cases[index];
  if (!item || item.disabled) return;

  if (item.external) {
    window.location.href = item.href;
    return;
  }

  if (item.href) {
    openCaseSheet(index);
    return;
  }

  openViewer(index);
}

renderGallery();
syncAutoplayVideos(gallery);
reducedMotion.addEventListener?.("change", () => syncAutoplayVideos());

document.addEventListener("visibilitychange", () => {
  syncAutoplayVideos();
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;

    viewButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    viewPanels.forEach((panel) => {
      const isActive = panel.dataset.panel === view;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  });
});

gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".case");
  if (!card) return;
  activateCase(Number(card.dataset.index));
});

gallery.addEventListener("keydown", (event) => {
  const card = event.target.closest(".case");
  if (!card) return;
  const item = cases[Number(card.dataset.index)];
  if (item.disabled) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activateCase(Number(card.dataset.index));
});

closeButton.addEventListener("click", closeViewer);
caseSheetClose.addEventListener("click", closeCaseSheet);
caseSheet.addEventListener("click", (event) => {
  if (event.target === caseSheet) closeCaseSheet();
});
previousButton.addEventListener("click", () => showNext(-1));
nextButton.addEventListener("click", () => showNext(1));

viewer.addEventListener("wheel", (event) => {
  if (!viewer.classList.contains("is-open") || wheelLock) return;
  const direction = event.deltaY > 0 || event.deltaX > 0 ? 1 : -1;
  showNext(direction);
  wheelLock = true;
  window.setTimeout(() => {
    wheelLock = false;
  }, 520);
});

viewer.addEventListener("touchstart", (event) => {
  touchStartY = event.touches[0].clientY;
});

viewer.addEventListener("touchend", (event) => {
  const delta = touchStartY - event.changedTouches[0].clientY;
  if (Math.abs(delta) < 36) return;
  showNext(delta > 0 ? 1 : -1);
});

window.addEventListener("keydown", (event) => {
  if (caseSheet.classList.contains("is-open")) {
    if (event.key === "Escape") closeCaseSheet();
    return;
  }
  if (!viewer.classList.contains("is-open")) return;
  if (event.key === "Escape") closeViewer();
  if (event.key === "ArrowRight" || event.key === "ArrowDown") showNext(1);
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") showNext(-1);
});
