import { Workbox } from 'workbox-window';

// Minimal type for the beforeinstallprompt event (not yet standardized in lib.dom)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Register service worker for PWA functionality
 */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers are not supported in this browser');
    return;
  }

  try {
    const wb = new Workbox('/sw.js');

    // Handle updates
    wb.addEventListener('installed', (event) => {
      if (!event.isUpdate) {
        console.log('Service Worker installed');
      }
    });

    wb.addEventListener('waiting', () => {
      console.log('New Service Worker waiting');
      // You can show a notification to the user here
    });

    wb.addEventListener('controlling', () => {
      console.log('Service Worker controlling');
      // Optionally refresh the page when a new SW takes control
      window.location.reload();
    });

    await wb.register();
    console.log('Service Worker registered successfully');
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

/**
 * Check if PWA is running in standalone mode
 */
export function isStandaloneMode(): boolean {
  return (
    (navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Prompt user to install PWA (for browsers that support it)
 */
export async function promptInstallPWA(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const handler = async (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      try {
        await evt.prompt();
        const { outcome } = await evt.userChoice;
        resolve(outcome === 'accepted');
      } catch (err) {
        console.error('Failed to show install prompt:', err);
        resolve(false);
      } finally {
        window.removeEventListener('beforeinstallprompt', handler);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Fallback: if the event doesn't fire within 5s, resolve false
    const timer = window.setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
      resolve(false);
    }, 5000);
  });
}
