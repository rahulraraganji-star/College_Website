# Hyperframes Composition Brief: Fr. Agnel College CMS (Reference Motion System)

## Objective
Art-direct and engineer a high-end software commercial for Fr. Agnel College CMS, faithfully recreating the motion-design style, 3D perspective panels, multi-panel carousel, angled isometric compositions, and light/dark contrast pacing demonstrated in the reference video (`vidssave.com Website Design Template Video Promotion`).

## Output Parameters
- Directory: `brag-output-reference/composition/`
- Rendered video: `brag-output-reference/brag.mp4`
- Aspect ratio / format: Landscape 1920x1080 @ 30fps
- Target Duration: 28.70 seconds (matching reference audio down to sub-second precision)

## Visual Design Tokens
- **Dark Studio Background**: `radial-gradient(circle at 50% 35%, #182032 0%, #090d16 65%, #05070c 100%)`
- **Light Studio Background**: `linear-gradient(135deg, #f0f1f4 0%, #e2e4e8 100%)`
- **Window Chassis (Dark Mode)**: `background: #0f131a; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 35px 90px -20px rgba(0,0,0,0.85);`
- **Window Chassis (Light Mode)**: `background: #ffffff; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 30px 80px -15px rgba(0,0,0,0.18);`
- **Typography Primary**: `#ffffff` (Dark scenes), `#111827` (Light scenes)
- **Typography Muted**: `#94a3b8` (Dark scenes), `#64748b` (Light scenes)
- **Accent Gold**: `#d4af37` / `#f59e0b` (Crest & institutional badge)
- **Status Emerald**: `#10b981` (Live health & deployment indicators)

## Technical Constraints & Hyperframes Rules
1. Use vanilla HTML, CSS, and GSAP timeline inside `index.html`.
2. Do not use floating generic SaaS cards or repetitive crossfades.
3. Every screen shown is an authentic, high-resolution capture of the running CMS or public website.
4. Real browser chassis with macOS window control dots, titlebar breadcrumbs, and exact URL bar anchors.
5. All mock chrome text (URLs, breadcrumbs) marked with `data-layout-ignore` to pass layout audits.
6. Audio contract specifies `assets/audio/soundtrack.mp3` with explicit `data-duration="28.70"` and tactile SFX triggers.
7. Must pass `npx hyperframes check` with 0 errors and full WCAG AA contrast compliance.
