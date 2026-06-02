# MyLoanPlans — AI Animation & 3D Asset Prompt Pack

This is the prompt library for generating the **hero/section background visuals** for the new
cinematic landing page. The site itself uses **React Three Fiber + GSAP ScrollTrigger** for the
*interactive* 3D (built in code). These prompts are for the **cinematic video / image assets** you
generate in AI tools and then drop behind the scroll sections as muted, looping `<video>` or stills.

> Aesthetic lock: **Light premium fintech** — clean white / off-white, soft pastel gradients
> (sky-blue → mint → lavender), fine shadows, glass, lots of negative space. Think
> **Stripe × Linear × Mercury × Apple**. NOT dark, NOT neon, NOT cyberpunk.

---

## Which tool for what

| Tool | Best for | Output |
|------|----------|--------|
| **Higgsfield** | Cinematic camera-move hero clips (dolly/orbit/push-in), "money in motion" b-roll | 3–10s video |
| **Sora / Veo 3** | Photoreal abstract loops, liquid/particle fields, slow product hero shots | 5–20s video |
| **Runway Gen-3 / Kling** | Looping abstract textures, gradient flow, depth-of-field bokeh | 4–10s video |
| **Midjourney / Flux** | Static hero stills, OG/social images, texture plates, icon art | image |
| **Spline** | Real embeddable interactive 3D scene (alternative/complement to R3F) | web embed |

**Workflow:** generate → trim to a clean seamless loop → export MP4 (H.264) **and** WebM →
compress (Handbrake / `ffmpeg`, target < 2.5 MB, 1080p, ~24fps) → place as
`muted loop playsInline` video behind the section with a white gradient overlay for text contrast.

`ffmpeg` loop + compress:
```
ffmpeg -i in.mp4 -vf "scale=1920:-2,fps=24" -c:v libx264 -crf 28 -pix_fmt yuv420p -an out.mp4
ffmpeg -i in.mp4 -vf "scale=1920:-2,fps=24" -c:v libvpx-vp9 -crf 34 -b:v 0 -an out.webm
```

---

## 1 — HERO (top of page): "Money in motion"

**Higgsfield (camera motion):**
```
A slow cinematic dolly-in over a softly glowing abstract financial landscape made of floating
translucent glass cards, thin minimalist line charts, and gently rising bar graphs, all in a
clean light environment. Palette: pure white background with pastel sky-blue, mint green and soft
lavender gradients. Soft studio lighting, shallow depth of field, subtle bokeh, premium Apple-style
product aesthetic. Smooth slow push-in camera move, weightless floating motion, ultra clean,
minimalist, no text, no logos, 4k, 24fps, seamless loop.
```

**Sora / Veo 3 (photoreal loop):**
```
Photorealistic abstract scene: weightless frosted-glass financial dashboard panels and glowing
coins drift slowly through a bright, airy white space with pastel blue-to-mint volumetric light.
Delicate particles of light float upward like rising value. Extremely soft shadows, glossy glass
refraction, calm and trustworthy mood, premium fintech advertising look. Slow orbital camera,
seamless 8 second loop, no people, no text, cinematic, 4k.
```

**Negative prompt (all tools):** `dark, neon, cyberpunk, cluttered, text, watermark, logo, glitch, low quality, harsh shadows, gritty`

---

## 2 — LOAN section background: "The mortgage, demystified"

**Runway / Kling (abstract loop):**
```
Abstract animation of a glowing amortization curve gracefully descending to zero, drawn with a
single luminous thin line of light over a clean white canvas, while soft translucent house-shaped
glass forms float gently in the background. Pastel sky-blue and warm gold accent light. Calm,
elegant, premium financial visualization, slow motion, seamless loop, minimalist, 4k, no text.
```

**Midjourney still (section plate):**
```
Minimalist 3D render of a translucent glass house floating above a soft pastel gradient platform,
thin glowing payment-schedule line wrapping around it, white studio background, soft shadows,
premium fintech product photography, clean negative space, sky-blue and gold palette --ar 16:9 --style raw
```

---

## 3 — BUDGET section background: "See every dollar"

**Sora / Runway (loop):**
```
Slow elegant motion of floating translucent category bubbles and thin pie-chart rings gently
orbiting in a bright white space, soft pastel mint, blue and lavender glass, tiny coins of light
sorting themselves into neat glowing stacks. Calm, organized, premium, weightless, soft focus
background, seamless loop, no text, 4k cinematic.
```

---

## 4 — SAVINGS / GROWTH section: "Compound your future"

**Higgsfield:**
```
Cinematic slow upward camera tilt following glowing particles and translucent glass coins stacking
and growing exponentially into a soft luminous tower, bright white environment, pastel mint-to-gold
gradient light symbolizing growth, weightless and hopeful mood, premium minimalist fintech,
shallow depth of field, seamless loop, no text, 4k 24fps.
```

---

## 5 — STATIC IMAGES (Midjourney / Flux)

**OG / social share image (1200×630):**
```
Clean premium fintech hero graphic, translucent glass dashboard cards showing a minimalist line
chart and a small house icon, floating over a soft white-to-pastel-blue gradient, lots of negative
space on the left for text, soft shadows, Apple keynote aesthetic --ar 1200:630 --style raw
```

**App icon / favicon motif:**
```
Minimalist app icon, a soft rounded square with a glowing upward line chart merging into a small
house silhouette, pastel blue-to-mint gradient, white background, flat premium fintech logo,
simple, scalable, vector-like, centered --ar 1:1
```

---

## 6 — SPLINE (optional interactive embed, alternative to R3F)

In spline.design, build then embed via `@splinetool/react-spline`. Scene brief to follow:
```
A floating cluster of frosted-glass financial cards and a low-poly translucent house, soft pastel
studio lighting (white + sky-blue rim light), gentle idle float animation, mouse-parallax camera,
emissive thin chart lines. Light, airy, premium. Trigger a subtle scale/rotate on scroll.
```

---

## How these map to the coded scroll experience

The interactive layer is built in this repo with **R3F + GSAP ScrollTrigger** (no AI needed):
- **Hero:** an R3F canvas with floating glass cards + a particle field, parallax on pointer, and a
  scroll-scrubbed camera push-in.
- **Section reveals:** GSAP ScrollTrigger pins each section, scrubs SplitText-style line reveals,
  parallax layers, and a progress-driven number counter (e.g. balance ticking down).
- **AI video assets above** sit *behind* these sections as ambient loops for richness; the coded
  3D stays crisp and interactive on top.

Drop generated files into `public/video/` (`hero.mp4/.webm`, `loan.mp4`, `budget.mp4`,
`savings.mp4`) and `public/og.png`. The components already reference these paths with graceful
fallbacks, so the site looks great even before the assets are added.
