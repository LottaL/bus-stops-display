# Setup Guide - Bus Stops Display PWA

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React & React DOM
- TypeScript
- Vite & Vite PWA plugin
- Axios for API calls
- ESLint for code quality

### 2. Start Development Server
```bash
npm run dev
```

The app will open at http://localhost:5173 with hot module reloading enabled.

### 3. Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` folder ready for deployment.

## Project Files Created

### Configuration Files
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite config with PWA plugin
- `tsconfig.json` - TypeScript configuration
- `tsconfig.app.json` - App-specific TS config
- `.eslintrc.cjs` - ESLint rules
- `.gitignore` - Git ignore patterns

### Source Code
```
src/
├── main.tsx                    # React entry point
├── App.tsx                     # Main app component
├── App.css                     # App styling
├── index.css                   # Global styles
├── components/
│   ├── BusStops.tsx           # Bus stops component
│   ├── BusStops.css           # Bus stops styling
│   ├── Weather.tsx            # Weather component
│   └── Weather.css            # Weather styling
└── services/
    ├── digitransitApi.ts      # Digitransit API client
    ├── weatherApi.ts          # Weather API client
    └── pwaService.ts          # PWA/Service Worker utils
```

### Web Files
- `index.html` - HTML template
- `.vscode/settings.json` - VS Code settings

## Next Steps

### 1. Generate PWA Assets (Optional but Recommended)

You need to create icons for your PWA. Place them in `public/` folder:

```
public/
├── pwa-192x192.png
├── pwa-512x512.png
├── pwa-maskable-192x192.png
├── pwa-maskable-512x512.png
├── apple-touch-icon.png
└── favicon.ico
```

**Quick way to generate**: Use an online tool like:
- https://www.pwa-asset-generator.dev/
- https://icon-set.app/

Or use this command (requires Node.js):
```bash
npm install -g pwa-asset-generator
pwa-asset-generator logo.svg public/ --splash-only --background "#667eea"
```

### 2. Test Geolocation

When running the app:
1. Allow location access when prompted
2. Or the app falls back to Helsinki (60.1699°N, 24.9384°E)

### 3. Test Service Worker

1. Build the project: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools (F12) → Application → Service Workers
4. You should see the registered service worker

### 4. Install as PWA (Chrome/Edge)

1. Run the app: `npm run dev`
2. You'll see an install button in Chrome address bar (or use menu)
3. Or go to Settings → Install app
4. The app can now run offline!

### 5. Deploy

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages
1. Add to `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/bus-stops-display/',
  // ... rest of config
})
```

2. Deploy:
```bash
npm run build
git add dist -f
git commit -m "Deploy"
git push
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### 6. Customize the App

#### Change App Name/Colors
Edit `vite.config.ts` manifest section:
```typescript
manifest: {
  name: 'Your App Name',
  short_name: 'Short Name',
  theme_color: '#667eea',
  background_color: '#ffffff',
}
```

#### Change API Parameters

**Digitransit Region/Router:**

Edit the `DIGITRANSIT_API_URL` in `src/services/digitransitApi.ts` to change regions:

```typescript
// Helsinki region (default)
const DIGITRANSIT_API_URL = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql'

// Other Finnish cities (Waltti)
const DIGITRANSIT_API_URL = 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql'

// Nationwide coverage
const DIGITRANSIT_API_URL = 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql'
```

**Weather API:**
Edit `src/services/weatherApi.ts` if you want to change the weather data provider.

#### Adjust Refresh Intervals
In `src/components/BusStops.tsx`:
```typescript
// Refresh every 30 seconds
const interval = setInterval(fetchStops, 30 * 1000)
```

In `src/components/Weather.tsx`:
```typescript
// Refresh every 10 minutes
const interval = setInterval(fetchWeather, 10 * 60 * 1000)
```

## Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 3000
```

### Clear Node Modules
```bash
rm -r node_modules package-lock.json
npm install
```

### Clear Vite Cache
```bash
rm -r node_modules/.vite
npm run dev
```

### Service Worker Issues
1. Clear browser cache (Ctrl+Shift+Delete)
2. Unregister old service worker in DevTools
3. Hard refresh (Ctrl+Shift+R)

## Testing Checklist

- [ ] App loads in browser
- [ ] Location permission prompt appears
- [ ] Bus stops display with real data
- [ ] Weather forecast shows 6-hour data
- [ ] Auto-refresh works (check timestamps)
- [ ] Responsive on mobile (F12 device emulation)
- [ ] Service worker registers (DevTools → Application)
- [ ] Works offline after first load
- [ ] Install prompt appears (Chrome)
- [ ] App installs and runs offline

## Performance Tips

1. **Monitor bundle size**: Run `npm run build` and check `dist/` folder
2. **Lighthouse audit**: DevTools → Lighthouse
3. **Network throttling**: DevTools → Network → throttle speed
4. **Accessibility check**: DevTools → Lighthouse or WAVE extension

## Resources

- [Digitransit API Docs](https://digitransit.fi/en/developers/apis/)
- [Open-Meteo API](https://open-meteo.com/en/docs)
- [PWA Guidelines](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## Need Help?

Check the README.md for full documentation and API reference!
