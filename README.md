# AI Creative Portfolio

[Open the public website](https://global0809.github.io/ai-creative-portfolio/)

A public, no-login 3D portfolio. This repository contains the editable source and supplied coursework; GitHub Pages serves the production build from the `gh-pages` branch.

A complete immersive portfolio with 27 supplied works across six forms: 9 infographics, 2 AI images, 4 video explainers, 6 podcasts, 5 Suno songs and 1 newsletter.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Build with `npm run build`; preview the production build with `npm run preview`. Serve the site through HTTP: ES modules and the catalogue do not load by double-clicking index.html.

The site uses `/ai-creative-portfolio/` as its base path in development, preview and production. Catalogue images, media and downloads resolve relative to that base; external Suno links retain their original URLs. Publish the contents of `dist/` on `gh-pages`, including the `.nojekyll` file copied from `public/`. Repository Pages settings use that branch at `/`.

## Edit

- `public/portfolio-catalog.json`: titles, descriptions, prompts, workflows, reflections and media paths.
- `src/main.js`: portfolio, search, detail views and interaction cue bindings.
- `src/scene.js`: Three.js gallery, materials, camera and controls.
- `src/sound.js`: original synthesized interaction cues and audio lifecycle.
- `src/style.css`: layout, fonts, palette and responsive rules.
- `public/AI Songs/`: all five song shortcuts, plain-text links and song catalogue.

## Academic presentation

Prompts are clearly marked as reconstructed creative briefs. They are not claimed to be original prompt logs. Song briefs use the published Suno style metadata as evidence; the short source tags and source links are shown separately. Proposed workflows explain plausible methods rather than inventing a verified creation history. Original platform statistics and reporting claims remain part of the supplied coursework and have not been independently fact-checked.

The Pages document provides an embedded first-page preview. Its recovered article narrative is readable on the site; the original Pages file is downloadable. Browser playback copies are labelled as such. Song audio opens on the original Suno page.

## Experience

The default site is a single full-screen 3D archive. There is no scrolling landing page or grid. Scroll, drag, swipe, use arrows, or move the timeline to travel through all 27 works. Filter by creative form or open the searchable Index with Ctrl/Cmd+K.

Click the active artifact or View work & prompt to open an in-page inspection. Desktop shows the work beside its prompt. Process and Reflection tabs reveal the proposed workflow and evidence. Escape returns to the same place in the 3D world. Audio and video use native controls; songs open their original Suno pages.

The living 3D atmosphere includes depth-tested bronze and cream motes, rotating brass fragments, buoyant panels, mouse hover lift, drifting light and haze. Travel adds a directional gust, ground ripple and subtle camera inertia. The motion toggle and reduced-motion preference preserve instant navigation with a static atmosphere. WebGL fallback keeps the same single-screen navigation with an artwork preview.

Sound starts off. Enable the labelled Sound control for original, locally synthesized hover, travel, open, close and confirmation cues. Playback is throttled and limited to six overlapping voices; cues quiet immediately when native media starts or the document becomes hidden. No sound recordings or music beds are downloaded.

Ambient rendering continues while motion is enabled and the scene is visible. Coarse-pointer devices have a configured 30fps ambient cap; active gestures and transitions use the normal animation cadence. Paused and reduced-motion views draw on demand; hidden scenes suspend rendering. This is a scheduling configuration, not a hardware benchmark.

## iPad and touch support

Touch quality uses `(any-pointer: coarse)`, including an iPad with a connected trackpad. The phone profile applies below 650px; wider touch layouts use the tablet profile.

| Profile | Motes / fragments | DPR cap | Artwork maximum | Procedural texture scale |
| --- | --- | --- | --- | --- |
| Desktop | 700 / 10 | 1.65 | 1400px | 1 |
| Touch tablet | 420 / 8 | 1.4 | 1200px | 0.5 |
| Phone below 650px | 230 / 6 | 1.35 | 1024px | 0.5 on touch devices |

Touch controls use at least 44px primary targets and safe-area offsets. Inspection stacks at narrow tablet widths of 768–900px; wider landscape tablets keep artwork beside notes. Short landscape views pull the camera back. Finger and pen gestures do not trigger scene hover; active-pointer ownership, cancellation, lost capture and orientation cleanup keep travel predictable.

The Index search input is 16px on touch devices. Its container follows visualViewport height and offset when a keyboard reduces the visible area. Chromium touch emulation covers the recorded tablet layouts and gestures; physical iPad Safari, the native software keyboard, GPU behavior and thermal performance remain untested. See VALIDATION.md for the exact evidence and remaining checks.

## Visual reference and credits

The user requested the typography, dark technical visual language and spatial immersion of https://bryangarage.dev/. This portfolio is a new implementation with the supplied coursework; it does not include the reference creator’s identity, project content or illustrations.

Fonts: Geist and Geist Mono (Vercel), Departure Mono (Helena Zhang). Icons: Phosphor. Three.js and GSAP power the spatial and motion layers. Source and license links are recorded in ASSET-PROVENANCE.json.
