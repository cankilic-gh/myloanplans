# MyLoanPlans — Gemini (Veo 3.1) Ready-to-Paste Prompt Pack

Optimized for **Google Veo 3.1** via **Google Flow** (labs.google/flow) or the Gemini app.
Each prompt is fully self-contained: subject, setting, camera, lens, lighting, palette, texture,
motion, mood, loop and negative guidance are all baked in. Paste a prompt, set the options below,
generate 2–3 variations, keep the most seamless loop.

> **Brand palette (locked):** background off-white `#fbfcfe`, primary blue `#2f6bff`,
> lavender `#8b7bff`, mint green `#2bd4a4`, warm gold `#f7b955`.
> **Look:** Light Premium Fintech — Stripe × Linear × Apple. Bright, airy, calm, weightless.
> NOT dark, NOT neon, NOT cyberpunk.

## Flow / Veo settings for every clip
- Model: **Veo 3.1** (use "Quality" if your credits allow, else "Fast")
- Aspect ratio: **16:9 landscape**
- Resolution: **1080p**
- Duration: **~8 seconds**
- Audio: not needed (the site plays muted loops) — ignore or mute any generated sound
- Generate **2–3 variations** per prompt, choose the one whose first and last frame match best (clean loop)

---

## 1 — HERO  →  save as `hero.mp4` (and `hero.webm`)

**Prompt:**
```
A slow, weightless cinematic dolly-in through a bright, airy, pure off-white studio space (#fbfcfe)
filled with floating translucent frosted-glass cards that resemble minimalist financial dashboards —
each card holds a faint glowing thin-line chart and a soft rising bar graph. Delicate particles of
soft light drift slowly upward like rising value. The glass refracts gently, catching soft pastel
light in sky-blue (#2f6bff), lavender (#8b7bff) and mint (#2bd4a4). Shot on a 35mm lens, very shallow
depth of field, creamy bokeh, soft diffused studio lighting from above, subtle volumetric light rays.
The camera pushes in extremely slowly and smoothly with a faint floating parallax, as if gliding
through calm water. Premium Apple-keynote product aesthetic, ultra clean, minimalist, hopeful and
trustworthy mood, photorealistic, high dynamic range, 4k. Seamless loop, gentle continuous motion,
absolutely no text, no logos, no people.
```
**Negative prompt:**
```
text, words, captions, logo, watermark, dark background, neon, cyberpunk, glitch, harsh shadows,
high contrast, cluttered, busy, fast motion, shaky camera, people, faces, low quality, distorted
```
**Variation idea (try as a 2nd render):** replace "dolly-in" with *"a very slow orbital camera move
arcing left to right around the floating glass cards."*

---

## 2 — LOAN  →  save as `loan.mp4`

**Prompt:**
```
Abstract cinematic animation on a clean bright off-white canvas (#fbfcfe): a single luminous thin
line of sky-blue light (#2f6bff) draws an elegant amortization curve that gracefully descends toward
zero, like a debt being paid off. Behind it, soft translucent frosted-glass house-shaped forms float
and rotate gently, catching warm gold (#f7b955) rim light. Tiny soft particles of light fall along
the curve as it descends. Soft diffused studio lighting, shallow depth of field, subtle bokeh,
premium minimalist financial visualization, calm and reassuring mood, photorealistic glass and light,
50mm lens, very slow smooth motion, high dynamic range, 4k. Seamless loop, no text, no numbers,
no logos, no people.
```
**Negative prompt:**
```
text, numbers, words, logo, watermark, dark, neon, cyberpunk, glitch, clutter, fast motion, shaky,
people, faces, harsh light, low quality
```

---

## 3 — BUDGET  →  save as `budget.mp4`

**Prompt:**
```
A bright, airy, pure off-white space (#fbfcfe) where soft translucent pastel glass bubbles and thin
glowing pie-chart and donut rings float and slowly orbit, gently organizing themselves. Tiny coins
of soft light sort themselves into neat glowing stacks, suggesting a budget falling into order.
Colors are calm pastels — mint green (#2bd4a4), sky-blue (#2f6bff) and lavender (#8b7bff). Soft
diffused studio lighting, shallow depth of field, creamy bokeh, weightless floating motion, premium
minimalist fintech aesthetic, organized and satisfying mood, photorealistic frosted glass, 35mm lens,
slow smooth camera drift, high dynamic range, 4k. Seamless loop, no text, no logos, no people.
```
**Negative prompt:**
```
text, words, logo, watermark, dark background, neon, cyberpunk, glitch, cluttered, chaotic, fast
motion, shaky camera, people, faces, harsh shadows, low quality
```

---

## 4 — SAVINGS / GROWTH (optional, bonus — not wired into the site yet)

**Prompt:**
```
A slow upward cinematic camera tilt following translucent frosted-glass coins and soft particles of
light stacking and growing exponentially into a tall luminous tower, set in a bright airy off-white
environment (#fbfcfe). A soft mint-to-gold gradient glow (#2bd4a4 to #f7b955) rises with the stack,
symbolizing compound growth. Weightless, hopeful, calm mood, premium minimalist fintech, shallow
depth of field, soft diffused lighting, gentle bokeh, photorealistic glass and light, 50mm lens,
very slow smooth tilt, 4k. Seamless loop, no text, no logos, no people.
```
**Negative prompt:** same as the others.

---

## 5 — STILL IMAGES with Nano Banana (Gemini image mode)

For the social-share image and any richer section plates. 16:9, high detail.

**OG / social share (optional, overrides the auto-generated one):**  →  `public/og.png`
```
Clean premium fintech hero graphic on a soft white-to-pastel-blue gradient background (#fbfcfe to
#e7efff). Floating translucent frosted-glass dashboard cards showing a minimalist glowing line chart
and a small simple house icon, plus a soft pie ring. Generous empty negative space on the left third
for text. Soft shadows, soft studio lighting, Apple-keynote aesthetic, sky-blue, lavender and mint
accents, ultra clean, minimalist, no text, 16:9.
```

**Hero poster fallback (shown before the video loads on slow connections):**  →  `public/video/hero-poster.jpg`
```
A single still frame of floating translucent frosted-glass financial dashboard cards in a bright
airy off-white studio, soft pastel sky-blue, lavender and mint light, shallow depth of field, creamy
bokeh, premium Apple-keynote aesthetic, ultra clean, minimalist, no text, no people, 16:9.
```

---

## After you generate
1. Download each clip as **MP4 (1080p, 16:9)**.
2. Rename to exactly: `hero.mp4`, `loan.mp4`, `budget.mp4` (and optional `hero-poster.jpg`).
3. (Recommended) Trim to a clean loop and shrink with ffmpeg:
   ```
   ffmpeg -i hero_raw.mp4 -vf "scale=1920:-2,fps=24" -c:v libx264 -crf 28 -pix_fmt yuv420p -an hero.mp4
   ffmpeg -i hero.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 -an hero.webm
   ```
4. Drop them into `public/video/`. The site auto-detects them; missing files just stay invisible.
```
public/video/hero.mp4
public/video/hero.webm
public/video/loan.mp4
public/video/budget.mp4
```

## Quick tips for Veo
- If motion is too strong, add **"barely perceptible motion, almost still"** to the prompt.
- If it adds text anyway, re-roll and strengthen the negative: add `any text, letters, glyphs`.
- For a clean loop, prefer drifting/orbiting motion over a one-way dolly — it returns near the start.
- Keep each clip short (~8s) — easier to loop seamlessly and smaller file size.
