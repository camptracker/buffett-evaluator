# Mobile-First Web App Architecture

## Philosophy

This is a **mobile-first web app**, not a desktop site with mobile support.

- ✅ Designed for phones FIRST
- ✅ Enhanced for tablets and desktop
- ✅ Touch-optimized interactions
- ✅ Installable as PWA (Add to Home Screen)
- ✅ Offline-capable (future)

## Design Principles

### 1. Mobile-First CSS

Uses `min-width` media queries (not `max-width`):

```css
/* Base styles = mobile (320px+) */
body { font-size: 16px; }

/* Tablet enhancements (640px+) */
@media (min-width: 640px) {
  body { font-size: 18px; }
}

/* Desktop enhancements (1024px+) */
@media (min-width: 1024px) {
  body { font-size: 20px; }
}
```

### 2. Touch Targets

Minimum 44x44px tap targets (iOS Human Interface Guidelines):

- Buttons: 44px min-height
- Toggle controls: 44x44px
- Clickable rows: 48px min-height

### 3. Horizontal Scroll for Tables

Tables wider than viewport scroll horizontally (native mobile UX):

```html
<div class="table-wrapper">
  <table class="data-table">...</table>
</div>
```

Users swipe left/right for wide data tables.

### 4. Vertical-First Layouts

- Single column by default
- Stack elements vertically
- Use CSS Grid/Flexbox column layouts only on larger screens

### 5. Progressive Enhancement

Each breakpoint ADDS features, never removes:

| Screen Size | Enhancements |
|-------------|--------------|
| 320px+ (mobile) | Base experience |
| 640px+ (large phone/small tablet) | Larger fonts, 2-column grids |
| 768px+ (tablet) | Horizontal layouts, inline labels |
| 1024px+ (desktop) | Multi-column grids, wider content |

## PWA Features

### Installable

Add to Home Screen on iOS/Android via `manifest.json`:

```json
{
  "name": "Buffett Evaluator",
  "display": "standalone",
  "start_url": "/index-agents.html"
}
```

### App-Like Experience

When installed:
- ✅ Launches in full screen (no browser UI)
- ✅ Appears in app drawer/home screen
- ✅ Custom splash screen
- ✅ Themed status bar

### Meta Tags

```html
<meta name="theme-color" content="#667eea">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="manifest" href="manifest.json">
```

## Responsive Breakpoints

| Breakpoint | Device | Grid Columns | Font Size |
|------------|--------|--------------|-----------|
| 320px | Small phone | 1 | 16px |
| 640px | Large phone | 1-2 | 18px |
| 768px | Tablet | 2-3 | 18px |
| 1024px | Desktop | 3-4 | 20px |

## Touch Interactions

### No Hover States

Mobile has no hover → use `:active` instead:

```css
.button:active {
  background: #5568d3;
}
```

### Tap Highlight

Custom tap highlight color (iOS/Android):

```css
-webkit-tap-highlight-color: rgba(255,255,255,0.1);
```

### Scroll Performance

Smooth native scrolling:

```css
overflow-x: auto;
-webkit-overflow-scrolling: touch; /* iOS momentum scrolling */
```

## Typography

### Mobile-Optimized Sizes

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Body | 16px | 18px | 20px |
| H1 | 1.5rem | 1.8rem | 2.5rem |
| H2 | 1.1rem | 1.3rem | 1.5rem |
| Small text | 0.85rem | 0.9rem | 0.95rem |

### Line Height

- Body text: 1.6-1.8 (easier reading on small screens)
- Headings: 1.2-1.4

## Performance

### Critical CSS

Inline critical CSS for above-the-fold content (future optimization).

### Lazy Load Images

Load images only when scrolled into view (future).

### Code Splitting

Load agent data on-demand, not all upfront (future).

## Testing

### Device Matrix

Test on:
- ✅ iPhone SE (320px width)
- ✅ iPhone 14 Pro (393px width)
- ✅ iPad Mini (768px width)
- ✅ Android phones (360px-414px typical)

### Browser Testing

- Safari iOS (primary)
- Chrome Android
- Chrome Desktop
- Safari Desktop

## Future Enhancements

- [ ] Service Worker for offline capability
- [ ] App icons (192x192, 512x512)
- [ ] Background sync for data updates
- [ ] Push notifications for new evaluations
- [ ] Dark mode toggle (system preference detected)
- [ ] Gestures (swipe between agents)

---

**Philosophy**: If it doesn't work great on a phone, it doesn't ship.
