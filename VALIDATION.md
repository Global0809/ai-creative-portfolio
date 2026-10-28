# Validation

## Current tablet optimization

- Default: one fullscreen 3D archive with warm peach atmosphere, dimensional project tiles and viewport navigation.
- Collection: the existing 27-work catalogue is retained across six categories.
- Travel: wheel, drag/swipe, keyboard, previous/next and range timeline; category selection filters the spatial collection.
- Inspection: in-page work dialog, artwork beside Prompt / Process / Reflection on desktop and stacked on mobile.
- Direct access: searchable Index overlay with category filters.
- Accessibility and resilience: visible focus, native dialogs, reduced-motion handling, explicit sound opt-in, media sound suppression and WebGL fallback.
- Atmosphere: two depth-tested 3D mote layers; desktop 700 particles / 10 fragments, coarse-pointer tablet 420 / 8, phone below 650px 230 / 6. Buoyant panels, mouse hover lift, drifting lights and haze, navigation gusts, ground ripple and camera inertia remain.
- Sound: explicit opt-in; locally synthesized hover, travel, open, close and confirmation cues, throttled playback and a six-voice overlap limit. Media playback and hidden-document transitions silence active voices.
- Touch layout: safe-area offsets, 44px primary controls, stacked inspection at 768–900px, wider landscape columns, short-landscape camera pullback, 16px Index search and visualViewport keyboard fit.
- Gestures: active-pointer ownership, cancellation, lost-capture and size/orientation cleanup; no scene hover from fingers or pens.
- Performance: coarse-pointer ambient rendering configured to a 30fps cap with normal interaction cadence. Tablet DPR cap 1.4, half-resolution procedural textures and 1200px artwork; phone DPR cap 1.35 and 1024px artwork. Desktop profile remains unchanged. Paused/reduced views draw on demand and hidden views suspend. No hardware frame-rate benchmark has been performed.

These points describe the current touch optimization. Current emulation checks appear below; v2 and v3 results remain historical evidence.

## Known limits

Original generation prompts and confirmed tool histories were unavailable; displayed prompts are clearly identified reconstructions and process notes are proposed workflows. Podcast speech has not been independently transcribed. Source-asset factual claims are not presented as independently verified. Suno playback opens on its own site. The Pages file retains its original download; only the first page has an embedded rendered preview, with later narrative supplied through recovered text.

## v2 QA results (historical)

- Production build and JavaScript syntax checks passed.
- Default page is exactly one viewport; hero, long grid and scrolling footer are absent.
- Previous from work 01 wraps to 27; next returns to 01. Timeline End reaches work 27.
- Wheel and swipe/drag change the selected work. Category filtering gives five songs; the Index exposes all 27 works.
- Prompt / Process / Reflection tabs and tab arrow keys work. Prompt copy placed 845 characters on the clipboard.
- Exact Suno links verified; Enter search opens and retains the selected work.
- Native podcast playback confirmed at 377.208 seconds duration; native video playback confirmed at 94.761 seconds duration.
- Empty search recovery returns to all 27 results.
- No document overflow at 320x568, 390x844 or 430x932. Desktop, mobile, inspection and Index screenshots reviewed.
- Reduced motion starts with ambient movement disabled; next-work navigation remains functional.
- All source prompt/provenance disclosures and original asset links retained.
- Independent final visual review recorded in the task before deployment.

## v3 QA results (historical)

- Audio render check completed by the parent task: all five cue types rendered through OfflineAudioContext, peak amplitudes 0.0135–0.0533, zero tails and no clipping.
- Source inspection confirms bounded particle draw ranges, visibility gating, paused/reduced-motion demand drawing, sound throttles, six-voice cap and media/visibility silence handlers.
- Desktop 1440x1000 and phone 390x844 captures reviewed. No document overflow at 320x568, 390x844 or 430x932.
- Browser reported 700/230 particles and 10/6 fragments, with no page errors. Previous wraps 01 to 27; keyboard next returns to 01. Songs filter returns five works; Index search opens Flavours of India with its exact source URL, and Process remains usable.
- Pause produced identical canvas captures and zero WebGL draws after settling; active ambient motion changed the captures. Simulated hidden-document visibility handling produced zero draws. Dynamic reduced-motion preference paused the scene and disabling the preference resumed it; navigation remained usable.
- Sound opt-in created a running AudioContext, and Sound off suspended it. No new cue sources were created while the Cars podcast played, including during a Process-tab action.
- Independent final visual and source review: Ship, no essential fixes.
- Production Vite build and JavaScript syntax checks passed.

## Tablet QA results

The parent task performed these checks in Chromium with hasTouch and DPR 2 emulation; they are not physical iPad Safari results.

- Eleven portrait, landscape and split layouts passed: 744×1133, 1133×744, 768×1024, 1024×768, 820×1180, 1180×820, 834×1194, 1194×834, 1024×1366, 1366×1024 and 507×1024. No document overflow; primary targets measured at least 44px.
- CDP touch swipe moved work 01 to 02; active-card tap opened inspection. Cancellation and rotation returned the pointer state to idle. Narrow portrait inspection used block flow; 1024px landscape used a grid.
- Simulated visualViewport height 480px kept Index within the visible area: top 12px, bottom 358px, search font 16px, no overflow.
- Native video playback confirmed at 94.7606 seconds duration.
- The 320×568 phone header fit without document overflow; the 1440px desktop retained its desktop profile. No page errors were reported.
- Multi-touch ownership passed with the corrected CDP touch-end protocol: the primary pointer remained owner when the second finger started and ended, its drag continued from work 01 to 02, then the gesture returned to idle.
- Independent final visual and source review: Ship, no essential fixes.
- Current production Vite build and JavaScript syntax checks passed.

Physical iPad Safari, the native software keyboard, actual GPU frame rate and thermal behavior have not been tested. The 30fps touch ambient value is a configured cap, not measured device performance.
