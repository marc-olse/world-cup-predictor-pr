# Primicos World Cup Mobile Plan

## Objective

Create an installable iPhone experience with the same functionality as the
existing web app. Users should be able to place it on their Home Screen and
launch it like an app without requiring App Store distribution.

## Decision

Build an installable Progressive Web App (PWA) first.

Do not use Capacitor for the first mobile release.

### Why PWA First

- Free to distribute through the existing Vercel URL.
- No Apple Developer Program subscription.
- No App Store review.
- No expiring development certificates.
- Users can install it from Safari with Add to Home Screen.
- It can launch in standalone mode without normal Safari navigation.
- It retains the current Next.js, Vercel, Supabase, server actions, and
  authentication architecture.
- Every web deployment automatically updates the installed experience.

### Why Not Capacitor Yet

The current application depends on:

- Next.js server components.
- Next.js server actions.
- Server-managed Supabase authentication cookies.
- Dynamic rendering on Vercel.

A production Capacitor application should package its frontend locally.
Pointing its WebView directly at the deployed website is intended for live
reload and is not recommended for production.

Native iPhone distribution also requires the Apple Developer Program, which
currently costs USD 99 per year. Free personal provisioning is intended for
testing, is limited to a small number of devices, and expires after seven
days. A simple website wrapper may also fail Apple's minimum-functionality
review requirement.

Capacitor can be reconsidered later if the project needs native push
notifications, widgets, App Store discovery, or deeper iOS integration.

## Implementation Phases

### 1. PWA Identity

- Add a web app manifest.
- Set the app name to `Primicos World Cup`.
- Define a concise Home Screen name.
- Use `standalone` display mode.
- Define the theme color and background color.
- Set the authenticated mobile start URL.
- Prefer portrait orientation while keeping landscape usable.

### 2. App Artwork

- Create a dedicated Primicos World Cup app icon.
- Add a 180x180 Apple touch icon.
- Add 192x192 and 512x512 PWA icons.
- Add a maskable 512x512 icon.
- Confirm that icons remain legible with iOS light, dark, and tinted icon
  treatments.

### 3. iPhone Presentation

- Add Apple standalone metadata.
- Configure the status bar appearance.
- Support iPhone safe-area insets.
- Ensure the header and navigation do not collide with the notch or Home
  indicator.
- Preserve the current desktop and browser layouts.
- Verify that all controls meet comfortable mobile touch-target sizes.

### 4. Service Worker Strategy

Cache only stable application resources:

- App icons.
- Fonts.
- Compiled CSS and JavaScript assets.
- Other versioned static assets.

Do not use cache-first behavior for:

- Match schedules and statuses.
- Kickoff times.
- Predictions.
- Results.
- Leaderboard data.
- Authentication state.
- Admin operations.

Use network-first behavior for dynamic routes. Never allow cached data to make
a match appear open after kickoff.

When offline:

- Clearly show that the app is offline.
- Do not accept or queue prediction submissions.
- Do not imply that a prediction was saved.
- Allow previously loaded read-only content only when its stale state is made
  clear.

### 5. Authentication

Test Supabase authentication inside the installed standalone experience:

- Login.
- Signup.
- Session persistence after closing and reopening the app.
- Session refresh.
- Sign out.
- Expired-session recovery.
- Redirects between protected and public pages.
- Email confirmation and authentication links, if enabled.

Links opened outside the installed app must return users to a valid deployed
URL and preserve the expected authentication flow.

### 6. Installation Experience

- Add a discreet iPhone-only installation prompt.
- Explain the Safari installation path:
  1. Open the deployed site in Safari.
  2. Tap Share.
  3. Tap Add to Home Screen.
  4. Enable Open as Web App when offered.
  5. Tap Add.
- Hide the prompt when already running in standalone mode.
- Allow users to dismiss the prompt.
- Remember dismissal so it does not appear repeatedly.
- Optionally provide a QR code for sharing the installation URL.

### 7. Physical Device Testing

Test on real iPhones where possible:

- Small-screen iPhone.
- Standard-size iPhone.
- Pro Max-size iPhone.
- Portrait orientation.
- Landscape orientation.
- Safari browser mode.
- Installed standalone mode.

Test these workflows:

- First installation.
- First login.
- Reopening after the app was terminated.
- Receiving a new web deployment.
- Prediction submission before kickoff.
- Automatic locking at kickoff.
- Result and points display.
- Starred-game scoring.
- Tournament prediction cutoff.
- Results visibility after kickoff.
- Leaderboard refresh.
- Sign out and sign back in.
- Temporary network loss.
- Recovery after network access returns.

## Security and Data Rules

- Continue using only the public Supabase URL and publishable key in the
  client.
- Never place the Supabase secret key in the web bundle, manifest, service
  worker, or mobile assets.
- Keep server authorization and Row Level Security as the source of truth.
- Client-side disabled controls are only user experience safeguards.
- Submission deadlines must continue to be enforced by the server and
  database.
- Do not persist sensitive user data in the service-worker cache.

## Acceptance Criteria

The first mobile release is complete when:

- The app can be installed from Safari onto an iPhone Home Screen.
- It launches in standalone mode with the correct icon and name.
- All existing user and admin functionality remains available.
- Login persists correctly between launches.
- Dynamic match data is not served stale.
- Predictions cannot be submitted offline.
- Predictions cannot be submitted at or after kickoff.
- Tournament predictions lock at the first tournament kickoff.
- Results become visible according to the existing kickoff rules.
- Finished-match points and explanations are correct.
- Safe areas, navigation, cards, forms, and dialogs render correctly on
  supported iPhone sizes.
- Updating the Vercel deployment updates the installed experience without
  reinstalling it.
- Distribution requires no App Store listing or paid Apple Developer account.

## Future Capacitor Phase

Reconsider Capacitor only when at least one native requirement justifies the
additional architecture and distribution cost:

- Native push notifications.
- Home Screen widgets.
- Live Activities.
- App Store discovery.
- Native sharing or deep system integrations.
- Biometric application locking.
- Significant offline functionality.

Before starting that phase:

- Decide whether to separate the frontend from Next.js server rendering.
- Define a stable API layer for authentication and application data.
- Plan native deep links and Supabase authentication callbacks.
- Enroll in the Apple Developer Program.
- Add native functionality that clearly exceeds a repackaged website.

## Reference Links

- Apple iPhone User Guide: Add a website icon to the Home Screen  
  https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios
- Apple Developer Program membership comparison  
  https://developer.apple.com/support/compare-memberships/
- Apple App Review Guidelines, section 4.2  
  https://developer.apple.com/app-store/review/guidelines/
- Capacitor configuration documentation  
  https://capacitorjs.com/docs/config
