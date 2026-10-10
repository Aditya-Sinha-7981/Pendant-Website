(function () {
  var root = document.documentElement;
  var config = window.PENDANT_CONFIG;
  var sections = document.querySelectorAll('section.custom_pendant_scene');
  if (!sections.length) return;

  // Shopify hook: replace this body with a POST to /cart/add.js for the product's variant.
  // It must return a Promise; the button shows its "Added" state once it resolves.
  function onAddToCart(product) {
    return Promise.resolve(product);
  }

  function resolve(path) {
    return path.split('.').reduce(function (value, key) {
      return value && value[key] !== undefined ? value[key] : undefined;
    }, config);
  }

  function cssNumber(element, name, fallback) {
    var value = parseFloat(window.getComputedStyle(element).getPropertyValue(name));
    return isNaN(value) ? fallback : value;
  }

  function populate(section) {
    var product = config.product || {};
    var pendantWindow = product.pendantWindow;

    section.querySelectorAll('[data-config]').forEach(function (element) {
      var value = resolve(element.getAttribute('data-config'));
      if (typeof value !== 'string') return;
      element.textContent = value;
      element.hidden = value === '';
    });

    section.querySelectorAll('[data-config-list]').forEach(function (list) {
      var items = resolve(list.getAttribute('data-config-list'));
      if (!Array.isArray(items)) return;
      list.textContent = '';
      items.forEach(function (text) {
        var item = document.createElement('li');
        item.textContent = text;
        list.appendChild(item);
      });
      list.hidden = items.length === 0;
    });

    section.querySelectorAll('[data-config-src]').forEach(function (element) {
      var value = resolve(element.getAttribute('data-config-src'));
      if (value && element.getAttribute('src') !== value) element.setAttribute('src', value);
    });

    section.querySelectorAll('[data-config-alt]').forEach(function (element) {
      var value = resolve(element.getAttribute('data-config-alt'));
      if (typeof value === 'string') element.setAttribute('alt', value);
    });

    section.querySelectorAll('.js-add-to-cart').forEach(function (button) {
      if (product.title) button.setAttribute('aria-label', (product.ctaLabel || 'Add to cart') + ': ' + product.title);
    });

    if (pendantWindow) {
      section.style.setProperty('--pw-x', pendantWindow.x);
      section.style.setProperty('--pw-y', pendantWindow.y);
      section.style.setProperty('--pw-size', pendantWindow.size);
    }

    if (product.title) document.title = product.title;
  }

  function injectLandmark(section) {
    var place = (config && config.location) || {};
    var markup = window.PENDANT_LANDMARKS && window.PENDANT_LANDMARKS[place.landmark];
    var figure = section.querySelector('.landmark');
    var still = section.querySelector('.still-landmark');
    if (!markup || !figure || !window.DOMParser) return;

    var svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== 'svg') return;

    svg.querySelectorAll('script, foreignObject').forEach(function (node) {
      node.parentNode.removeChild(node);
    });

    var viewBox = (svg.getAttribute('viewBox') || '').split(/[\s,]+/);
    if (viewBox.length === 4 && parseFloat(viewBox[3]) > 0) {
      section.style.setProperty('--lm-ratio', (parseFloat(viewBox[2]) / parseFloat(viewBox[3])).toFixed(4));
    }

    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('class', 'landmark-svg');
    svg.setAttribute('focusable', 'false');

    var copy = document.importNode(svg, true);
    copy.setAttribute('role', 'img');
    copy.setAttribute('aria-label', place.landmarkAlt || place.name || '');
    figure.appendChild(copy);

    if (!still) return;
    var stillCopy = document.importNode(svg, true);
    stillCopy.setAttribute('aria-hidden', 'true');
    stillCopy.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    still.appendChild(stillCopy);
  }

  function bindCart(section) {
    var status = section.querySelector('.cart-status');
    var product = (config && config.product) || {};

    section.querySelectorAll('.js-add-to-cart').forEach(function (button) {
      var label = button.querySelector('.cta-label');
      var timer;

      button.addEventListener('click', function () {
        if (button.classList.contains('is-added')) return;

        onAddToCart(product).then(function () {
          var original = label.textContent;
          button.classList.add('is-added');
          label.textContent = product.ctaAddedLabel || 'Added';
          if (status) status.textContent = (product.title || 'Item') + ' added to cart';

          window.clearTimeout(timer);
          timer = window.setTimeout(function () {
            button.classList.remove('is-added');
            label.textContent = original;
            if (status) status.textContent = '';
          }, 1800);
        });
      });
    });
  }

  function buildTimeline(section, isDesktop) {
    var stage = section.querySelector('.scene-stage');
    var group = section.querySelector('.pendant-group');
    var windowEl = section.querySelector('.scene-window');
    var picture = section.querySelector('.window-picture');
    var landmark = section.querySelector('.landmark');
    var haze = section.querySelector('.window-haze');
    var dim = section.querySelector('.scene-dim');
    var chain = section.querySelector('.pendant-chain');
    var frame = section.querySelector('.pendant-frame');
    var image = section.querySelector('.pendant-image');
    var details = section.querySelector('.scene-details');
    var detailItems = section.querySelectorAll('.detail-item');
    var nudge = section.querySelector('.scroll-nudge');
    var skyFar = section.querySelectorAll('.sky-far');
    var skyNear = section.querySelectorAll('.sky-near');

    function landmarkScale() {
      var size = picture.offsetWidth;
      return Math.min(0.8 * size / landmark.offsetHeight, 0.86 * size / landmark.offsetWidth);
    }

    function landmarkShift() {
      var size = picture.offsetWidth;
      var baseline = picture.offsetTop + size * 1.02;
      return baseline - landmark.offsetHeight * landmarkScale() / 2 - landmark.offsetTop;
    }

    function groupShiftX() {
      return (cssNumber(section, '--d-pendant-x', 0.25) - 0.5) * stage.clientWidth;
    }

    function groupScale() {
      return cssNumber(section, '--m-pendant-scale', 0.7);
    }

    function groupShiftY() {
      var height = stage.clientHeight;
      var scale = groupScale();
      var squareCenter = picture.offsetTop + picture.offsetWidth / 2;
      var target = cssNumber(section, '--m-pendant-y', 0.21) * height;
      return target - (height / 2 + (squareCenter - height / 2) * scale);
    }

    gsap.set(landmark, { xPercent: -50, yPercent: -50, x: 0, y: 0 });

    var timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          section.classList.toggle('is-revealed', self.progress > 0.9);
        }
      }
    });

    timeline
      .to({}, { duration: 1 }, 0)
      .to(nudge, { autoAlpha: 0, duration: 0.03 }, 0)

      .to(landmark, { scale: landmarkScale, y: landmarkShift, duration: 0.44, ease: 'power1.inOut' }, 0.08)
      .to(skyFar, { yPercent: -2.5, duration: 0.5 }, 0.08)
      .to(skyNear, { yPercent: -7, duration: 0.5 }, 0.08)
      .to(haze, { opacity: 0.6, duration: 0.32 }, 0.08)

      .to(windowEl, { '--clip': 1, duration: 0.12, ease: 'power2.inOut' }, 0.4)
      .to(haze, { opacity: 0, duration: 0.06 }, 0.4)
      .to(dim, { opacity: 1, duration: 0.1 }, 0.46)
      .to(picture, { opacity: 1, duration: 0.08 }, 0.44)
      .fromTo(frame, { opacity: 0, scale: 1.14 }, { opacity: 1, scale: 1, duration: 0.09, ease: 'power2.out' }, 0.44)
      .fromTo(chain, { opacity: 0, yPercent: -6 }, { opacity: 1, yPercent: 0, duration: 0.08, ease: 'power2.out' }, 0.46)
      .to(image, { opacity: 1, duration: 0.05 }, 0.53)
      .to([frame, chain], { opacity: 0, duration: 0.02 }, 0.56);

    if (isDesktop) {
      timeline
        .to(group, { x: groupShiftX, duration: 0.2, ease: 'power2.inOut' }, 0.6)
        .to(details, { autoAlpha: 1, duration: 0.01 }, 0.66)
        .fromTo(detailItems, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.1, stagger: 0.02, ease: 'power2.out' }, 0.66);
    } else {
      timeline
        .to(group, { scale: groupScale, y: groupShiftY, duration: 0.2, ease: 'power2.inOut' }, 0.6)
        .fromTo(details, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.68)
        .fromTo(detailItems, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.08, stagger: 0.015, ease: 'power2.out' }, 0.7);
    }

    return function () {
      section.classList.remove('is-revealed');
    };
  }

  function startSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  function watchResize() {
    var timer;
    var lastWidth = window.innerWidth;

    function schedule(force) {
      if (!force && window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        ScrollTrigger.refresh();
      }, 200);
    }

    window.addEventListener('resize', function () {
      schedule(false);
    });
    window.addEventListener('orientationchange', function () {
      schedule(true);
    });
  }

  sections.forEach(function (section) {
    if (config) populate(section);
    bindCart(section);
    injectLandmark(section);
  });

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    root.classList.remove('is-animated');
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    var media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: reduce)', function () {
      root.classList.remove('is-animated');
      return function () {
        root.classList.add('is-animated');
      };
    });

    sections.forEach(function (section) {
      media.add({
        desktop: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 899px) and (prefers-reduced-motion: no-preference)'
      }, function (context) {
        return buildTimeline(section, context.conditions.desktop);
      });
    });

    startSmoothScroll();
    watchResize();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    }
  } catch (error) {
    root.classList.remove('is-animated');
    if (window.console) console.error(error);
  }
})();
