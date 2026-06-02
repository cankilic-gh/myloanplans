# MyLoanPlans — Image-to-Video Workflow (Nano Banana → Veo 3.1)

The most controllable, consistent way to make the hero loops:
1. **Generate the FIRST FRAME** with Nano Banana / Imagen (Gemini image mode), 16:9, no text.
2. In **Google Flow / Gemini**, attach that image as the **starting frame** ("Frames to Video" /
   add image / Ingredients), then paste the matching **MOTION prompt** — it describes only what moves.
3. Generate 2–3 variations, keep the cleanest seamless loop.

> The IMAGE sets the look (composition, palette, glass, light). The MOTION prompt only adds movement.
> Each image is framed with **headroom for the camera move** (space to push in / for things to rise).
>
> Palette: off-white `#fbfcfe` · blue `#2f6bff` · lavender `#8b7bff` · mint `#2bd4a4` · gold `#f7b955`.
> Image settings: **16:9**, highest detail, **no text / no logos / no people**.

---

## 1 — HERO

### IMAGE prompt (Nano Banana → first frame)
```
A bright, airy, pure off-white studio space (#fbfcfe) with several translucent frosted-glass cards
floating at different depths, arranged with open space in the center so a camera can push inward.
Each glass card resembles a minimalist financial dashboard holding a faint glowing thin-line chart
and a soft rising bar graph. The glass refracts gently, catching soft pastel light in sky-blue
(#2f6bff), lavender (#8b7bff) and mint (#2bd4a4). A few delicate particles of soft light hover in the
lower third, ready to rise. Shot on a 35mm lens, very shallow depth of field, creamy bokeh, soft
diffused studio lighting from above, subtle volumetric light rays. Premium Apple-keynote product
aesthetic, ultra clean, minimalist, hopeful and trustworthy, photorealistic, high dynamic range, 4k,
16:9. No text, no logos, no people.
```

### MOTION prompt (Veo, with the image attached)
```
The camera pushes in extremely slowly and smoothly through the floating glass cards with a faint
weightless parallax, as if gliding through calm water. The cards drift apart almost imperceptibly and
the particles of light float gently upward. Barely perceptible, continuous, dreamlike motion.
Seamless loop. No text, no people.
```
**Negative:** `text, words, logo, watermark, dark, neon, glitch, fast motion, shaky camera, people, faces, harsh shadows, low quality`

---

## 2 — LOAN

### IMAGE prompt (Nano Banana → first frame)
```
Abstract minimalist financial visualization on a clean bright off-white canvas (#fbfcfe). A single
luminous thin line of sky-blue light (#2f6bff) forms an elegant curve that starts high on the upper
left with plenty of room to descend toward the lower right, like an amortization schedule before
payoff. Behind it, soft translucent frosted-glass house-shaped forms float in the mid background,
catching warm gold (#f7b955) rim light. A few soft particles of light rest along the curve. Soft
diffused studio lighting, shallow depth of field, subtle bokeh, premium, calm and reassuring,
photorealistic glass and light, 50mm lens, high dynamic range, 4k, 16:9. No text, no numbers,
no logos, no people.
```

### MOTION prompt (Veo, with the image attached)
```
The luminous blue curve gracefully draws and descends toward zero along its path, soft particles of
light gently fall and trail along it as it lowers, and the frosted-glass house forms rotate very
slowly in the background. Calm, smooth, slow motion. Seamless loop. No text, no numbers, no people.
```
**Negative:** `text, numbers, words, logo, watermark, dark, neon, glitch, clutter, fast motion, shaky, people, faces, low quality`

---

## 3 — BUDGET

### IMAGE prompt (Nano Banana → first frame)
```
A bright, airy, pure off-white space (#fbfcfe) with soft translucent pastel glass bubbles and thin
glowing pie-chart and donut rings scattered loosely around the center, with open space so they can
later orbit and organize. Tiny coins of soft light rest in the lower area, ready to stack. Calm
pastel colors — mint green (#2bd4a4), sky-blue (#2f6bff) and lavender (#8b7bff). Soft diffused studio
lighting, shallow depth of field, creamy bokeh, premium minimalist fintech aesthetic, organized and
satisfying, photorealistic frosted glass, 35mm lens, high dynamic range, 4k, 16:9. No text, no logos,
no people.
```

### MOTION prompt (Veo, with the image attached)
```
The translucent glass bubbles and chart rings float and slowly orbit, gently organizing themselves
into a tidy arrangement, while the coins of light softly sort and stack into neat glowing piles.
Weightless, smooth, satisfying slow motion. Seamless loop. No text, no logos, no people.
```
**Negative:** `text, words, logo, watermark, dark, neon, glitch, cluttered, chaotic, fast motion, shaky camera, people, faces, harsh shadows, low quality`

---

## 4 — SAVINGS (optional bonus)

### IMAGE prompt (Nano Banana → first frame)
```
Translucent frosted-glass coins and soft particles of light beginning to stack from the bottom of a
bright airy off-white frame (#fbfcfe), with lots of vertical space above for the stack to grow. A
soft mint-to-gold gradient glow (#2bd4a4 to #f7b955) rises from the base. Weightless, hopeful, calm,
premium minimalist fintech, shallow depth of field, soft diffused lighting, gentle bokeh,
photorealistic glass and light, 50mm lens, 4k, 16:9. No text, no logos, no people.
```

### MOTION prompt (Veo)
```
The glass coins and particles of light stack and grow upward, multiplying gently into a tall luminous
tower as the camera tilts slowly up to follow the growth, the mint-to-gold glow rising with it.
Very slow, smooth, hopeful motion. Seamless loop. No text, no people.
```
**Negative:** same as above.

---

## Why image-to-video here
- **Consistency:** the still locks the exact palette, glass style and composition before you spend
  video credits — fewer wasted re-rolls.
- **Control:** you can re-generate just the image until the framing is perfect, then animate once.
- **Loops:** starting from a calm, balanced frame makes a seamless loop far easier.

---

## Gemini / Veo settings (every clip)
- Model: **Pro** (best quality) — switch to **Fast** if you want to save credits
- Aspect ratio: **Landscape (16:9)**
- Duration: **~8 seconds**
- Audio: not needed (the site plays muted loops)
- Generate **2–3 variations**, keep the one whose first & last frame match best (clean loop)
- Step 1 image lives in Gemini → **Images** (left sidebar). Step 2 video → **Videos**; attach the
  still with the image/frame icon (left of the "Landscape" button) or the **+** button.

## After you generate
1. Download each clip as **MP4 (1080p, 16:9)**.
2. Rename to exactly: `hero.mp4`, `loan.mp4`, `budget.mp4`.
3. (Optional) Trim to a clean loop + shrink with ffmpeg, and make the hero webm:
   ```
   ffmpeg -i hero_raw.mp4 -vf "scale=1920:-2,fps=24" -c:v libx264 -crf 28 -pix_fmt yuv420p -an hero.mp4
   ffmpeg -i hero.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 -an hero.webm
   ```
4. Drop the files into `public/video/`. The site auto-detects them; missing files stay invisible.
   ```
   public/video/hero.mp4
   public/video/hero.webm
   public/video/loan.mp4
   public/video/budget.mp4
   ```

## Tips
- Too much movement? Add **"barely perceptible motion, almost still"** to the MOTION prompt.
- It still writes text? Re-roll and add `any text, letters, glyphs` to the negative prompt.
- Cleaner loop = drifting/orbiting motion over a one-way push-in (returns near the start).
