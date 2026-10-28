---
name: The Spatial Archive
description: A fullscreen warm 3D world for 27 creative AI works.
colors:
  world: "#c89472"
  ink: "#342318"
  ink-muted: "#5c4030"
  paper: "#eee6d8"
  dark: "#191816"
  dark-surface: "#23211e"
  text: "#eee8de"
  muted: "#b8ada0"
  line: "#40382f"
  accent: "#edab7b"
typography:
  display:
    fontFamily: "Departure, Geist Mono, monospace"
    fontSize: "clamp(25px, 2.4vw, 38px)"
    fontWeight: 400
    lineHeight: 1.17
    letterSpacing: "-0.025em"
  label:
    fontFamily: "Departure, Geist Mono, monospace"
    fontSize: "11px"
    letterSpacing: "0.06em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
  prompt:
    fontFamily: "Geist Mono, monospace"
    fontSize: "12px"
    lineHeight: 1.9
  prompt-touch:
    fontFamily: "Geist Mono, monospace"
    fontSize: "13px"
    lineHeight: 1.85
  search-touch:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "16px"
rounded:
  action: "5px"
  utility: "50%"
  work-dialog: "12px"
  index-dialog: "10px"
spacing:
  desktop-edge: "36px"
  mobile-edge: "20px"
  detail-padding: "34px 34px 24px"
components:
  view-work:
    backgroundColor: "#33251c"
    textColor: "#f3dfc5"
    rounded: "{rounded.action}"
    padding: "17px 18px"
    height: "50px"
  view-work-hover:
    backgroundColor: "#513526"
  utility:
    backgroundColor: "#39261b"
    textColor: "#f1dec6"
    rounded: "{rounded.utility}"
    width: "36px"
    height: "36px"
  utility-touch:
    width: "44px"
    height: "44px"
---

## Overview

**Creative North Star: "The Spatial Archive"**

The user's reference is bryangarage.dev/showcase. The default experience is one fullscreen, navigable 3D world: peach atmosphere, burnt orange terrain, dimensional dark project tiles and precise pixel typography. The portfolio uses its own supplied work and identity.

**Key Characteristics:**

- Warm atmospheric space.
- Sculpted artifact tiles.
- Compact navigation at the viewport edges.
- Artwork and reconstructed prompts inspected together.

## Colors

Warm peach fills the world and fog; brown ink keeps navigation legible. Charcoal surfaces and warm off-white text distinguish focused inspection. Peach accent supports active detail controls. The submitted artwork retains its own colors.

## Typography

Self-hosted Departure Mono gives the spatial title and navigation their pixel character. Geist carries artwork titles and prose in the inspection dialog; Geist Mono carries prompts and metadata. The spatial display reduces to 23px on phones, with additional compact-height treatment. Prompt text remains 12px with generous line spacing.

## Layout

The world occupies 100dvh; the document itself does not scroll. Identity and utilities sit at the top, the selected work title at upper left, categories above the lower travel timeline, and the open-work action at lower right. There is no landing hero, default catalogue grid or long footer.

On desktop, the work dialog has independent artwork and notes columns in a 1.15:1 ratio. On phones at 767px and below, it fills the viewport and stacks artwork before notes in one scrolling area. Coarse-pointer tablets at 768–900px also stack inspection; wider tablet landscape layouts retain the two-column view. The Index is a focused searchable overlay. Categories scroll horizontally on phones; at short phone heights they remain available through Index. Additional compact and wide adjustments occur at 1100px and 1700px; the smallest phone adjustment is 360px.

Touch-capable layouts use safe-area insets and at least 44px primary touch targets. The viewport permits edge-to-edge rendering with viewport-fit=cover. The Index uses a 16px touch search field and visualViewport dimensions to stay within the visible area when a software keyboard reduces it. Short tablet landscape views pull the camera back to preserve the selected artifact within the available height.

## Elevation & Depth

Real Three.js geometry supplies beveled project bodies, inset artwork, side material, perspective, fog, directional light and contact shadows. Neighboring works recede along a circular rail. Music and podcast artifacts include dimensional vinyl details. Fine grain and restrained utility shadows belong to the same warm material world.

The living atmosphere uses two depth-tested particle layers: 700 bronze and cream motes on desktop, 420 on coarse-pointer tablets, and 230 below the scene's 650px phone threshold. An instanced mesh adds ten small rotating brass fragments on desktop, eight on tablets and six on phones. Panels float gently and lift for mouse hover; fingers and pens do not drive scene hover or pointer parallax. Light and haze drift slowly. Travel creates a directional gust, a fading ground ripple and subtle camera inertia. Particle shaders soften the field around the central work and viewport controls so the artwork stays clear.

## Shapes

Project bodies are softly beveled and retain visible thickness. Main actions have small corners; circular utilities remain visually distinct. The desktop inspection dialog uses softly curved corners; mobile inspection uses the full screen. The Index uses a smaller rounded container.

## Components

Wheel, drag or swipe, previous/next controls, keyboard navigation and a range timeline move through the selected collection. Category controls filter the same spatial world. Clicking an artifact selects it, then opens the focused work dialog; its Prompt, Process and Reflection tabs preserve clear source disclosures. The searchable Index gives direct access to all 27 works.

Native audio/video controls, original downloads and external Suno links serve their respective formats. Sound starts off; the labelled Sound control enables locally synthesized, layered hover, travel, open, close and confirmation cues. Cue throttles and a six-voice limit bound overlap. Active voices stop during media playback and when the document is hidden.

The motion control and reduced-motion preference freeze ambient animation, remove animated travel and pointer response, and preserve instant navigation. Visible ambient rendering is configured to a 30fps cap on coarse-pointer devices, with interaction using the normal animation cadence. Paused or reduced-motion states draw on demand and hidden scenes suspend. Device pixel ratio is capped at 1.4 on touch tablets, 1.35 on phones and 1.65 on desktop; touch procedural textures use half resolution and artwork is capped at 1200px on tablets or 1024px on phones, versus 1400px on desktop. Nearby artwork loads first. These are configured bounds, not hardware frame-rate benchmarks.

Scene gestures track one active pointer and clean up on cancellation, lost capture and size/orientation changes. A fallback artifact view and Index preserve access when WebGL is unavailable. Dialogs use native focus handling, visible focus outlines and Escape dismissal.

## Do's and Don'ts

- Preserve all 27 supplied catalogue works and their source links.
- Keep reconstructed prompts, observed metadata and proposed workflows distinct.
- Preserve original Pages download and recovered narrative disclosures.
- Keep inspection inside the page and return visitors to their spatial selection.
- Respect reduced motion and keyboard access.
- Do not reintroduce a scrolling landing page, default grid or long footer.
- Do not invent original prompt history, confirmed tool usage, assessment results or institutional affiliation.
- Do not copy the reference creator's identity or content.
