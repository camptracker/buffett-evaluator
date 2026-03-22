# App Icons TODO

The PWA manifest references app icons that need to be created:

## Required Icons

1. **icon-192.png** (192x192px)
   - Used for Android home screen
   - Used for iOS splash screen
   - Purpose: any maskable

2. **icon-512.png** (512x512px)
   - Used for Android splash screen
   - Used for higher-res displays
   - Purpose: any maskable

## Icon Design

Suggested design:
- Background: Purple gradient (#667eea to #764ba2)
- Symbol: 📊 or "B" for Buffett
- Text: None (icon should be recognizable at small sizes)
- Style: Flat, minimal, modern

## Tools

Generate icons using:
- Figma / Adobe Illustrator
- Canva (free)
- PWA Asset Generator: https://www.pwabuilder.com/imageGenerator
- Or use this SVG as base:

```svg
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="100"/>
  <text x="50%" y="55%" font-size="280" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system, sans-serif">B</text>
</svg>
```

## Temporary Fallback

Until icons are created, browsers will:
- Use first letter of site name ("B")
- Use generic placeholder icon
- Site will still install, just without custom icon

## Adding Icons

Once created:
1. Save as `icon-192.png` and `icon-512.png`
2. Place in root directory (same level as index-agents.html)
3. Verify in manifest.json references are correct
4. Test on iOS Safari and Android Chrome
