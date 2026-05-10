# macOS release signing

This directory contains build-time resources for Electron packaging.

## Universal build

`npm run dist` generates macOS universal artifacts (`.dmg` and `.zip`) through `electron-builder`.

## Notarization

Notarization requires Apple Developer credentials and must be configured outside the repository.

Recommended local setup:

```bash
xcrun notarytool store-credentials "apliarte-notary" \
  --apple-id "APPLE_ID_EMAIL" \
  --team-id "VD3C7758UY" \
  --password "APP_SPECIFIC_PASSWORD"
```

Then export before release builds:

```bash
export APPLE_KEYCHAIN_PROFILE="apliarte-notary"
export APPLE_TEAM_ID="VD3C7758UY"
npm run dist
```

The repo intentionally does not store Apple credentials.
