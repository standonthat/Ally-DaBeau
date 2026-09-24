// Background music toggle
// Remembers the visitor's on/off choice across pages via localStorage.
// Browsers block audio-with-sound from autoplaying until the visitor
// interacts with the page, so we only ever start playback from a click.

(function () {
  const STORAGE_KEY = 'sot-music-on';

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    if (!btn || !audio) return;

    audio.volume = 0.5;
    audio.loop = true;

    function setPlayingState(isPlaying) {
      btn.classList.toggle('is-playing', isPlaying);
      btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        isPlaying ? 'Pause background music' : 'Play background music'
      );
    }

    function play() {
      audio
        .play()
        .then(function () {
          setPlayingState(true);
          localStorage.setItem(STORAGE_KEY, '1');
        })
        .catch(function () {
          setPlayingState(false);
        });
    }

    function pause() {
      audio.pause();
      setPlayingState(false);
      localStorage.setItem(STORAGE_KEY, '0');
    }

    btn.addEventListener('click', function () {
      if (audio.paused) {
        play();
      } else {
        pause();
      }
    });

    if (localStorage.getItem(STORAGE_KEY) === '1') {
      play();
    }
  });
})();
