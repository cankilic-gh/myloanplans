# Hero v2 — Bright Architectural Dream-Home Scene (Gemini image-to-video)

New hero direction: instead of abstract glass charts, a **photoreal-but-bright 3D-rendered home by a
lake** — the home you're financing. Airy, white, uplifting, premium architectural-viz look (like the
"Solar Energy Hero" on motionsites.ai, but brighter and calmer). Subtle life: a lake fountain, a few
gliding birds, shimmering water, drifting clouds.

## Composition rule (important)
The hero video sits **full-bleed behind centered headline text** with a soft white center scrim.
So compose every frame with **bright, calm negative space across the upper-center** (open sky / soft
light) for the headline, and put the house + lake in the **lower two-thirds**. Keep it bright and
clean — harmonize with the brand (cool blue water, soft mint-green lawn, white house, pale sky).

## Settings (Gemini → Videos)
Model **Pro** · **Landscape 16:9** · ~**8s** · 2–3 variations · keep the cleanest loop.
Workflow: make the **IMAGE** first (Gemini → Images / Nano Banana), then attach it in **Videos** and
paste the **MOTION** prompt. Output file → replace `public/video/hero.mp4` (+ make `hero.webm`).

---

## CONCEPT A — Modern townhouse by a calm lake (primary)

### IMAGE prompt (Nano Banana → first frame)
```
A premium 3D architectural visualization of a modern two-story townhouse beside a calm reflective
lake, on a bright sunny morning. Clean contemporary architecture: white render walls, warm wood
accents, large glass windows, a flat green lawn and neat landscaping with a few young trees. A small
elegant water fountain sprays gently in the lake; soft reflections shimmer on the water. The sky is
bright, soft and airy — pale blue fading to white — with lots of open, calm negative space across the
upper third of the frame for a headline. A few small birds in the distant sky. Soft natural sunlight,
gentle long shadows, ultra clean, fresh, uplifting and hopeful mood, photorealistic render, high
detail, shallow depth of field, premium real-estate aesthetic. Cool harmonious palette: soft blue
water, mint-green lawn, white house, pale sky. 16:9. No text, no logos, no people, no cars.
```

### MOTION prompt (Veo, with the image attached)
```
Bring the scene gently to life with calm, premium, cinematic motion: the lake water ripples and
shimmers softly, the fountain sprays a delicate continuous plume of water, a few birds glide slowly
across the bright sky, leaves and trees sway gently in a light breeze, and soft clouds drift. The
camera performs an extremely slow, smooth push-in toward the house. Bright, airy, hopeful, dreamlike,
barely-there motion. Seamless loop.
```
**Negative:** `text, words, logo, watermark, dark, night, moody, gloomy, neon, glitch, people, faces, fast motion, shaky camera, lens flare, low quality, distorted architecture`

---

## CONCEPT B — Small modern lakeside neighborhood (community feel)

### IMAGE prompt
```
A bright premium 3D architectural visualization, slightly elevated 3/4 aerial view of a small cluster
of modern townhouses arranged around a calm central lake with an elegant fountain. White and warm-wood
contemporary homes, neat green lawns, tidy tree-lined paths, a couple of parked cars in driveways.
Bright sunny day, soft pale-blue sky with airy white negative space in the upper third for a headline,
gentle reflections on the lake, fresh and aspirational mood, ultra clean, photorealistic render,
shallow depth of field, premium real-estate marketing aesthetic, cool harmonious palette (blue water,
mint-green lawns, white houses, pale sky). 16:9. No text, no logos, no people.
```

### MOTION prompt (Veo)
```
Animate gently and cinematically: the lake water shimmers and the central fountain sprays softly,
a few birds glide across the bright sky, trees sway in a light breeze, soft clouds drift, and a single
car slowly and smoothly pulls into a driveway in the distance. The camera does a very slow, smooth
aerial drift forward over the neighborhood. Bright, calm, hopeful, premium, subtle motion. Seamless loop.
```
**Negative:** same as Concept A.

---

## CONCEPT C — Single dream home, golden-hour-soft but bright

### IMAGE prompt
```
A premium 3D architectural visualization of a single modern dream home with a small reflecting pond
and fountain in the front garden, bathed in soft bright morning light. White and wood facade, large
glass windows reflecting the pale sky, lush manicured lawn, young trees. Bright airy pale sky with
open negative space in the upper third for a headline. Fresh, hopeful, premium, ultra clean,
photorealistic, shallow depth of field, cool-and-warm balanced palette, real-estate hero aesthetic.
16:9. No text, no logos, no people, no cars.
```

### MOTION prompt (Veo)
```
Subtle cinematic life: the pond ripples and the fountain sprays softly, reflections shimmer on the
glass windows, a few birds glide across the sky, trees sway gently, soft clouds drift, and warm
sunlight slowly shifts. The camera slowly pushes in toward the front door. Bright, calm, uplifting,
dreamlike, gentle motion. Seamless loop.
```
**Negative:** same as Concept A.

---

## Optional matching section videos (if you want to refresh loan/budget too)
- **Loan card** → a slow cinematic orbit around a single modern house with a glowing path/driveway.
- **Budget card** → a clean flat-lay top-down of a tidy modern home exterior with garden plots
  "organizing" (or keep the current pastel-bubble clip).
Ask and I'll write full image-to-video prompts for these as well.

## After you generate
1. Download MP4 (1080p, 16:9) → rename `hero.mp4`.
2. Drop into `public/video/` (replace the old one). I'll regenerate `hero.webm`, remove any
   watermark via crop, tune the scrim/opacity for the new scene, and re-verify with Playwright.
3. Grab one bright still frame too if you like → I'll use it as the poster.

## Tips
- If text legibility suffers, regenerate the IMAGE with **more open bright sky in the upper-center**.
- Keep motion subtle ("barely-there", "gentle", "slow") — premium, not busy.
- Want snow / autumn / dusk variants later? Same prompts, swap the season/light words.
