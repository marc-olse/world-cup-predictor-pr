export const INSTALL_PROMPT_DISMISSAL_KEY =
  'primicos-install-prompt-dismissed-at';
export const INSTALL_PROMPT_DISMISSAL_MS = 30 * 24 * 60 * 60 * 1000;

export function isIosDevice(params: {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
}) {
  const { userAgent, platform, maxTouchPoints } = params;
  const iPhoneOrIPad = /iPhone|iPad|iPod/i.test(userAgent);
  const touchIPad = platform === 'MacIntel' && maxTouchPoints > 1;

  return iPhoneOrIPad || touchIPad;
}

export function isAndroidDevice(userAgent: string) {
  return /Android/i.test(userAgent);
}

export function isStandaloneDisplay(params: {
  displayModeStandalone: boolean;
  navigatorStandalone?: boolean;
}) {
  return params.displayModeStandalone || params.navigatorStandalone === true;
}

export function isInstallPromptDismissed(
  dismissedAt: string | null,
  now = Date.now(),
) {
  if (!dismissedAt) {
    return false;
  }

  const timestamp = Number(dismissedAt);

  return (
    Number.isFinite(timestamp) &&
    timestamp > 0 &&
    now - timestamp < INSTALL_PROMPT_DISMISSAL_MS
  );
}

export function shouldAutoShowInstallPrompt(params: {
  authenticated: boolean;
  mobileBrowser: boolean;
  standalone: boolean;
  dismissedAt: string | null;
  now?: number;
}) {
  return (
    params.authenticated &&
    params.mobileBrowser &&
    !params.standalone &&
    !isInstallPromptDismissed(params.dismissedAt, params.now)
  );
}
