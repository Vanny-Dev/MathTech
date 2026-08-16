# Comic character images

Drop the character art in **this folder**. The filenames must match exactly —
they are hard-coded in the `CHARS` map in
`src/components/comic/ComicStrip.jsx`.

| Filename              | Shown when                                    |
|-----------------------|-----------------------------------------------|
| `dark_idle.png`       | Panel 1 — the character asking the question   |
| `light_thinking.png`  | Panel 2 — the character working on the answer |
| `dark_happy.png`      | Panel 3 — reaction after a **correct** answer |
| `dark_serious.png`    | Panel 3 — reaction after a **wrong** answer   |
| `light_happy.png`     | alternate correct reaction                    |
| `light_sad.png`       | alternate wrong reaction                      |

## File requirements

- **Format:** `.png` (the code points at `.png`, not `.svg`). Transparent
  background strongly recommended — panels sit on graph paper.
- **Rendered size:** 140 px tall; width scales automatically (`object-fit: contain`).
  Export around **280–420 px tall** so it stays sharp on high-DPI screens.
- **Orientation:** characters face inward. Panels 1 and 3 place the character on
  the right, panel 2 on the left, so a character facing left reads best.

## How the path works

Anything in `public/` is served from the site root, so:

```
frontend/public/assets/characters/dark_idle.png   ->   /assets/characters/dark_idle.png
```

Do **not** import these files in JavaScript and do not put them in `src/assets/`.
Files in `public/` are copied verbatim at build time and referenced by URL.

## Panel backgrounds

`../panels/` holds the optional panel backgrounds referenced by
`activity.comic.panelBackground`:

- `bg_halftone.svg`
- `bg_speedlines.svg`

## Using a different character per activity

Set the `comic` object when creating an activity:

```json
"comic": {
  "thinkingCharacter": "light_thinking",
  "correctCharacter":  "dark_happy",
  "wrongCharacter":    "dark_serious",
  "panelBackground":   "halftone"
}
```

The values are **keys from the `CHARS` map** (`dark_idle`, `light_happy`, …),
not file paths.

To add a brand-new character, add it to `CHARS` in `ComicStrip.jsx` first —
otherwise the key falls back to the default for that panel.
