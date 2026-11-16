/**
 * WeatherNow - Test Setup
 * Polyfills for running unit tests under jsdom.
 */

// Polyfills for running unit tests under jsdom
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// Suppress console errors during testing
const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Unknown element')
  ) {
    return;
  }
  originalError.call(console, ...args);
};