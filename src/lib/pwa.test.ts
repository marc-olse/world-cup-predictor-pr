import { describe, expect, it } from 'vitest';

import {
  INSTALL_PROMPT_DISMISSAL_MS,
  isAndroidDevice,
  isInstallPromptDismissed,
  isIosDevice,
  isStandaloneDisplay,
  shouldAutoShowInstallPrompt,
} from './pwa';

describe('PWA device detection', () => {
  it('detects an iPhone running Safari', () => {
    const userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';

    expect(
      isIosDevice({ userAgent, platform: 'iPhone', maxTouchPoints: 5 }),
    ).toBe(true);
  });

  it('detects touch-capable iPadOS reporting as macOS', () => {
    expect(
      isIosDevice({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      }),
    ).toBe(true);
  });

  it('detects Chrome on iOS as an install-eligible iPhone browser', () => {
    expect(
      isIosDevice({
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) CriOS/130.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        maxTouchPoints: 5,
      }),
    ).toBe(true);
  });

  it('detects Android browsers', () => {
    expect(
      isAndroidDevice(
        'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36',
      ),
    ).toBe(true);
    expect(
      isAndroidDevice(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(false);
  });

  it('detects either standalone signal', () => {
    expect(
      isStandaloneDisplay({
        displayModeStandalone: true,
        navigatorStandalone: false,
      }),
    ).toBe(true);
    expect(
      isStandaloneDisplay({
        displayModeStandalone: false,
        navigatorStandalone: true,
      }),
    ).toBe(true);
  });
});

describe('PWA install prompt dismissal', () => {
  const now = 2_000_000_000_000;

  it('suppresses the automatic prompt for 30 days', () => {
    expect(
      isInstallPromptDismissed(
        String(now - INSTALL_PROMPT_DISMISSAL_MS + 1),
        now,
      ),
    ).toBe(true);
    expect(
      isInstallPromptDismissed(
        String(now - INSTALL_PROMPT_DISMISSAL_MS),
        now,
      ),
    ).toBe(false);
  });

  it('shows automatically for authenticated iOS browser mode', () => {
    expect(
      shouldAutoShowInstallPrompt({
        authenticated: true,
        mobileBrowser: true,
        standalone: false,
        dismissedAt: null,
        now,
      }),
    ).toBe(true);
    expect(
      shouldAutoShowInstallPrompt({
        authenticated: true,
        mobileBrowser: true,
        standalone: true,
        dismissedAt: null,
        now,
      }),
    ).toBe(false);
  });

  it('does not automatically open before login', () => {
    expect(
      shouldAutoShowInstallPrompt({
        authenticated: false,
        mobileBrowser: true,
        standalone: false,
        dismissedAt: null,
        now,
      }),
    ).toBe(false);
  });
});
