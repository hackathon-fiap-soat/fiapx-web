---
name: FIAP X Video Engine
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5c3f42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#916e72'
  outline-variant: '#e5bcc0'
  surface-tint: '#bd0045'
  primary: '#b80043'
  on-primary: '#ffffff'
  primary-container: '#e60756'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb2bb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#0051d5'
  on-tertiary: '#ffffff'
  tertiary-container: '#316bf3'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9dd'
  primary-fixed-dim: '#ffb2bb'
  on-primary-fixed: '#400012'
  on-primary-fixed-variant: '#910033'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The visual identity positions this platform as a high-performance, enterprise-grade video processing and frame extraction infrastructure built for engineering accuracy and academic rigor. The interface adheres to an engineered minimalism aesthetic: clean, structural, and distraction-free, letting status indicators, pipeline telemetry, and media assets remain primary.

Key stylistic characteristics:
- **Engineered Minimalism:** Generous structural white space combined with dense, informative data displays for processing jobs.
- **Architectural Precision:** Subtle hairline dividers, crisp card boundaries, and clear vertical flow to convey stability and processing speed.
- **Controlled Vibrancy:** Neutral canvas punctuated by FIAP's authoritative signature magenta exclusively for primary actions, critical brand touchpoints, and active system signals.

## Colors

The palette balances the high-energy FIAP Magenta brand accent with Slate-derived architectural neutrals and dedicated system semantic states.

### Core Architecture
- **Primary (`#ED145B`):** Brand anchor. Used for primary CTAs, active focus indicators, primary progress fill, and key telemetry landmarks.
- **Secondary (`#0F172A`):** Deep slate foundation. High-contrast typography, top-level navigation anchors, and technical framing.
- **Tertiary (`#2563EB`):** Pipeline accent. Used for queue statuses, upload actions, and interactive metadata links.
- **Neutral (`#64748B`):** Structural balance. Muted text, empty states, metadata captions, and secondary framing.

### Background & Surface Hierarchy
- **Canvas Base:** `#F8FAFC` (Slate 50) creates a soft, eye-resting foundation.
- **Surface Elevation (Cards/Panels):** `#FFFFFF` (Pure White).
- **Subtle Dividers & Borders:** `#E2E8F0` (Slate 200).
- **Subtle Surface Tint:** `#F1F5F9` (Slate 100) for table headers, inactive tracks, and nested metadata blocks.

### Video Pipeline Status Palette
Each job state requires high-contrast accessibility across badges, progress tracks, and inline indicators:
- **`PENDING_UPLOAD`:** Text `#475569`, Background `#F1F5F9`, Border `#CBD5E1`.
- **`UPLOADED` / `QUEUED`:** Text `#1D4ED8`, Background `#EFF6FF`, Border `#BFDBFE`.
- **`PROCESSING`:** Text `#B45309`, Background `#FFFBEB`, Border `#FDE68A`.
- **`COMPLETED`:** Text `#047857`, Background `#ECFDF5`, Border `#A7F3D0`.
- **`FAILED`:** Text `#BE123C`, Background `#FFF1F2`, Border `#FECDD3`.
- **`EXPIRED`:** Text `#475569`, Background `#F8FAFC`, Border `#E2E8F0`.

### Dark Mode Inversion Strategy
When transitioning to dark mode:
- Canvas shifts to `#090D16`, cards and surfaces to `#0F172A`, borders to `#1E293B`.
- Primary typography becomes `#F8FAFC`, secondary becomes `#94A3B8`.
- Status badge backgrounds shift to 15% opacity fills with boosted text luminosity to maintain WCAG AAA compliance.

## Typography

The typography pairings serve dual needs: editorial clarity and developer-grade telemetry.

- **Headlines (`Hanken Grotesk`):** Clean, geometric, contemporary sans-serif engineered for clarity, giving dashboards and summary banners an authoritative presence without feeling heavy.
- **Body & Controls (`Inter`):** Hyper-legible UI workhorse ensuring optimal legibility inside dense processing queues, modal dialogs, and configuration inputs.
- **Technical & Timestamps (`JetBrains Mono`):** Dedicated to technical data points—video resolutions (e.g., `1920x1080@60fps`), SHA hashes, extraction timestamps (`00:04:23.120`), and status badges.

## Layout & Spacing

The layout is built on an adaptive 12-column grid prioritizing data density, scanning speed, and dashboard observability.

### Grid & Breakpoints
- **Desktop (>= 1280px):** 12-column fluid grid. Max content width of 1440px centered, with `margin` of `2rem` and `gutter` of `1.5rem`.
- **Tablet (768px - 1279px):** 8-column layout. Side navigation collapses to an icon bar. Outer margins scale to `1.5rem`.
- **Mobile (< 768px):** 4-column layout. Navigation shifts to a sticky bottom app bar or compact top app bar. Outer margin scales down to `1rem` (`margin-mobile`), with `gutter-mobile` set to `1rem`.

### Spacing Cadence
- Use `space-xs` (4px) and `space-sm` (8px) for tightly coupled items: badge icon offsets, input hints, metadata clusters.
- Use `space-md` (16px) for standard component padding (input field internal padding, table row spacing, list separations).
- Use `space-lg` (24px) for card body padding and metric grid gaps.
- Use `space-xl` (32px) for page section divisions and modal borders.

## Elevation & Depth

Visual hierarchy relies on structural hairline boundaries (`#E2E8F0`) augmented by ultra-subtle ambient drop shadows. Floating panels and interactive states lift without heavy Skeuomorphism.

- **Flat / Ground Level (Canvas):** `#F8FAFC`. Zero elevation.
- **Resting Cards & Table Rows:** `#FFFFFF` with `1px solid #E2E8F0` and subtle shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Interactive Hover / Focus State:** Surface elevates with an active border highlight or subtle scale; shadow expands to: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.03)`.
- **Modals, Drawer Overlays, and Job Inspectors:** Layered above backdrop blur (`backdrop-blur-sm` over `rgba(15, 23, 42, 0.4)`), elevated by: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The design system employs a soft, balanced geometric radius (Level 2) that pairs structural precision with ergonomic modern software aesthetics.

- **Micro Controls (Buttons, Inputs, Checkboxes):** Rounded at `0.5rem` (8px) to offer accessible, friendly tap/click targets.
- **Cards & Data Modules (`rounded-xl`):** `1rem` (16px) for dashboard cards, processing panels, and upload drop zones.
- **Hero Containers & Large Modals (`rounded-2xl`):** `1.5rem` (24px) for prominent media preview modals, global frame inspectors, and hero drag-and-drop video regions.
- **Status Badges & Metrics Tags:** Pill-shaped (`9999px`) for state indicators to maintain distinct recognition against rectilinear cards.

## Components

### Buttons
- **Primary:** Background `#ED145B`, text `#FFFFFF`, font `Inter` Medium (`label-lg`). Hover: `#D40F50`. Focus: `2px` offset ring in `#ED145B`. Active: `#BA0C44`.
- **Secondary:** Background `#FFFFFF`, border `1px solid #E2E8F0`, text `#0F172A`. Hover: `#F8FAFC`, border `#CBD5E1`.
- **Ghost / Tertiary:** Background transparent, text `#64748B`. Hover: `#F1F5F9`, text `#0F172A`.
- **Destructive:** Background `#FFF1F2`, border `1px solid #FECDD3`, text `#BE123C`. Hover: `#FFE4E6`.

### State Badges (Video Processing States)
Badges have a standard height of 24px, pill-shape radius (`rounded-full`), with `JetBrains Mono` 11px uppercase typography (`code-sm`), padding `0.25rem 0.625rem`, displaying an inline status dot (6px) or mini-spinner:
- **`PENDING_UPLOAD`:** Background `#F1F5F9`, border `#CBD5E1`, text `#475569`. Dot: `#94A3B8`.
- **`UPLOADED` / `QUEUED`:** Background `#EFF6FF`, border `#BFDBFE`, text `#1D4ED8`. Dot: `#3B82F6`.
- **`PROCESSING`:** Background `#FFFBEB`, border `#FDE68A`, text `#B45309`. Accompanied by a 10px animated amber spinner (`#D97706`).
- **`COMPLETED`:** Background `#ECFDF5`, border `#A7F3D0`, text `#047857`. Dot: `#10B981`.
- **`FAILED`:** Background `#FFF1F2`, border `#FECDD3`, text `#BE123C`. Dot: `#F43F5E`.
- **`EXPIRED`:** Background `#F8FAFC`, border `#E2E8F0`, text `#64748B`. Dot: `#94A3B8`.

### Input Fields & Upload Dropzone
- **Text & Select Inputs:** Height 40px, border `1px solid #E2E8F0`, surface `#FFFFFF`, text `#0F172A`, placeholder `#94A3B8`. Focus state shifts border to `#ED145B` with subtle outline ring `rgba(237, 20, 91, 0.15)`.
- **Dropzone (Upload Target):** Dashed border `2px solid #CBD5E1`, border-radius `rounded-2xl`, background `#FFFFFF`. Active drag state transitions border to `#ED145B` with background `rgba(237, 20, 91, 0.02)`.

### Cards & Media Panels
- Container with `rounded-xl` (16px), background `#FFFFFF`, border `1px solid #E2E8F0`. Padding `space-lg` (24px).
- Internal video frame preview cards include an image container with `rounded-lg` (8px), a dark scrim on hover, and an overlay tag displaying the exact frame timestamp in `JetBrains Mono`.

### Progress Bar (Frame Extraction Telemetry)
- 6px track height, background `#F1F5F9`, `rounded-full` overflow hidden.
- Active fill uses FIAP Magenta (`#ED145B`) with an animated indeterminate sweep for active encoding or deterministic width transition for extracted frame percentages.