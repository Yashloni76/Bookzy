---
name: Slotpe Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#434655'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#515659'
  on-tertiary: '#ffffff'
  tertiary-container: '#696e71'
  on-tertiary-container: '#edf1f5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dfe3e7'
  tertiary-fixed-dim: '#c3c7cb'
  on-tertiary-fixed: '#171c1f'
  on-tertiary-fixed-variant: '#43474b'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for **trust, efficiency, and clarity**. It caters to Indian small business owners who require a professional digital presence without the complexity of enterprise software. The aesthetic is rooted in **Modern Minimalism** with a focus on high legibility and spaciousness to reduce cognitive load during administrative tasks.

The emotional response should be one of **calm competence**. By utilizing generous whitespace and a restricted color palette, the interface stays out of the way, allowing the appointment data and customer interactions to take center stage. The style avoids trendy gimmicks in favor of a "utility-first" premium feel—similar to high-end productivity tools but localized for ease of use.

## Colors

The palette is anchored by **Action Blue**, a vibrant but professional primary color used exclusively for interactive elements and key brand moments. 

- **Primary:** Used for main actions, active states, and focus indicators.
- **Surface & Background:** A heavy reliance on pure white (`#FFFFFF`) for cards and containers, set against a subtle off-white background (`#F9FAFB`) to create soft, natural depth.
- **Text Hierarchy:** Dark Slate is used for primary headings to ensure high accessibility, while Slate Grays are used for secondary information and metadata.
- **Status Colors:** Standardized semantic colors for appointment statuses (e.g., Confirmed, Cancelled, Pending) to ensure immediate recognition.

## Typography

The typography system uses a pairing of **Geist** for headlines and **Inter** for body text. This combination provides a technical, precise look for numbers and scheduling data while maintaining extreme readability for names and notes.

- **Headlines:** Use Geist with slight negative letter-spacing for a modern, "Linear-like" aesthetic.
- **Body:** Inter is the workhorse for all interface text, ensuring clarity even at small sizes in dense booking tables.
- **Labels:** Use `label-sm` for table headers and category tags to create clear visual separation from data.

## Layout & Spacing

This design system utilizes a **12-column fluid grid** for desktop and a **single-column stack** for mobile. The layout philosophy is built on an 8px square grid to ensure consistent alignment.

- **Desktop:** 12 columns, 24px gutters, and 32px side margins. 
- **Mobile:** 16px side margins with flexible vertical stacking. 
- **Content Density:** Elements are spaced generously to prevent accidental clicks on mobile devices—vital for busy business owners managing appointments on the go.
- **Vertical Rhythm:** Use `spacing-lg` (24px) between distinct sections and `spacing-md` (16px) for internal card padding.

## Elevation & Depth

To maintain a clean and professional look, this design system avoids heavy shadows. Depth is communicated primarily through **Tonal Layering** and **Low-Contrast Outlines**.

- **Level 0 (Background):** `#F9FAFB` – The canvas.
- **Level 1 (Cards/Surfaces):** `#FFFFFF` with a 1px solid border of `#E5E7EB`.
- **Level 2 (Interactive/Floating):** Subtle ambient shadow: `0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)`.
- **Level 3 (Modals/Overlays):** Defined shadow: `0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)`.

Use borders rather than shadows to define the structure of lists and tables to keep the UI feeling "flat" and lightweight.

## Shapes

The shape language is **Rounded (0.5rem)**. This provides a balance between the "sharp" corporate look and a "soft" consumer look, making the software feel modern yet approachable.

- **Buttons & Inputs:** `0.5rem` (8px) for a standard, reliable feel.
- **Cards & Modals:** `1rem` (16px) to clearly define large content areas.
- **Chips/Badges:** `1.5rem` (24px) or full-pill to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Filled `Action Blue` with white text. High emphasis.
- **Secondary:** White fill with `1px` Slate-200 border and Slate-700 text.
- **Ghost:** No background or border; uses Primary Blue text for secondary actions like "Cancel" or "Clear".

### Inputs & Forms
- **Fields:** White background, 1px Gray-300 border. On focus: 1px Action Blue border with a 3px soft blue ring (20% opacity).
- **Labels:** Always positioned above the field in `body-sm` bold.

### Cards
- Used for booking summaries and dashboard stats. Features a 1px border (`#E5E7EB`) and `rounded-lg` corners. Avoid internal shadows unless the card is draggable.

### Tables & Lists
- Compact vertical padding (12px) with horizontal dividers only. Row hover state uses a subtle gray (`#F9FAFB`) to guide the eye.

### Chips & Badges
- Used for appointment status (e.g., "Confirmed"). Use a light tinted background of the status color with high-contrast text of the same hue (e.g., Light Green background with Dark Green text).