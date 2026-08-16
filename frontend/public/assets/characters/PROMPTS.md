# Image-generation prompts — MathTech comic characters

Six images, two characters × three expressions. The hard part is **consistency**:
the same face has to appear across three panels or the strip falls apart. Generate
each character's three poses in one session, reusing the same base description.

---

## Style block (reuse verbatim in every prompt)

Paste this after the character description each time. It encodes the app's design
system — hard ink outlines, flat cel colour, limited palette.

```
Style: clean shonen manga / anime cel illustration. Bold uniform black ink
outlines about 3px thick, flat cel shading with only one shadow tone, no
gradients, no airbrush, no painterly texture. Limited palette: deep navy
#0B1D2E, cream #F5F0E8, teal #4ECDC4, warm yellow #FFE66D. Crisp vector-like
finish, high contrast, sticker-clean edges. Waist-up shot, three-quarter view,
character centred with even margins. Fully transparent background, no
background elements, no shadow on the ground, no frame, no border, no text,
no speech bubble, no watermark, no signature.
```

---

## Character A — "dark" (poses the question, appears on the RIGHT of the panel)

Base description — keep identical across all three:

```
A 16-year-old Filipino male senior-high-school student named Miguel. Short
tidy black hair with a slight side part, warm brown skin, dark brown eyes,
friendly rounded face. Wearing a crisp white short-sleeved school polo with a
small teal chest patch and a navy necktie. Slim build.
```

> **Facing:** he sits on the **right** side of panels 1 and 3, so he should be
> **facing LEFT / turned toward the viewer's left**.

### `dark_idle.png` — Panel 1, asking the question

```
[Character A base]
Expression and pose: calm and curious, a small friendly half-smile, one
eyebrow slightly raised, head tilted a little. One hand raised near his chest
holding a folded sheet of graph paper, as if about to ask a question. Relaxed,
inviting, not smug. Facing to the viewer's left.
[Style block]
```

### `dark_happy.png` — Panel 3, after a CORRECT answer

```
[Character A base]
Expression and pose: delighted and proud, wide open smile, eyes closed in a
happy curve, one fist raised in a small celebratory pump near his shoulder.
Energetic and warm, celebrating with the student rather than at them. Facing
to the viewer's left.
[Style block]
```

### `dark_serious.png` — Panel 3, after a WRONG answer

```
[Character A base]
Expression and pose: thoughtful and encouraging, gentle closed-mouth smile,
eyes attentive, one hand on his chin in a considering gesture, the other
arm folded. Patient and supportive — clearly saying "not quite, let's look
again", absolutely NOT angry, disappointed, scolding, or sad. Facing to the
viewer's left.
[Style block]
```

---

## Character B — "light" (answers, appears on the LEFT of the panel)

Base description — keep identical across all three:

```
A 16-year-old Filipina senior-high-school student named Ana. Shoulder-length
light caramel-brown hair tied in a half-ponytail with a small yellow ribbon,
warm light-tan skin, bright hazel eyes, round expressive face. Wearing a crisp
white school blouse with a teal ribbon tie. Slim build.
```

> **Facing:** she sits on the **left** side of panel 2, so she should be
> **facing RIGHT / turned toward the viewer's right**.

### `light_thinking.png` — Panel 2, working on the answer

```
[Character B base]
Expression and pose: concentrating hard, eyes looking up and to the side in
thought, lips pressed in a small determined line, one hand tapping a pencil
against her cheek, the other holding a small notebook. Focused and
determined, not confused or distressed. Facing to the viewer's right.
[Style block]
```

### `light_happy.png` — Panel 2, after a CORRECT answer

```
[Character B base]
Expression and pose: joyful and triumphant, big open smile, eyes bright and
sparkling, both hands raised in a small cheer, pencil still in one hand.
Bouncy, proud, full of momentum. Facing to the viewer's right.
[Style block]
```

### `light_sad.png` — Panel 2, after a WRONG answer

```
[Character B base]
Expression and pose: mildly disappointed but still game to try again. Small
sheepish frown, eyes glancing down and away, one hand scratching the back of
her head in an "oops" gesture, shoulders slightly raised. Light and comedic,
gently self-deprecating — NOT crying, NOT tearful, NOT genuinely upset.
Facing to the viewer's right.
[Style block]
```

---

## Negative prompt

For Stable Diffusion / anything that accepts one:

```
background, scenery, classroom, wall, floor, ground shadow, drop shadow,
frame, border, panel lines, text, letters, numbers, speech bubble, watermark,
signature, logo, gradient, airbrush, soft shading, photorealistic, 3d render,
realistic skin texture, blurry, lowres, extra fingers, deformed hands,
malformed limbs, extra limbs, cropped head, out of frame, multiple characters,
full body, feet, sexualized, revealing clothing, crying, tears, angry, hostile
```

---

## Getting consistency across the three poses

The single biggest quality factor. In order of reliability:

1. **Generate a character sheet first.** Ask for one image: *"character reference
   sheet, same character in three expressions side by side — calm, delighted,
   thoughtful"*. Then crop the three. This guarantees an identical face.
2. **Reuse the seed.** Fix the seed and change only the expression sentence.
3. **Midjourney:** generate Miguel once, then use `--cref <url> --cw 100` on the
   other two prompts to lock character features.
4. **DALL·E / ChatGPT:** generate the first image, then in the *same conversation*
   say "same character, same outfit and hairstyle, now [new expression]".
5. **Stable Diffusion:** same seed + same base prompt, IP-Adapter or a small LoRA
   for the face if you have one.

## Output settings

- **Transparent PNG.** Most generators won't do this natively — generate on a
  flat white or magenta background, then remove it (remove.bg, Photoshop
  *Select Subject → Remove Background*, or `rembg`). Magenta keys out more
  cleanly than white against a white blouse.
- **Export ~400 px tall.** Rendered at 140 px in the panel; extra resolution
  keeps it sharp on high-DPI screens.
- Trim transparent padding so the character fills the frame — `object-fit:
  contain` will otherwise shrink it inside its own empty margins.

## Panel backgrounds (optional)

`../panels/bg_halftone.svg` and `bg_speedlines.svg` are referenced by
`activity.comic.panelBackground`. These are flat graphic patterns, not
illustrations — faster to hand-write as SVG than to generate. The halftone
variant already exists as a CSS fallback in `comic.css` (`.bg-halftone`).
