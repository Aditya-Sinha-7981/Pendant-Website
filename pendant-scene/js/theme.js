(function () {
  var root = document.documentElement;
  var config = window.PENDANT_CONFIG;
  var storageKey = 'pendant-theme';
  var schemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function kebab(key) {
    return key.replace(/[A-Z]/g, function (match) {
      return '-' + match.toLowerCase();
    });
  }

  function readStored() {
    try {
      var value = window.localStorage.getItem(storageKey);
      return value === 'day' || value === 'night' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeStored(value) {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch (error) {}
  }

  function systemTheme() {
    return schemeQuery.matches ? 'night' : 'day';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var toggle = document.querySelector('.theme-toggle');
    if (toggle) toggle.setAttribute('aria-pressed', theme === 'night' ? 'true' : 'false');
  }

  function seededRandom(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function fillStars(container, count, seed, twinkleShare) {
    var random = seededRandom(seed);
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var star = document.createElement('span');
      var size = 0.6 + Math.pow(random(), 3) * 2.2;
      star.className = random() < twinkleShare ? 'star is-twinkling' : 'star';
      star.style.cssText =
        '--x: ' + (random() * 100).toFixed(2) + '%;' +
        '--y: ' + (Math.pow(random(), 1.35) * 88).toFixed(2) + '%;' +
        '--s: ' + size.toFixed(2) + 'px;' +
        '--o: ' + (0.35 + random() * 0.65).toFixed(2) + ';' +
        '--t: ' + (2.4 + random() * 4).toFixed(2) + 's;' +
        '--d: ' + (random() * -6).toFixed(2) + 's;';
      fragment.appendChild(star);
    }

    container.appendChild(fragment);
  }

  function fillClouds(container, count, seed) {
    var random = seededRandom(seed);
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var cloud = document.createElement('span');
      cloud.className = 'cloud';
      cloud.style.cssText =
        '--x: ' + ((i / count) * 100 - 8 + random() * 12).toFixed(2) + '%;' +
        '--y: ' + (6 + random() * 38).toFixed(2) + '%;' +
        '--w: ' + (18 + random() * 22).toFixed(2) + 'vmax;' +
        '--o: ' + (0.55 + random() * 0.4).toFixed(2) + ';' +
        '--dx: ' + (4 + random() * 6).toFixed(2) + 'vw;' +
        '--t: ' + (40 + random() * 50).toFixed(2) + 's;' +
        '--d: ' + (random() * -40).toFixed(2) + 's;';
      fragment.appendChild(cloud);
    }

    container.appendChild(fragment);
  }

  root.classList.remove('no-js');
  root.classList.add('js');
  if (!motionQuery.matches) root.classList.add('is-animated');

  if (config && config.palette) {
    ['night', 'day'].forEach(function (theme) {
      var colors = config.palette[theme] || {};
      Object.keys(colors).forEach(function (key) {
        root.style.setProperty('--' + theme + '-' + kebab(key), colors[key]);
      });
    });
  }

  applyTheme(readStored() || systemTheme());

  schemeQuery.addEventListener('change', function () {
    if (!readStored()) applyTheme(systemTheme());
  });

  document.addEventListener('DOMContentLoaded', function () {
    var compact = window.matchMedia('(max-width: 899px)').matches;
    var toggle = document.querySelector('.theme-toggle');

    document.querySelectorAll('.sky-stars').forEach(function (container) {
      fillStars(container, compact ? 70 : 170, 7, 0.45);
    });

    document.querySelectorAll('.picture-stars').forEach(function (container) {
      fillStars(container, compact ? 14 : 22, 19, 0);
    });

    document.querySelectorAll('.sky-clouds').forEach(function (container) {
      fillClouds(container, compact ? 3 : 5, 11);
    });

    if (!toggle) return;
    applyTheme(root.getAttribute('data-theme'));

    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'night' ? 'day' : 'night';
      applyTheme(next);
      writeStored(next);
    });
  });
})();
