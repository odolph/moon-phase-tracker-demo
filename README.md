# Moon Phase Tracker

Static moon phase tracker for San Jose, California built with plain HTML, CSS, and vanilla JavaScript.

## Run locally

Because this project is purely static, you can open `index.html` directly in a browser or serve the folder with a small local server.

Example with Python:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Project structure

- `index.html` defines the hero, interactive timeline, detail panel, and footer.
- `styles.css` contains the responsive layout, visual design, and accessibility-minded motion handling.
- `script.js` calculates the next 12 months of major moon phases on the client and wires up interactions.

## Approximation approach

This tracker does not call any external APIs at runtime.

The JavaScript uses:

- A fixed new moon epoch: `2000-01-06 18:14 UTC`
- A mean synodic month length: `29.530588853 days`
- Eight evenly spaced major phase checkpoints per lunation:
  - New Moon
  - Waxing Crescent
  - First Quarter
  - Waxing Gibbous
  - Full Moon
  - Waning Gibbous
  - Last Quarter
  - Waning Crescent

## Assets

- Hero moon texture sourced from NASA GSFC / Arizona State University (Wikimedia, "FullMoon2010"), stored at `assets/moon-texture.jpg` and tinted client-side.

For each checkpoint, the script:

1. Steps through lunations spanning the next year.
2. Computes each phase time from the epoch plus a phase fraction of the synodic month.
3. Formats output in the `America/Los_Angeles` time zone for San Jose, CA.
4. Estimates illumination with a simple cosine-based phase model.

This is intentionally lightweight and suitable for a static site, but it is still an approximation. Real lunar phase times vary because of orbital perturbations, so the displayed moments should be treated as close estimates rather than observatory-grade results.

## Accessibility and interaction

- A skip link allows keyboard users to jump directly to the timeline.
- Phase cards respond to hover, click, and keyboard focus.
- The selected phase updates an `aria-live` detail panel.
- Motion is reduced automatically when the user enables reduced motion preferences.
