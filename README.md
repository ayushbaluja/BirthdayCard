# 🌻 Birthday Sunflower

A premium interactive birthday website crafted with love. This cinematic experience features 9 beautifully animated scenes, interactive elements, and a warm sunflower-themed aesthetic.

## Features

- **9 Interactive Scenes**: Loading → Landing → Gift Box → Scrapbook → Sunflower Garden → Timeline → Cake → Letter → Finale
- **Canvas Particle Effects**: Golden particles, confetti, fireworks, petals, fireflies
- **Photo Gallery**: Scrapbook layout with polaroid frames, lightbox, and page navigation
- **Interactive Elements**: Clickable sunflowers, gift box unwrapping, candle blowing, envelope opening
- **Typewriter Letter**: Character-by-character reveal with handwritten font
- **Background Music**: Toggle-able ambient music with autoplay policy compliance
- **Dark Mode**: Light/dark theme toggle with localStorage persistence
- **Responsive Design**: Works on phones, tablets, and desktops (portrait + landscape)
- **60fps Animations**: requestAnimationFrame-powered, GPU-composited transforms
- **Accessibility**: ARIA labels, keyboard navigation, focus indicators, color contrast

## Bonus Features

- 🦋 **Cursor Butterflies**: Butterflies follow your mouse cursor
- 🌻 **Custom Cursor**: Blooming sunflower cursor on desktop
- 🎮 **Konami Code**: Enter ↑↑↓↓←→←→BA for a firework surprise
- 🔀 **Photo Shuffle**: Randomize photos in the scrapbook
- ⛶ **Fullscreen Mode**: Toggle fullscreen viewing
- 📊 **Loading Progress**: Real-time asset loading percentage

## File Structure

```
Birthday-Sunflower/
├── index.html          # Main HTML with all 9 scene sections
├── style.css           # Complete styles, themes, animations
├── script.js           # Full interactive logic (ES6 classes)
├── assets/
│   ├── photos/
│   │   ├── photo1.jpg
│   │   ├── photo2.jpg
│   │   ├── photo3.jpg
│   │   ├── photo4.jpg
│   │   ├── photo5.jpg
│   │   ├── photo6.jpg
│   │   ├── photo7.jpg
│   │   ├── photo8.jpg
│   │   ├── photo9.jpg
│   │   └── photo10.jpg
│   ├── music.mp3       # Background music
│   └── icons/          # UI icons (optional)
└── README.md           # This file
```

## Setup

1. Add your photos to `assets/photos/` (photo1.jpg through photo10.jpg)
2. Add background music as `assets/music.mp3`
3. Open `index.html` in a browser

The site works directly from the file system — no build tools or server required.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| → / ↓ | Next scene |
| ← / ↑ | Previous scene |
| Escape | Close lightbox/overlay |
| ↑↑↓↓←→←→BA | Konami code surprise |

## Deployment

### GitHub Pages

1. Push the `Birthday-Sunflower/` folder to a GitHub repository
2. Go to Settings → Pages
3. Set source to the branch containing your files
4. Select the folder (root or `/docs` if you moved files there)
5. Save — site will be live at `https://yourusername.github.io/repo-name/`

### Netlify

1. Drag and drop the `Birthday-Sunflower/` folder onto [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your Git repository and set publish directory to `Birthday-Sunflower/`
3. Site deploys automatically

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to the `Birthday-Sunflower/` folder
3. Run `vercel` and follow the prompts
4. Or import your GitHub repo at [vercel.com/new](https://vercel.com/new)

## Technology

- HTML5
- CSS3 (Custom Properties, Animations, Grid, Flexbox)
- Vanilla JavaScript (ES6 classes)
- Canvas API (particle systems)
- Google Fonts (Great Vibes, Poppins)
- No frameworks. No dependencies. No build step.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile Safari (iOS 13+)
- Chrome for Android

## Color Palette

| Color | Hex |
|-------|-----|
| Cream | #FFF8E8 |
| Golden | #F7C948 |
| Sunflower Yellow | #FFD54F |
| Leaf Green | #5E9B49 |
| Brown | #5A3E2B |
| White | #FFFFFF |

---

Made with 🌻
