# Website Coding Conventions

> **Purpose.** This document defines exactly how I write HTML, SCSS and JavaScript so that any new code matches my existing work. When generating code, follow these rules **as closely as possible** — the goal is output that looks like I wrote it myself. It is platform-agnostic: it applies to any website, regardless of framework or templating language.

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [File & Folder Naming](#2-file--folder-naming)
3. [HTML Conventions](#3-html-conventions)
4. [Class Naming](#4-class-naming)
5. [Images](#5-images)
6. [Per-Instance Styling (CSS Variables)](#6-per-instance-styling-css-variables)
7. [Slider Conventions (Swiper)](#7-slider-conventions-swiper)
8. [JavaScript Conventions](#8-javascript-conventions)
9. [SCSS Conventions](#9-scss-conventions)
10. [Design Tokens & Breakpoints](#10-design-tokens--breakpoints)
11. [Typography System](#11-typography-system)
12. [Motion & Animation](#12-motion--animation)
13. [Common UI Components](#13-common-ui-components)
14. [Accessibility](#14-accessibility)
15. [Rules of Thumb](#15-rules-of-thumb)
16. [New Component Checklist](#16-new-component-checklist)

---

## 1. Core Philosophy

- **Match, don't invent.** If a wrapper, class, mixin, token, breakpoint or pattern already exists, reuse it. Never build a parallel architecture.
- **Pragmatic over dogmatic.** No strict BEM, no framework. Predictable, readable, nested SCSS and plain ES5 JavaScript.
- **Self-contained components.** Every page section is an independent block: its own root class, its own scoped styles, its own scoped JS. Multiple copies on one page must never interfere.
- **Paste-ready output.** No TODOs, no placeholder implementations, no dead code, no explanatory noise.

---

## 2. File & Folder Naming

- Files use `kebab-case`: `custom-hero-slider.html`, `custom-recipe-slider.js`.
- Component files carry the `custom-` prefix.
- The **root CSS class** of a component is the `snake_case` version of its name, keeping the `custom_` prefix (`-` → `_`).

| File | Root class |
|---|---|
| `custom-hero-image` | `custom_hero_image` |
| `custom-hero-slider` | `custom_hero_slider` |
| `custom-recipe-slider` | `custom_recipe_slider` |
| `custom-category-slider` | `custom_category_slider` |
| `custom-contact-form` | `custom_contact_form` |
| `custom-image-with-richtext` | `custom_image_with_richtext` |
| `custom-image-with-button` | `custom_image_with_button` |

**Rule:** plain snake_case derived from the filename. No `_section` suffix.

---

## 3. HTML Conventions

Every component follows the same ordered structure:

```html
<!-- custom-<name>.html -->

<section class="custom_<name>">
  <div class="center-div">
    <div class="content-wrapper">
      <!-- content -->
    </div>
  </div>
</section>

<style>
  /* only when this instance needs its own heights/colors */
</style>

<script>
  (function () {
    /* only when the component needs JS */
  })();
</script>
```

Key points, in order:

1. **Filename comment** — the very first line is an HTML comment containing only the filename. Nothing else.
2. **Root `<section>`** always carries the `custom_<name>` class.
3. **`.center-div`** is the reusable 1200px max-width container. Use it for any section with centered, constrained content.
4. **`.content-wrapper`** is the inner layout wrapper inside `.center-div`.
5. Only include `<style>` when an instance needs its own heights/colors, and `<script>` when the component needs JS.
6. The `<script>` sits at the end of the component, after the markup. Keep placement consistent within one component.
7. Only render an element if it has content — never output an empty heading, empty button or empty image wrapper.
8. A call-to-action requires **both** text and a link; render neither if either is missing.

**Layout modifier classes** are added directly on the wrapper:

```html
<div class="content-wrapper image-right">
<div class="hero-content content-center">
```

**Repeated items** (slides, cards) are identical sibling elements, each carrying its own inline CSS variables when values differ per item (see [section 6](#6-per-instance-styling-css-variables)).

**Arrow / navigation markup** — inline SVG, repeated identically across sliders:

```html
<div class="swiper-button-prev">
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="20" cy="20" r="19.5" stroke="currentColor"/>
    <path d="M23 14L17 20L23 26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>
```

- Prev path: `M23 14L17 20L23 26`. Next path: `M17 14L23 20L17 26`.
- Always `width/height="40"`, circle `r="19.5"`, `stroke-width="1.5"`, round linecap and linejoin.
- Hero slider arrows use `stroke="currentColor"` (colored white via SCSS `color: #fff`).
- Recipe and category sliders hardcode `stroke="#001b72"`.
- Smaller 16/20px arrow SVGs use `stroke="currentColor"` and sit in `span.btn-arrow`.

---

## 4. Class Naming

There is no strict BEM — the style is pragmatic, with a few coexisting but predictable patterns:

| Purpose | Convention | Examples |
|---|---|---|
| Section root | `snake_case` | `custom_hero_slider`, `custom_category_slider` |
| Swiper wrappers | `snake_case` ending in `_swiper` | `hero_swiper`, `recipe_swiper`, `category_swiper` |
| Content / sub-elements | `kebab-case` | `hero-media`, `hero-content`, `card-title`, `glass-panel`, `section-heading` |
| Modifiers | suffix `-<modifier>` (single dash) | `content-left`, `content-center`, `content-right`, `button-primary`, `button-secondary`, `image-right` |
| BEM-style variants | suffix `--<variant>` (double dash) | `hero-image--desktop`, `hero-image--mobile` |
| State classes | `has-<state>` / `is-<state>` | `has-mobile-image`, `is-active`, `in-view` |

**Shared structural classes** (defined once globally, reused by every component):

- `center-div` — 1200px container
- `content-wrapper` — inner wrapper
- `section-header`, `section-heading`, `section-subheading`, `eyebrow`, `description`

**Swiper's own classes** are used untouched: `.swiper`, `.swiper-wrapper`, `.swiper-slide`, `.swiper-pagination`, `.swiper-pagination-bullet`, `.swiper-button-prev`, `.swiper-button-next`.

---

## 5. Images

Every content image is a responsive `<img>` with `srcset` and a meaningful `sizes` attribute, always with a class matching the SCSS.

```html
<img
  src="image-1200.jpg"
  srcset="image-600.jpg 600w, image-1200.jpg 1200w, image-2200.jpg 2200w"
  sizes="100vw"
  class="hero-image hero-image--desktop"
  alt="..."
  style="width: 100%; height: auto;"
>
```

**Rules:**

1. **Always** provide `srcset`, `sizes` and a class together. `sizes` must reflect the real rendered width.
2. Default `max` source width is 2200px.
3. Images carry an inline `width: 100%; height: auto;`, which is why SCSS sometimes overrides with `width` / `height` + `!important` (cover images, contained product shots).
4. Wrap the image in a condition — never render an `<img>` without a source.
5. Use descriptive `alt` text; decorative images get `alt=""`.
6. Desktop/mobile art direction uses two classes on two images (`hero-image--desktop` / `hero-image--mobile`) toggled via a media query, with a `has-mobile-image` state class on the parent.

**`sizes` conventions:**

| Usage | `sizes` value |
|---|---|
| Full-width hero | `100vw` |
| Recipe card (3-up grid) | `(max-width: 768px) 85vw, 30vw` |
| Category card (3-up grid) | `(max-width: 768px) 60vw, 25vw` |
| Image + text (45/55 split) | `(max-width: 900px) 90vw, 45vw` |

Follow the pattern: mobile width first, then the grid fraction. Tune the fractions to the layout.

---

## 6. Per-Instance Styling (CSS Variables)

All per-instance or per-item colors/sizes are passed through **CSS custom properties** and consumed in the SCSS. Two patterns:

**Pattern A — scoped `<style>` block (component-level overrides):**

Used for heights and component-level colors. The selector always targets the component's root class plus its unique instance hook.

```html
<style>
  section.custom_hero_image.hero-1 {
    height: 650px;
    --hero-text-color: #FFFFFF;
    --hero-overlay-color: #000000;
    --hero-overlay-opacity: 0.3;
  }

  @media screen and (max-width: 768px) {
    section.custom_hero_image.hero-1 {
      height: 450px;
    }
  }
</style>
```

**Pattern B — inline `style` attribute (per-item values):**

Used when the value changes per item (slide colors, card accents, font sizes).

```html
<div class="swiper-slide" style="--hero-text-color: #ffffff; --hero-overlay-color: #000000; --hero-overlay-opacity: 0.4;">
<a href="/recipe" class="recipe-card" style="--recipe-accent: #ffffff;" aria-label="Recipe title">
<div class="content_block" style="--block-font-size: 24px; --block-font-size-res: 20px;">
```

**Rules:**

- Overlay opacity is authored as a whole number (0–80) and converted to a decimal (0.0–0.8) before it is set as a variable.
- Provide fallbacks: text color defaults to `#FFFFFF`, overlay color to `#000000`, card accent to `#ffffff`.
- Variable names are kebab-case and prefixed by the component's concept.

| Variable | Used by |
|---|---|
| `--hero-text-color` | `.hero-content` color |
| `--hero-overlay-color` | `.hero-overlay` background |
| `--hero-overlay-opacity` | `.hero-overlay` opacity |
| `--recipe-accent` | recipe panel text colors |
| `--block-font-size` / `--block-font-size-res` | `.content_block` font-size (desktop / ≤600px) |

**Typical value ranges:**

| Value | min | max | step | default |
|---|---|---|---|---|
| overlay opacity (%) | 0 | 80 | 5 | 0 |
| desktop height (px) | 400 | 900 | 25 | 650 |
| mobile height (px) | 300 | 700 | 25 | 450 |
| autoplay delay (s) | 3 | 10 | 1 | 5 |
| transition speed (ms) | 300 | 1000 | 100 | 500 |
| font size / font size res (px) | 10 | 100 | 2 | 24 / 20 |

---

## 7. Slider Conventions (Swiper)

Swiper is the slideshow library of choice. Every slider follows the same skeleton.

**HTML:**

```html
<div class="<name>_swiper swiper">
  <div class="swiper-wrapper">
    <div class="swiper-slide">...</div>
    <div class="swiper-slide">...</div>
  </div>

  <!-- only when there is more than one slide -->
  <div class="swiper-navigation">
    <div class="swiper-button-prev">...</div>
    <div class="swiper-button-next">...</div>
  </div>
  <div class="swiper-pagination"></div>
</div>
```

**Init config** (always `new Swiper(swiperEl, {...})`):

Hero slider (full-screen, single slide):

```js
new Swiper(swiperEl, {
  slidesPerView: 1,
  spaceBetween: 0,
  loop: true,
  effect: 'fade',
  speed: 500,
  autoplay: {                                  // only when enabled
    delay: 5000,
    disableOnInteraction: false,
  },
  fadeEffect: { crossFade: true },             // only when effect === 'fade'
  navigation: {
    nextEl: section.querySelector('.swiper-button-next'),
    prevEl: section.querySelector('.swiper-button-prev'),
  },
  pagination: { el: section.querySelector('.swiper-pagination'), clickable: true },
});
```

Recipe slider (responsive multi-column):

```js
slidesPerView: 1.2,
spaceBetween: 16,
loop: enableLoop,                              // var enableLoop = slideCount > 3;
breakpoints: {
  768:  { slidesPerView: 2.2, spaceBetween: 20 },
  1024: { slidesPerView: 3,   spaceBetween: 24 }
}
```

Category slider (mobile peek / desktop 3-up):

```js
slidesPerView: 3,
spaceBetween: 30,
loop: true,
breakpoints: {
  0:    { slidesPerView: 1.5, spaceBetween: 16, centeredSlides: true },
  768:  { slidesPerView: 3, spaceBetween: 30, centeredSlides: false }
}
```

**Rules:**

- `loop: true` only when slides > 1 (hero) or slides > 3 (recipe).
- Navigation and pagination markup is only rendered when there is more than one slide.
- Extra behaviors (like recipe card tap-to-expand on touch) are added after `new Swiper(...)` inside the same IIFE.

---

## 8. JavaScript Conventions

- **IIFE-wrapped** (`(function () { ... })();`) — no globals leaked, component-scoped.
- **ES5-friendly style** — `var`, `function`, no arrow functions, no template literals, no `const`/`let`.
- **No jQuery**, no helper libraries beyond Swiper.
- **Query the exact instance first**, then scope every later query through it:

```js
(function () {
  var section = document.querySelector('section.custom_recipe_slider');
  if (!section) return;

  var swiperEl = section.querySelector('.recipe_swiper');
  if (!swiperEl) return;
  if (typeof Swiper === 'undefined') return;

  new Swiper(swiperEl, { /* ... */ });
})();
```

- **Guard clauses** at the top: `if (!section) return;`, `if (!swiperEl) return;`, `if (typeof Swiper === 'undefined') return;`.
- **Local `var`s only**, named for what they hold: `var swiperEl = section.querySelector('.recipe_swiper');`.
- **Support multiple instances of the same component.** Never target `.custom_x` globally and act on the first match — always resolve the specific root element and scope every `querySelector` through it. When a page can hold several copies, loop over `document.querySelectorAll('section.custom_x')` and run the same scoped logic per root.
- **Touch devices** — detect with `window.matchMedia('(hover: none)')` and only then attach tap-specific behavior (e.g. recipe cards): add/remove `.is-active`, close on outside click with `document.addEventListener('click', ...)` + `e.target.closest(...)`.
- **State is expressed as classes** (`is-active`, `in-view`), never inline styles set from JS.

**Scroll-reveal observer** — adds `.in-view` to a component the first time it intersects, then stops observing:

```js
(function () {
  var section = document.querySelector('section.custom_image_with_richtext');
  if (!section) return;
  if (!('IntersectionObserver' in window)) {
    section.classList.add('in-view');
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  observer.observe(section);
})();
```

---

## 9. SCSS Conventions

All styling is **pure SCSS**. Never write compiled/flattened CSS.

**File organization:**

- Top of file: `@font-face` blocks, then `:root` variables, then mixins + keyframes, then global styles, then each component's styles.
- Every component is introduced with a banner comment: `/* Custom Hero Image */`, `/* Custom Recipe Slider */`, etc.
- Component order: Hero Image → Hero Slider → Image with Richtext → Category Slider → Recipe Slider → Contact Form → Image with Button.

**Nesting is the core style.** Deep, logical nesting. Never flatten.

```scss
section.custom_recipe_slider {
  padding: 80px 0;

  @media screen and (max-width: 768px) {
    padding: 40px 0;
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: 35% 1fr;
    gap: 40px;
    align-items: center;

    @media screen and (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }

  .text-content {
    .cta-button {
      &:hover {
        background: var(--primary_text_color);
        color: #ffffff;
      }
    }
  }
}
```

**Selector scoping:** every component's styles are scoped under `section.custom_<name>`. Load animations use `body.animations-true section.custom_<name> ...` (see [Motion](#12-motion--animation)).

**Modifiers & pseudo-elements** use `&`:

```scss
&.has-mobile-image { ... }
&:hover { ... }
&::before { ... }
```

**Media queries are nested** inside the rule, written as `@media screen and (max-width: <px>)` — always `screen and`, always `max-width`. Never a `@mixin` for breakpoints. Each element keeps its own `@media` block when needed.

**`!important` usage:** rare and deliberate — only to override an image's inline `width: 100%; height: auto;` and third-party (Swiper) styles. Examples: `height: 100% !important` (cover images), `max-width: 80% !important` / `width: auto !important` (category bottle image).

**Spacing conventions:**

- Section vertical padding: `80px 0`, dropping to `40px 0` at ≤768px. (Image-with components use `50px 0`.)
- Headings within a header block: `margin: 0`.
- Grid gaps typically `40px` (or `20–25px` inside text stacks).

**Typography** always goes through the font variables (see [Typography System](#11-typography-system)).

**Cover imagery:**

```scss
.position-absolute-inset-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100% !important;
  object-fit: cover;
}
```

**Pagination bullets:**

```scss
.swiper-pagination-bullet {
  width: 8px;
  height: 8px;
  background: var(--primary_text_color);
  opacity: 0.2;
  transition: opacity 0.3s ease, transform 0.3s ease;

  &.swiper-pagination-bullet-active {
    opacity: 1;
    transform: scale(1.2);
  }
}
```

**Swiper buttons:** strip default icons with `&::after { display: none; }`, then size the `img, svg` inside.

**Reduced motion:** any component with heavy animation includes a `@media (prefers-reduced-motion: reduce)` block that sets `transition: none !important; animation: none !important;` on all animated selectors and resets hover transforms.

**Keyframes** are defined at top level near the mixins, or near the component that uses them (e.g. `fadeUpOnLoad`, `fadeUpDivider`, `lineExpand`).

---

## 10. Design Tokens & Breakpoints

**CSS variables (`:root`):**

```scss
:root {
  --primary_color: #001b72;
  --primary_text_color: #001b72;
  --secondary_text_color: #151515;
  --custom_b: #252E69;

  --primary_font: "Signika";
  --secondary_font: "Nunito";
}
```

Always reference these variables; don't hardcode colors. The only accepted hardcoded values are `#fff` / `#ffffff` (text on filled buttons, nav hover strokes) and the `#001b72` arrow stroke in slider SVG markup. Prefer `var(--custom_b)` over hardcoding `#252E69`.

Custom `@font-face` fonts are declared at the top of the SCSS: `Last-Shuriken`, `Clafoutis`, `Clafoutis-thin`, `Avenir` (loaded from CDN URLs). They are reserved for brand type; the working font tokens are the two variables above.

**Breakpoints (nested media queries):**

| Breakpoint | Used for |
|---|---|
| `1200px` | `.center-div` max-width → `95%` |
| `1024px` | Recipe grid stacks to 1 column; recipe nav hidden |
| `900px` | Image + text layouts stack; image/text wrappers go full width |
| `768px` | **Primary mobile breakpoint** — section padding, font scales, hero image swap, nav/pagination adjustments |
| `600px` | Block content font-size swap (`--block-font-size-res`) |

**Buttons / CTA pattern** (`cta-button`, `section-button`):

```scss
display: inline-flex;
align-items: center;
gap: 10px;
padding: 14px 28px;
border-radius: 9999px;
border: 1px solid var(--primary_text_color);
background: transparent;               /* secondary */
background: var(--primary_text_color); /* primary */
color: var(--primary_text_color);      /* secondary; primary uses #fff */
font-family: var(--secondary_font);
font-size: 15px;
letter-spacing: 1px;
text-transform: uppercase;
transition: background-color .35s cubic-bezier(.23,1,.32,1), color .35s cubic-bezier(.23,1,.32,1), transform .35s cubic-bezier(.23,1,.32,1), box-shadow .35s cubic-bezier(.23,1,.32,1);
```

Hover: `transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,27,114,.12);` and `.btn-arrow` does `translateX(4px)`.

**Easing token** used for all interactive transitions: `cubic-bezier(0.23, 1, 0.32, 1)`.

---

## 11. Typography System

| Element | font-family | size | line-height | extras |
|---|---|---|---|---|
| Hero heading / section headings | `var(--primary_font)` | 56px (≤768px → 36px) | 1.2–1.3 | `text-transform: uppercase; letter-spacing: 2px` (hero), `1px` mobile |
| `section-heading` (category/contact) | `var(--primary_font)` | 48px (mobile 36px) | 1.3 | `margin: 0` |
| `section-heading` (recipe) | `var(--primary_font)` | 56px (mobile 40px) | 1.15 | `margin: 0` |
| Hero subheading | `var(--secondary_font)` | 20px (mobile 16px) | 1.6 | `text-transform: uppercase; letter-spacing: 1px` |
| `eyebrow` | `var(--secondary_font)` | 14px | — | `text-transform: uppercase; letter-spacing: 2px; opacity: 0.6` |
| `.description` | `var(--secondary_font)` | 18px | 1.6 | `opacity: 0.8` |
| Labels / inputs / buttons | `var(--secondary_font)` | 15–16px | — | buttons `uppercase; letter-spacing: 1px` |
| Card title | `var(--primary_font)` | 24px | 1.3 | color via `var(--recipe-accent)` |
| Card category / meta | `var(--secondary_font)` | 13px | — | `uppercase; letter-spacing: 1.5px` |
| Decorators | — | — | — | `.hero-divider` is a 100%-width rotated 45° border line; `decorative-line` animates width (`lineExpand`) |

Reset paragraph margins inside heading/description wrappers: `.section-heading p { margin: 0; }`.

---

## 12. Motion & Animation

**The `animations-true` gate.** Load animations only fire when the `animations-true` class is present on `<body>`:

```scss
body.animations-true section.custom_hero_slider .hero_swiper .swiper-slide-active .hero-content {
  .hero-heading { @include fade-up($delay: 0.1s); }
  .hero-subheading { @include fade-up($delay: 0.45s); }
}
```

**The `.in-view` scroll trigger.** `@include fade-up` keyframes fire once, immediately — they are not scroll-linked. For any section that isn't always above the fold (everything except the hero slider, whose animation re-triggers per active slide instead), gate the reveal on `.in-view` so it plays when the section actually scrolls into the viewport:

```scss
body.animations-true section.custom_image_with_richtext.in-view .content-wrapper {
  .image-wrapper { @include fade-up($delay: 0.1s); }
}
```

The `.in-view` class is added by the IntersectionObserver snippet in [JavaScript Conventions](#8-javascript-conventions). Place it where the component's `<script>` normally goes.

**Mixins:**

```scss
@mixin fade-up($delay: 0s, $duration: 0.8s, $distance: 30px) {
  opacity: 0;
  transform: translateY($distance);
  animation: fadeUpOnLoad $duration ease forwards;
  animation-delay: $delay;
}
```

Use staggered delays (0.1s, 0.3s / 0.45s, 0.35s for forms; `&:nth-child(n)` overrides for content stacks).

**Border-retract effect** (the `.line-v` animated border on category titles and the contact submit button):

```scss
@include border-retract(
  $color: var(--primary_text_color),
  $opacity: 0.4,
  $transition: 0.5s ease
);
// toggled on hover:
@include border-retract-active($opacity: 0.4);
```

Markup requirement: the element needs `.line-v left` and `.line-v right` child `<span>`s for the vertical lines to appear:

```html
<span class="category-title">
  Title
  <span class="line-v left"></span>
  <span class="line-v right"></span>
</span>
```

The contact form's `.submit-btn` re-implements this same effect manually (horizontal border retracts, both `.line-v` corners extend on hover).

**Keyframes in use:** `fadeUpOnLoad`, `fadeUpDivider` (hero divider: translateY(30px) → 0), `lineExpand` (decorative-line width 40% → 100% → 40% loop), `borderConverge`.

**Hover motion** (recipe cards): `.card-image` does `scale(1.04) translateY(-10px)`; the glass panel expands `min-height` 80px → 160px; `.panel-expanded` goes `max-height: 0 → 120px`, `opacity 0 → 1`, `translateY(8px → 0)`. A `@media (hover: none)` block disables the hover expansion and relies on `.is-active` (set by JS).

---

## 13. Common UI Components

Keep these visually consistent when reused:

- **Arrow SVG buttons** — see [HTML Conventions](#3-html-conventions). Always 40px, circle r=19.5, stroke-width 1.5, round caps and joins. Recipe uses 44px buttons with a 20px inner SVG.
- **Glass panel** (recipe card) — `backdrop-filter: blur(12px)` with `-webkit-` prefix, translucent `rgba(255,255,255,.08)` `::before` layer, 1px top hairline `rgba(255,255,255,.12)` via `::after`.
- **Category card** — circular `product-image-circle` (70% wide, `aspect-ratio: 1`, `border-radius: 50%`) behind a `category-image` (`max-height: 120%`, `max-width: 80%`, `object-fit: contain`), hover `scale(1.08)`.
- **Form** — labeled `form-group`s, 100%-width inputs with `border: 1px solid var(--primary_text_color)`, `border-radius: 8px`, `background: transparent`, focus swaps border to `var(--primary_color)`, `&::placeholder { opacity: 0.5 }`. Select uses `appearance: none` with an inline data-URI chevron. Submit is a pill (`border-radius: 30px`) filled with `var(--primary_text_color)`.

---

## 14. Accessibility

- Decorative SVGs get `aria-hidden="true"` (arrow SVGs inside button text).
- Arrow `<img>` overrides carry `alt="Previous"` / `alt="Next"`.
- Slider nav buttons: `aria-label="Previous slide"` / `"Next slide"`, `role="button"`, `tabindex="0"`.
- Forms: real `<label for>`, `required`, `autocomplete` attributes, `aria-invalid="true"` on errors, status blocks with `role="status"` / `role="alert"`, `autofocus`, `tabindex="-1"`, `aria-live="polite"`.
- Card links take their `aria-label` from the card title.
- External links: `target="_blank" rel="noopener"`.
- Always respect `prefers-reduced-motion` (see [SCSS Conventions](#9-scss-conventions)).

---

## 15. Rules of Thumb

1. **Match, don't invent.** Reuse existing wrappers, classes, mixins, tokens, breakpoints.
2. **Don't hardcode what varies.** Anything that differs per instance (colors, heights, font sizes) goes through CSS custom properties with a sensible default.
3. **Keep JS instance-safe.** Multiple copies of a component must work; scope everything through the component's root element.
4. **Nested SCSS only.** No flattened compiled CSS. Deep nesting where it makes sense.
5. **Use existing tokens.** Font variables, color variables, the `cubic-bezier(.23,1,.32,1)` easing, the established breakpoints.
6. **No dead code, no TODOs, no placeholder implementations.** Generated code must be paste-ready.
7. **Comments are sparse.** A filename header comment in each component file; a banner comment before each SCSS component block. Nothing else unless asked.
8. **Sensible defaults everywhere** — colors default to `#FFFFFF` / `#000000`, opacity `0`, heights 650 / 450.
9. **Design references are inspiration, not pixel-perfect clones** — adapt them to this architecture.
10. **No new dependencies.** Swiper is the only library. No jQuery, no utility frameworks.

---

## 16. New Component Checklist

Validate any new or customized component against this before finishing:

- [ ] File named `custom-<kebab-name>`, top comment is just the filename.
- [ ] Root: `<section class="custom_<name>">`.
- [ ] Content wrapped where appropriate: `.center-div` → `.content-wrapper`.
- [ ] No empty elements rendered; CTAs only when both text and link exist.
- [ ] All images use `srcset` + a real `sizes` value + a matching class + `alt`.
- [ ] Per-instance values → CSS custom properties (scoped `<style>` or inline `style`), with fallbacks.
- [ ] Slider: `<name>_swiper swiper` markup, `swiper-wrapper` / `swiper-slide` children, nav/pagination only when there is more than one slide.
- [ ] JS: IIFE, ES5, root `querySelector`, guard clauses, scoped queries, no globals, touch handling if interactive.
- [ ] SCSS added under `section.custom_<name>` with a banner comment, deeply nested, mobile overrides at ≤768px (section padding `80px 0` → `40px 0`).
- [ ] Typography uses `var(--primary_font)` / `var(--secondary_font)`; colors use `var(--primary_text_color)` etc.
- [ ] Load animations gated behind `body.animations-true` using `@include fade-up(...)` with staggered delays; `.in-view` gate for below-the-fold sections.
- [ ] `prefers-reduced-motion` handled if the component animates heavily.
- [ ] Accessibility: labels, `aria-*`, `alt`, `rel="noopener"` where applicable.
- [ ] No TODOs, no placeholder markup, no dead code.
