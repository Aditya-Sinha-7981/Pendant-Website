# Memory Pendants: scroll-driven product pages

One static product page per place. On scroll, the landmark recedes and becomes the picture inside a square pendant. The pendant then moves aside while the product details appear.

There are four locations: Paris, the Great Wall, the Taj Mahal and Big Ben. All four pages share the same CSS and JS; only the config and the landmark change. It's plain HTML, CSS and JS with no build step. GSAP, ScrollTrigger and Lenis load from CDNs with pinned versions.

## Open it

Double-click `index.html`. It opens straight from disk (`file://`) with no local server, and every page renders exactly as it would online, including the palette-coloured landmark.

The CDN libraries need an internet connection. Without one, the pages fall back to the static stacked layout.

## Deploy to GitHub Pages

Every path in the project is relative and every filename is lowercase, so it works from a domain root or from a sub-path like `username.github.io/repo/`.

1. Push the repository to GitHub. `index.html` already sits at the repo root, which is what GitHub Pages serves.
2. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then pick your branch and the `/ (root)` folder. Don't pick `/docs`: that folder holds the coding conventions, not the site.
3. After a minute the site is live at `https://<user>.github.io/<repo>/`. The picker is the home page.

The empty `.nojekyll` file tells GitHub Pages to serve the files as they are, with no Jekyll processing.

## Add a new location

Use a short lowercase slug, for example `colosseum`.

1. **Config:** copy `js/configs/paris.js` to `js/configs/colosseum.js`. Then change:
   - `location`: `name`, `tagline`, `landmarkAlt`, and `landmark: 'colosseum'`;
   - `product`: title, price, description, bullets, and `pendantImage: 'assets/pendants/colosseum.svg'`;
   - `palette`: night and day colours (see the keys below).
2. **Landmark script:** create `assets/landmarks/colosseum.js`:
   ```js
   window.PENDANT_LANDMARKS = window.PENDANT_LANDMARKS || {};
   window.PENDANT_LANDMARKS['colosseum'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">...</svg>';
   ```
   - Use `fill="currentColor"` so the theme can recolour the silhouette. `fill-opacity` works for background layers.
   - Put the base of the landmark on the bottom edge of the viewBox. The scene anchors to that ground line.
   - Any `viewBox` works; the page reads the aspect ratio from it. Keep the string on one line, with double quotes and no single quotes.
3. **Pendant image:** add `assets/pendants/colosseum.svg`, or a real render. If its glass window sits somewhere other than in the placeholders, update `product.pendantWindow` (see below).
4. **Page:** copy `paris.html` to `colosseum.html`. Change only the `<title>` and the two script tags in `<head>`, so they point to `js/configs/colosseum.js` and `assets/landmarks/colosseum.js`.
5. **Picker card:** in `index.html`:
   - copy one `<li>` card and change its `href`, `data-landmark`, meta line and title;
   - add `<script src="assets/landmarks/colosseum.js"></script>` next to the other landmark scripts at the bottom.

### Palette keys

Each theme (`night`, `day`) takes these keys:

| Key | Used for |
|---|---|
| `skyTop`, `skyBottom` | sky gradient |
| `accent` | sun glow, horizon glow, divider lines and bullet dashes |
| `landmark` | silhouette colour |
| `text` | all text and the primary button |
| `metalLight`, `metalMid`, `metalDark` | the animated bezel and chain. Match these to the pendant image so the crossfade doesn't shift colour. |

Each key becomes a CSS variable, such as `--night-sky-top` or `--day-metal-mid`. The dim overlay, hairlines and buy-bar background are derived from these colours, so a new palette needs nothing else.

### Pendant window

`product.pendantWindow` tells the page where the glass window sits inside the pendant image, so the live scene lines up with it. All three values are fractions of the **image width**:
- `x`: the window's left edge;
- `y`: the window's top edge;
- `size`: the window's side length.

The placeholders all use a 300 × 500 viewBox with the window at 78,318, size 144. That gives `{ x: 0.26, y: 1.06, size: 0.48 }`.

The placeholder glass is transparent, so the landmark scene stays visible through it. An opaque photo simply covers it.

## File map

| File | Role |
|---|---|
| `index.html` | Location picker: four cards, each with a small silhouette preview. |
| `paris.html`, `great-wall.html`, `taj-mahal.html`, `big-ben.html` | One page per location. They're identical apart from the `<title>` and the config and landmark scripts. Each holds generic fallback text that shows if JS fails. |
| `css/style.css` | Shared styles, written with native CSS nesting. The scene has two layouts:<br>• static stacked (no JS, reduced motion, or a library failed to load);<br>• animated, scoped under `html.is-animated`.<br>The picker styles are here too. |
| `js/theme.js` | Shared. Runs in `<head>` before first paint. It applies the palette, picks day or night (saved choice, then `prefers-color-scheme`), handles the toggle, and generates the stars and clouds. |
| `js/scene.js` | Shared. Fills the page from config, injects the landmark SVG inline, builds the GSAP timelines, starts Lenis, and holds the add-to-cart hook. |
| `js/configs/<slug>.js` | Sets `window.PENDANT_CONFIG`: every location- and product-specific value. |
| `assets/landmarks/<slug>.js` | Adds the landmark SVG string to `window.PENDANT_LANDMARKS`. |
| `assets/pendants/<slug>.svg` | Placeholder product render (bezel, bail, chain, glass), with a different metal per location. |
| `.nojekyll` | Tells GitHub Pages to serve the files without Jekyll processing. |
| `docs/website-coding-conventions.md` | The HTML, CSS and JS conventions this code follows. |

## Scroll phases

The scene section is 450svh tall. Inside it, a sticky 100dvh stage holds one GSAP timeline scrubbed by ScrollTrigger (`scrub: 0.6`). Desktop (≥ 900px) and mobile get separate timelines with the same phases, built with `gsap.matchMedia()`.

| Progress | Phase | What happens |
|---|---|---|
| 0–8% | Hold | The landmark is large and centred, with the pulsing "Scroll" nudge. The nudge fades out within the first 3%. |
| 8–40% | Shrink away | The landmark shrinks and drifts toward its final spot in the window, and haze builds over it. The star and cloud layers move at different speeds for parallax. |
| 40–58% | Becomes the pendant | Steps overlap:<br>• 40–52%: the haze clears and the scene's clip closes from full screen to the bezel's inner square;<br>• 44–53%: the bezel scales in;<br>• 46–54%: the chain drops in;<br>• 46–56%: everything outside the window dims;<br>• 53–58%: the scene crossfades into `pendantImage`. |
| 58–100% | Reveal | **Desktop:** the pendant moves to the left half (60–80%) and the details stagger in on the right (66–90%).<br>**Mobile:** the pendant scales down and moves up (60–80%), the details slide up beneath it (68–82%), and the sticky buy bar appears after 90%. |

The layout numbers are CSS variables on `section.custom_pendant_scene`:
- `--sq`: size of the window;
- `--d-pendant-x`: final horizontal position on desktop;
- `--m-pendant-scale` and `--m-pendant-y`: final scale and vertical position on mobile.

JS reads these at every refresh, so you can tune the layout from CSS alone.

## Behaviour notes

- **Smooth scrolling:** Lenis runs only on fine-pointer devices without reduced motion. Touch devices use native scroll. `normalizeScroll` is not used.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, there's no pinned animation. The page shows a static stack: landmark, then pendant (with the scene in its window), then details.
- **Theme:** the choice is saved in `localStorage` under `pendant-theme`. It's applied in `<head>` before paint, so there's no flash. Day and night sky layers crossfade over 600ms.
- **Animated properties:** only `transform` and `opacity` are animated, plus a `--clip` variable that drives the window's `clip-path: inset()`.

## Porting to Shopify

The scene is self-contained: one `<section>` with its own CSS and JS. The only globals are `window.PENDANT_CONFIG` and `window.PENDANT_LANDMARKS`. To turn it into a section:

1. Move the markup into `sections/pendant-scene.liquid`.
2. Replace `window.PENDANT_CONFIG` with JSON rendered from Liquid:
   - `product.title`, `product.price | money` and `product.description`;
   - bullets from a list metafield;
   - `pendantImage` from the featured media;
   - `tagline`, `pendantWindow` and `palette` from product metafields (or section settings);
   - the landmark SVG string from a metafield, rendered into `window.PENDANT_LANDMARKS` (or straight into the `.landmark` figure).
3. Replace the body of `onAddToCart(product)` in `js/scene.js` with a `fetch('/cart/add.js', …)` call that returns its Promise. The button already waits for the Promise before showing "Added".
4. Load GSAP, ScrollTrigger and Lenis from the theme's assets or the same pinned CDN URLs.
