import { Workbox } from 'workbox-window'

/**
 * Register service worker for PWA functionality
 */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers are not supported in this browser')
    return
  }

  try {
    const wb = new Workbox('/sw.js')

    // Handle updates
    wb.addEventListener('installed', (event) => {
      if (!event.isUpdate) {
        console.log('Service Worker installed')
      }
    })

    wb.addEventListener('waiting', () => {
      console.log('New Service Worker waiting')
      // You can show a notification to the user here
    })

    wb.addEventListener('controlling', () => {
      console.log('Service Worker controlling')
      // Optionally refresh the page when a new SW takes control
      window.location.reload()
    })

    await wb.register()
    console.log('Service Worker registered successfully')
  } catch (error) {
    console.error('Service Worker registration failed:', error)
  }
}

/**
 * Check if PWA is running in standalone mode
 */
export function isStandaloneMode(): boolean {
  return (
    (navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

/**
 * Prompt user to install PWA (for browsers that support it)
 */
export async function promptInstallPWA(): Promise<boolean> {
  let deferredPrompt: any = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })

  if (deferredPrompt) {
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)
      deferredPrompt = null
      return outcome === 'accepted'
    } catch (error) {
      console.error('Failed to show install prompt:', error)
      return false
    }
  }

  return false
}
