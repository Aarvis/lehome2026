(function () {
  const root = document.documentElement;
  const button = document.getElementById("themeToggle");
  const buttonLabel = document.getElementById("themeToggleLabel");
  const storedTheme = window.localStorage.getItem("preprint-theme");
  const initialTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "light";

  function setTheme(theme) {
    root.dataset.theme = theme;
    window.localStorage.setItem("preprint-theme", theme);
    if (!button) return;
    button.setAttribute("aria-checked", String(theme === "light"));
    button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    if (buttonLabel) {
      buttonLabel.textContent = `${theme === "dark" ? "Dark" : "Light"} theme active`;
    }
  }

  setTheme(initialTheme);

  if (button) {
    button.addEventListener("click", function () {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  function keepVideoMuted(video) {
    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;
  }

  document.querySelectorAll("video").forEach(keepVideoMuted);

  function warmupMediaAssets() {
    const urls = new Set();
    const retainedPreloads = [];

    document.querySelectorAll("img").forEach(function (image) {
      image.decoding = "async";
      image.loading = "eager";
      image.fetchPriority = "low";
      const src = image.currentSrc || image.src;
      if (src) urls.add(src);
    });

    document.querySelectorAll("video").forEach(function (video) {
      video.preload = "auto";
      const source = video.currentSrc || video.querySelector("source")?.src || video.src;
      if (source) urls.add(source);
      const shouldResume = video.autoplay || !video.paused;
      video.load();
      if (shouldResume) {
        video.play().catch(function () {});
      }
    });

    urls.forEach(function (url) {
      const isVideo = /\.(mp4|webm|mov)(\?|#|$)/i.test(url);
      if (isVideo) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "video";
        link.href = url;
        link.fetchPriority = "low";
        if (/\.mp4(\?|#|$)/i.test(url)) link.type = "video/mp4";
        document.head.appendChild(link);
        retainedPreloads.push(link);
        return;
      }

      const preloadImage = new Image();
      preloadImage.decoding = "async";
      preloadImage.fetchPriority = "low";
      preloadImage.src = url;
      if (typeof preloadImage.decode === "function") {
        preloadImage.decode().catch(function () {});
      }
      retainedPreloads.push(preloadImage);
    });

    window.__preprintMediaPreloads = retainedPreloads;
  }

  const scheduleMediaWarmup = window.requestIdleCallback || function (callback) {
    return window.setTimeout(callback, 0);
  };
  scheduleMediaWarmup(warmupMediaAssets, { timeout: 500 });

  document.querySelectorAll("[data-hero-video]").forEach(function (video) {
    keepVideoMuted(video);
    video.controls = false;

    const showControls = function () {
      video.controls = true;
    };
    const hideControls = function () {
      video.controls = false;
    };

    video.addEventListener("mouseenter", showControls);
    video.addEventListener("focus", showControls);
    video.addEventListener("touchstart", showControls, { passive: true });
    video.addEventListener("mouseleave", hideControls);
    video.addEventListener("blur", hideControls);

    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        // Muted autoplay is still retried after the browser finishes loading media.
        video.addEventListener("canplay", function retryAutoplay() {
          video.play().catch(function () {});
        }, { once: true });
      });
    }
  });

  document.querySelectorAll("[data-muted-loop-video]").forEach(function (video) {
    keepVideoMuted(video);
    video.loop = true;
    video.playsInline = true;

    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        video.addEventListener("canplay", function retryMutedAutoplay() {
          video.play().catch(function () {});
        }, { once: true });
      });
    }
  });

  const lightbox = document.getElementById("imageLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxVideo = document.getElementById("lightboxVideo");
  let lastLightboxTrigger = null;
  let lightboxOpenedOverModal = false;

  function getVisiblePreviewImage(trigger) {
    const images = Array.from(trigger.querySelectorAll("img"));
    return images.find(function (image) {
      return window.getComputedStyle(image).display !== "none";
    }) || images[0] || null;
  }

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImage || !lightboxVideo) return;
    const previewVideo = trigger.matches("video") ? trigger : trigger.querySelector("video");
    const previewImage = previewVideo ? null : getVisiblePreviewImage(trigger);
    if (!previewImage && !previewVideo) return;

    lastLightboxTrigger = trigger;
    if (previewVideo) {
      const videoSource = previewVideo.currentSrc || previewVideo.querySelector("source")?.src || previewVideo.src;
      lightboxImage.hidden = true;
      lightboxImage.removeAttribute("src");
      lightboxVideo.hidden = false;
      lightboxVideo.src = videoSource;
      keepVideoMuted(lightboxVideo);
      lightboxVideo.play().catch(function () {});
    } else {
      lightboxVideo.hidden = true;
      lightboxVideo.pause();
      lightboxVideo.removeAttribute("src");
      lightboxImage.hidden = false;
      lightboxImage.src = previewImage.currentSrc || previewImage.src;
      lightboxImage.alt = previewImage.alt || "Large image preview";
    }
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightboxOpenedOverModal = Boolean(trigger.closest(".solver-modal"));
    if (!lightboxOpenedOverModal && window.location.hash !== "#imageLightbox") {
      window.history.pushState(null, "", "#imageLightbox");
    }
    const closeButton = lightbox.querySelector(".image-lightbox__close");
    if (closeButton) closeButton.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage || !lightboxVideo) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxImage.hidden = false;
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.hidden = true;
    if (!lightboxOpenedOverModal && window.location.hash === "#imageLightbox") {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
    lightboxOpenedOverModal = false;
    if (lastLightboxTrigger) lastLightboxTrigger.focus();
  }

  document.addEventListener("click", function (event) {
    const clickedElement = event.target instanceof Element ? event.target : event.target.parentElement;
    if (!clickedElement) return;

    const lightboxTrigger =
      clickedElement.closest("[data-lightbox-open]")
      || clickedElement.closest("[data-video-lightbox-open]")
      || clickedElement.closest(".image-frame");
    if (lightboxTrigger) {
      event.preventDefault();
      openLightbox(lightboxTrigger);
      return;
    }

    if (clickedElement.closest("[data-lightbox-close]")) {
      event.preventDefault();
      closeLightbox();
    }
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox && lightbox.classList.contains("is-open")) {
      event.preventDefault();
      closeLightbox();
      return;
    }
    if (
      event.key === "Escape"
      && (
        window.location.hash === "#fkTransformModal"
        || window.location.hash === "#dikTransformModal"
        || window.location.hash === "#offlineCriticModal"
      )
    ) {
      window.history.pushState(null, "", window.location.hash === "#offlineCriticModal" ? "#training" : "#data");
    }
  });

  const railLinks = Array.from(document.querySelectorAll("[data-rail-link]"));
  const railSections = railLinks
    .map(function (link) {
      const target = document.querySelector(link.getAttribute("href"));
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  function updateSideRail() {
    if (!railSections.length) return;
    const scrollProbe = window.scrollY + Math.max(110, window.innerHeight * 0.28);
    let active = railSections[0];

    railSections.forEach(function (item) {
      if (item.target.offsetTop <= scrollProbe) {
        active = item;
      }
    });

    railSections.forEach(function (item) {
      const isActive = item === active;
      item.link.classList.toggle("is-active", isActive);
      if (isActive) {
        item.link.setAttribute("aria-current", "true");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });
  }

  let railTicking = false;
  window.addEventListener("scroll", function () {
    if (railTicking) return;
    railTicking = true;
    window.requestAnimationFrame(function () {
      updateSideRail();
      railTicking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", updateSideRail);
  updateSideRail();
})();
