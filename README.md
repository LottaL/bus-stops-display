# 🚌 Bus Stops Display - React PWA

A Progressive Web App (PWA) that displays real-time bus stop information and 6-hour weather forecasts for your location.

## Features

### 🚀 Core Features

- **Real-time Bus Stop Data**: Fetch nearest bus stops using the [Digitransit API](https://digitransit.fi/en/developers/apis/)
- **Weather Forecast**: 6-hour weather forecast using [Open-Meteo API](https://open-meteo.com/)
- **Progressive Web App**: Works offline with service worker caching
- **Location-based**: Automatically detects your location (with fallback to Helsinki)
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Auto-refresh**: Bus stops refresh every 30 seconds, weather every 10 minutes

### 📱 PWA Capabilities

- Install as native app on mobile and desktop
- Works offline with cached data
- Installable via `manifest.webmanifest`
- Service worker for background sync and caching
- Automatic updates

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Vite PWA Plugin** - PWA integration with Workbox
- **Axios** - HTTP client
- **CSS3** - Modern styling with gradients and grid

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn
- **Digitransit API proxying** (API key required since January 31, 2024)
  - Register at https://portal-api.digitransit.fi/ (free)
  - See [https://github.com/LottaL/digitransit-api-proxy](https://github.com/LottaL/digitransit-api-proxy) for example

### Installation

1. **Create `.env.local` file**

   Copy `.env.local` from the root and add your API key:

   ```
   VITE_DIGITRANSIT_API_KEY=your_api_key_here
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

   The app opens automatically at http://localhost:5173

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── BusStops.tsx    # Bus stops display component
│   ├── BusStops.css    # Bus stops styling
│   ├── Weather.tsx     # Weather forecast component
│   └── Weather.css     # Weather styling
├── services/           # API services
│   ├── digitransitApi.ts  # Digitransit bus stop API
│   ├── weatherApi.ts      # Open-Meteo weather API
│   └── pwaService.ts      # PWA service worker management
├── App.tsx            # Main app component
├── App.css            # App styling
├── main.tsx           # React entry point
└── index.css          # Global styles

public/               # PWA assets (icons, manifest)
vite.config.ts       # Vite configuration with PWA plugin
tsconfig.json        # TypeScript configuration
package.json         # Dependencies and scripts
```

## Configuration

### Environment Variables

The app uses publicly available APIs. The Digitransit API **requires authentication** and needs to be proxied to hide the API key:

- **Digitransit API Key** (Required): `VITE_DIGITRANSIT_API_KEY`
  - Register at https://portal-api.digitransit.fi/
  - Add to `.env.local`: `VITE_DIGITRANSIT_API_KEY=your_key_here`
  - See [DIGITRANSIT_API_KEY.md](DIGITRANSIT_API_KEY.md) for detailed instructions

- **Digitransit Router**: Uses the routing API (HSL region by default)
  - HSL (Helsinki): `https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql`
  - Waltti (Other Finnish cities): `https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql`
  - Finland (Nationwide): `https://api.digitransit.fi/routing/v1/routers/finland/index/graphql`

- **Open-Meteo API** (No key needed): https://api.open-meteo.com/v1/forecast

To change regions, edit the `DIGITRANSIT_API_URL` constant in `src/services/digitransitApi.ts`

### PWA Manifest

Edit `vite.config.ts` to customize PWA settings:

- App name and description
- Theme colors
- App icons
- Display mode (standalone, fullscreen, minimal-ui, browser)

### Caching Strategy

The service worker uses:

- **Digitransit API**: Cache-first with 5-minute expiration
- **Weather API**: Network-first with 10-minute cache fallback
- **Static assets**: Cache-first for all images, CSS, JavaScript

## API Reference

### Digitransit API

Gets nearest bus stops with real-time departure information:

```typescript
getNearestBusStops(lat: number, lon: number, radius?: number, limit?: number): Promise<BusStop[]>
```

### Weather API

Gets hourly weather forecast:

```typescript
getWeatherForecast(lat: number, lon: number): Promise<HourlyForecast[]>
```

## Adding PWA Icons

Replace these files in the `public/` directory with your own icons:

- `pwa-192x192.png`
- `pwa-512x512.png`
- `pwa-maskable-192x192.png`
- `pwa-maskable-512x512.png`
- `apple-touch-icon.png`
- `favicon.ico`

Run `npm run build` after updating icons.

## Development

### Hot Module Replacement (HMR)

Vite provides instant HMR for both React and CSS changes. Just save and see updates immediately.

### TypeScript

The project includes strict TypeScript configuration. Make sure to add types for any new dependencies.

### Linting

```bash
npm run lint
```

## Browser Support

- Modern browsers with:
  - Service Worker support
  - Geolocation API
  - Web App Manifest support
  - ES2020 JavaScript support

### Tested On

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (iOS 15+)

## Performance Optimization

- Automatic gzip compression by Vite
- Tree-shaking of unused code
- Code splitting for components
- Service worker caching reduces bandwidth
- Lazy loading of non-critical resources

## Troubleshooting

### 401 Unauthorized (Digitransit API)

This means your API key is missing or invalid. **The Digitransit API requires authentication since January 31, 2024.**

**Solution:**

1. Go to [DIGITRANSIT_API_KEY.md](DIGITRANSIT_API_KEY.md) and follow the registration steps
2. Create or edit `.env.local` in your project root
3. Add: `VITE_DIGITRANSIT_API_KEY=your_key_here`
4. Replace `your_key_here` with your actual API key
5. Restart your dev server: `npm run dev`

**Note:** `.env.local` is in `.gitignore` so it won't be committed (keeps your key safe)

### 403 Forbidden (Digitransit API)

You've exceeded rate limits. The API allows ~10 requests per second.

**Solution:**

- The app already includes refresh intervals (30s for buses, 10min for weather)
- If deploying with high traffic, you may need to upgrade your API subscription
- Contact digitransit-api@hsl.fi if you need higher limits

### Bus stops not showing

**Check:**

1. Browser console (F12) for error messages
2. That `.env.local` has your API key set correctly
3. That coordinates are within Digitransit coverage (HSL covers Helsinki area)
4. Network tab to verify the request headers include `digitransit-subscription-key`

### Service Worker not registering

1. Check browser console for errors
2. Ensure HTTPS is used (except localhost)
3. Verify manifest.webmanifest is served correctly

### Location not detected

- The app falls back to Helsinki (60.1699°N, 24.9384°E)
- Check browser permissions for geolocation
- Ensure browser has location access

## License

MIT

## Resources

- [Digitransit Developer Docs](https://digitransit.fi/en/developers/apis/)
- [Digitransit API Registration](https://portal-api.digitransit.fi/)
- [Digitransit API Key Guide](DIGITRANSIT_API_KEY.md)
- [Open-Meteo Weather API](https://open-meteo.com/)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

## Contributing

Feel free to submit issues and enhancement requests!

## Future Enhancements

- [ ] Route filtering by line number
- [ ] Stop search functionality
- [ ] Favorite stops bookmarks
- [ ] Real-time alerts for delays
- [ ] Dark mode support
- [ ] Multiple language support
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Push notifications for buses
- [ ] Trip planning features
