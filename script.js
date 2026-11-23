(() => {
  const mediaRoot = document.querySelector(".stage-media");
  const video = document.querySelector(".stage-video");
  if (!mediaRoot || !video) return;

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let hasFailed = false;

  const showPosterOnly = () => {
    video.classList.remove("is-ready");
    mediaRoot.dataset.mediaState = "poster";
    if (!video.paused) {
      video.pause();
    }
  };

  const revealVideo = () => {
    if (hasFailed || reducedMotionQuery.matches) return;
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused) {
      video.classList.add("is-ready");
      mediaRoot.dataset.mediaState = "playing";
    }
  };

  const attemptPlayback = () => {
    if (hasFailed || reducedMotionQuery.matches) {
      showPosterOnly();
      return;
    }

    video.muted = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          revealVideo();
        })
        .catch(() => {
          showPosterOnly();
        });
    } else {
      revealVideo();
    }
  };

  const handleFailure = () => {
    hasFailed = true;
    showPosterOnly();
  };

  video.addEventListener("playing", revealVideo);
  video.addEventListener("error", handleFailure);

  const source = video.querySelector("source");
  if (source) {
    source.addEventListener("error", handleFailure);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (!hasFailed && !reducedMotionQuery.matches && video.paused) {
      attemptPlayback();
    }
  });

  const onReducedMotionChange = () => {
    if (reducedMotionQuery.matches) {
      showPosterOnly();
    } else if (!hasFailed) {
      if (video.readyState === HTMLMediaElement.HAVE_NOTHING) {
        video.load();
      }
      attemptPlayback();
    }
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(onReducedMotionChange);
  }

  if (reducedMotionQuery.matches) {
    showPosterOnly();
  } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused) {
    revealVideo();
  } else {
    attemptPlayback();
  }
})();
