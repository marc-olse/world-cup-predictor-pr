'use client';

import { useEffect, useState } from 'react';

import {
  INSTALL_PROMPT_DISMISSAL_KEY,
  isAndroidDevice,
  isIosDevice,
  isStandaloneDisplay,
  shouldAutoShowInstallPrompt,
} from '@/lib/pwa';

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type MobilePlatform = 'android' | 'ios';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
};

export function PwaRuntime({ authenticated }: { authenticated: boolean }) {
  const [online, setOnline] = useState(true);
  const [installEligible, setInstallEligible] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [mobilePlatform, setMobilePlatform] =
    useState<MobilePlatform | null>(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const navigatorWithStandalone = navigator as NavigatorWithStandalone;
    const displayModeStandalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;
    const standalone = isStandaloneDisplay({
      displayModeStandalone,
      navigatorStandalone: navigatorWithStandalone.standalone,
    });
    const ios = isIosDevice({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
    });
    const android = isAndroidDevice(navigator.userAgent);
    const platform: MobilePlatform | null = android
      ? 'android'
      : ios
        ? 'ios'
        : null;
    const dismissedAt = window.localStorage.getItem(
      INSTALL_PROMPT_DISMISSAL_KEY,
    );

    setOnline(navigator.onLine);
    setMobilePlatform(platform);
    setInstallEligible(platform !== null && !standalone);
    setInstallOpen(
      shouldAutoShowInstallPrompt({
        authenticated,
        mobileBrowser: platform !== null,
        standalone,
        dismissedAt,
      }),
    );

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallEligible(!standalone);
    };
    const handleInstalled = () => {
      setInstallEligible(false);
      setInstallOpen(false);
      setInstallPrompt(null);
    };
    const blockOfflineSubmit = (event: SubmitEvent) => {
      if (navigator.onLine) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    document.addEventListener('submit', blockOfflineSubmit, true);

    if (
      process.env.NODE_ENV === 'production' &&
      'serviceWorker' in navigator
    ) {
      void navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      document.removeEventListener('submit', blockOfflineSubmit, true);
    };
  }, [authenticated]);

  function dismissInstallInstructions() {
    window.localStorage.setItem(
      INSTALL_PROMPT_DISMISSAL_KEY,
      String(Date.now()),
    );
    setInstallOpen(false);
  }

  async function requestInstallation() {
    if (mobilePlatform !== 'android' || !installPrompt) {
      setInstallOpen(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    if (choice.outcome === 'accepted') {
      setInstallEligible(false);
      setInstallOpen(false);
      return;
    }

    dismissInstallInstructions();
  }

  return (
    <>
      {!online ? (
        <div
          aria-live="assertive"
          className="offline-banner fixed inset-x-0 top-0 z-[70] bg-coral px-4 py-2 text-center text-xs font-bold text-white shadow-md"
          role="alert"
        >
          You are offline. Displayed information may be outdated and changes
          cannot be submitted.
        </div>
      ) : null}

      {installEligible && !installOpen ? (
        <button
          className="install-help-button fixed bottom-3 right-3 z-40 rounded-md border border-ink/15 bg-white px-3 py-2 text-xs font-bold text-ink shadow-md"
          onClick={() => void requestInstallation()}
          type="button"
        >
          Install App
        </button>
      ) : null}

      {installOpen ? (
        <div
          aria-labelledby="install-app-title"
          aria-modal="true"
          className="fixed inset-0 z-[60] grid items-end bg-ink/35 p-3"
          role="dialog"
        >
          <section className="install-sheet mx-auto grid w-full max-w-md gap-4 rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold" id="install-app-title">
                  Install Primicos World Cup
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Add it to your Home Screen for quick, full-screen access on
                  {mobilePlatform === 'android' ? ' Android.' : ' iPhone.'}
                </p>
              </div>
              <button
                aria-label="Close install instructions"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-ink/10 text-xl text-ink/60"
                onClick={dismissInstallInstructions}
                type="button"
              >
                &times;
              </button>
            </div>

            {mobilePlatform === 'android' ? (
              <ol className="grid gap-2 text-sm text-ink/75">
                <li><strong>1.</strong> Open your browser&apos;s menu.</li>
                <li><strong>2.</strong> Choose Install app or Add to Home screen.</li>
                <li><strong>3.</strong> Confirm Install.</li>
              </ol>
            ) : (
              <ol className="grid gap-2 text-sm text-ink/75">
                <li><strong>1.</strong> Open your browser&apos;s Share menu.</li>
                <li><strong>2.</strong> Choose Add to Home Screen.</li>
                <li><strong>3.</strong> Enable Open as Web App when offered.</li>
                <li><strong>4.</strong> Tap Add.</li>
              </ol>
            )}

            {mobilePlatform === 'android' && installPrompt ? (
              <button
                className="btn-primary w-full"
                onClick={() => void requestInstallation()}
                type="button"
              >
                Install now
              </button>
            ) : (
              <button
                className="btn-primary w-full"
                onClick={dismissInstallInstructions}
                type="button"
              >
                Got it
              </button>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
