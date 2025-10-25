# MagicViet Landing Page

A pixel-perfect, responsive landing page built with React, Vite, and Tailwind CSS.

## Features

- 🎨 Clean, modern design with grayscale color palette
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Fast performance with Vite
- 🎯 Accessible with keyboard navigation
- 🌊 Smooth scrolling and hover effects
- 🖼️ High-quality Unsplash images
- 🎭 Heroicons for UI icons

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Icon library
- **Inter Font** - Typography

## Getting Started

### Prerequisites

- Node.js 16+ and npm (or yarn)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The development server will start at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   └── Card.jsx          # Reusable card component
│   ├── Header.jsx             # Sticky header with nav
│   ├── Hero.jsx               # Hero section with search
│   ├── Highlights.jsx         # Three highlight cards
│   ├── SeasonsHoiAn.jsx       # Seasonal information
│   ├── Promotions.jsx         # Active promotions grid
│   ├── WeatherBanner.jsx      # Weather forecast banner
│   ├── Reviews.jsx            # Customer testimonials
│   └── Footer.jsx             # Footer with links
├── App.jsx                    # Main app component
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## Sections

1. **Header** - Sticky navigation with mobile menu
2. **Hero** - Large headline with search functionality
3. **Highlights** - Three feature cards
4. **Seasons** - Hoi An seasonal guide
5. **Promotions** - Special offers and deals
6. **Weather** - Weather forecast banner
7. **Reviews** - Customer testimonials
8. **Footer** - Links and social media

## Responsive Breakpoints

- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns, max-width 1150px)

## Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Proper heading hierarchy

## Performance

- Optimized images from Unsplash CDN
- Lazy loading for images
- Tree-shaking with Vite
- Minimal JavaScript bundle
- CSS purging in production

## License

MIT

## Author

Built with ❤️ for MagicViet
