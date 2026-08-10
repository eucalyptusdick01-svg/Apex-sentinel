// AdMob App ID: ca-app-pub-4574994899883335~6924353188
// Add this to app.json plugins when enabling native AdMob (requires development build)
//
// To activate real AdMob:
// 1. Run: pnpm add react-native-google-mobile-ads
// 2. Add to app.json plugins: ["react-native-google-mobile-ads", { "androidAppId": "...", "iosAppId": "ca-app-pub-4574994899883335~6924353188" }]
// 3. Replace stub components with real BannerAd, InterstitialAd, RewardedAd from 'react-native-google-mobile-ads'
// 4. Publish via Expo Launch (native build required)

export const ADMOB_APP_ID = 'ca-app-pub-4574994899883335~6924353188';

// Google test IDs — safe to use during development. Replace with your real unit IDs before going live.
// Real unit IDs are created in the AdMob dashboard under your app.
export const AD_UNIT_IDS = {
  banner:        __DEV__ ? 'ca-app-pub-3940256099942544/6300978111'  : 'REPLACE_WITH_REAL_BANNER_ID',
  interstitial:  __DEV__ ? 'ca-app-pub-3940256099942544/1033173712'  : 'REPLACE_WITH_REAL_INTERSTITIAL_ID',
  rewarded:      __DEV__ ? 'ca-app-pub-3940256099942544/5224354917'  : 'REPLACE_WITH_REAL_REWARDED_ID',
};

// Free tier: users get N runs before seeing an interstitial
export const FREE_RUNS_BEFORE_INTERSTITIAL = 3;
