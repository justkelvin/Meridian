# Meridian

[![License: AGPLv3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)
[![GitHub Stars](https://img.shields.io/github/stars/justkelvin/Meridian.svg?style=flat)](https://github.com/justkelvin/Meridian/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/justkelvin/Meridian.svg?style=flat)](https://github.com/justkelvin/Meridian/issues)
[![Last Commit](https://img.shields.io/github/last-commit/justkelvin/Meridian.svg?style=flat)](https://github.com/justkelvin/Meridian/commits/main)

Meridian is a browser-based workspace for app developers who need to ship to global markets. It consolidates four release-time tasks — translating Xcode string catalogs, localizing App Store and Google Play store listings, optimizing subscription pricing across countries, and generating localized screenshots — into a single, credential-safe interface.

All API keys and store credentials remain in your browser. Nothing is stored on a server.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [XCStrings Translation](#xcstrings-translation)
  - [App Store Connect Localization](#app-store-connect-localization)
  - [Google Play Localization](#google-play-localization)
  - [Subscription Pricing Optimization](#subscription-pricing-optimization)
  - [Screenshot Generator](#screenshot-generator)
- [AI Providers](#ai-providers)
- [Security Model](#security-model)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
- [Configuration](#configuration)
  - [AI Provider Setup](#ai-provider-setup)
  - [App Store Connect API](#app-store-connect-api)
  - [Google Play Console API](#google-play-console-api)
  - [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## Overview

Shipping an app to 40+ markets is tedious. Translating metadata by hand is slow and error-prone. Manually adjusting subscription prices per country is guesswork. Creating screenshot sets for every language is repetitive.

Meridian automates all of that from a single browser tab:

1. Connect your AI provider of choice.
2. Connect App Store Connect and/or Google Play Console using API credentials.
3. Translate and publish store listings in bulk, in one click.
4. Use GDP-adjusted recommendations to set fair subscription prices per country.
5. Build localized screenshot sets with device mockups and export them as a ZIP.

---

## Features

### XCStrings Translation

Meridian can load `.xcstrings` files (Xcode String Catalogs) directly in the browser, detect which strings are missing translations for your target languages, translate them in batches using your configured AI provider, and export a completed `.xcstrings` file ready to drop back into your Xcode project.

- Parses the standard `.xcstrings` JSON format.
- Identifies only the strings that are missing a given locale — it does not re-translate strings that already exist.
- Supports protected words: a list of brand names or technical terms you define that are never passed through the translation engine.
- Format specifiers (`%@`, `%d`, `%lld`, `%.2f`, etc.) are detected and preserved exactly in all output translations.
- Configurable concurrency (parallel API calls) and batch size (strings per API call) to stay within provider rate limits.
- Translation progress is shown in real time with a live log.

**Supported languages for XCStrings:** French, Spanish, German, Japanese, Korean, Chinese (Simplified), Chinese (Hong Kong), Arabic, Turkish, Indonesian, Portuguese (Brazil), Italian, Russian, Dutch, Polish, Thai, Vietnamese, Hindi, Swedish, Danish.

### App Store Connect Localization

Meridian connects directly to the App Store Connect API to read and write localizable metadata for your apps.

- Reads all existing locale entries for a selected app version.
- Translates app name, subtitle, description, keywords, promotional text, and "What's New" (release notes) to any App Store supported locale.
- Writes translations back to App Store Connect directly — no copy-paste required.
- Manages screenshot image sets: upload, preview, reorder, and delete screenshots per locale per device class.
- JWT tokens for API authentication are generated client-side and cached in `sessionStorage` for approximately 19 minutes. The UI shows a live countdown timer and auto-reconnects on reload.
- The `.p8` private key can be encrypted with a user-supplied password and stored in `localStorage` for convenience. The unencrypted key is never persisted — it lives only in memory during the session.

**Supported App Store Connect locales:** en-US, en-GB, en-AU, fr-FR, de-DE, es-ES, es-MX, it, pt-BR, pt-PT, nl-NL, ja, ko, zh-Hans, zh-Hant, ar-SA, tr, ru, th, vi, id, ms, pl, uk, ro, cs, sk, da, fi, sv, no, el, he, hi, hu, ca, hr, and more.

### Google Play Localization

Meridian connects to the Google Play Developer API using a Google Cloud service account and the OAuth 2.0 JWT Bearer flow.

- Reads all existing listing locales for a selected package.
- Translates title, short description, and full description and writes them back via the Play Developer API edit-commit workflow.
- Manages feature graphics and screenshot images per locale.
- Access tokens are cached in `sessionStorage` for up to one hour and refreshed automatically.
- Service account credentials (private key and client email) are parsed from the uploaded JSON key file and held in memory only — they are never written to disk or localStorage.

### Subscription Pricing Optimization

Meridian includes a pricing tool backed by IMF/World Bank GDP per capita data for 47 countries. Given a base price in USD, it calculates a GDP-adjusted recommended price for each country and matches it to the nearest available App Store price tier.

- Covers 47 countries across North America, Europe, Asia-Pacific, Latin America, Middle East, and Africa.
- Compares current prices pulled from App Store Connect against recommendations and highlights mismatches.
- One-click updates to App Store Connect for any or all countries.
- Visual pricing chart for a quick overview of price distribution across markets.

### Screenshot Generator

Meridian includes a screenshot composition tool for generating App Store and Google Play screenshot sets.

- 2D and 3D device frames covering iPhone models and Android phone form factors.
- Custom background colors, gradients, and image backgrounds.
- Headline text with AI-assisted translation so you can generate a complete localized set in one pass.
- Shadow and depth controls for the device frame.
- Batch export: renders all locales as individual PNG files packaged into a ZIP archive.

---

## AI Providers

Meridian supports six AI providers for translation. You can switch providers at any time from the configuration panel.

| Provider | Auth | Notes |
|---|---|---|
| OpenAI | API key (`sk-...`) | Supports service tier selection (auto, default, flex, priority) |
| Azure OpenAI | API key + endpoint URL | Custom deployment names; uses `2025-01-01-preview` API version |
| AWS Bedrock | Access key + secret key | Uses the Converse API; Claude models via inference profiles |
| Anthropic | API key | Direct browser access via `anthropic-dangerous-direct-browser-access` header |
| Google Gemini | API key | Uses the `generateContent` endpoint with JSON response mode |
| GitHub Models | Personal access token | Routes through `models.inference.ai.azure.com` |

All providers receive a structured prompt that instructs the model to output a JSON object mapping text indices to language codes to translated strings. Format specifiers and protected words are embedded in the prompt and validated in the parsed response.

---

## Security Model

Credentials handled by Meridian are processed entirely in the browser.

**App Store Connect `.p8` key:**
- Optionally encrypted with a password using the Web Crypto API before being written to `localStorage`.
- The decrypted key exists in memory only for the duration of the session.
- JWT tokens are signed client-side and cached in `sessionStorage` (cleared on tab close).

**Google Play service account JSON:**
- Parsed in the browser; the private key and client email are held in memory only.
- Not written to `localStorage` or any persistent storage.
- The OAuth access token is cached in `sessionStorage`.

**AI provider keys:**
- Stored in `localStorage` under the `meridian-provider-config` key.
- Never sent to any Meridian server — all AI API calls go directly from your browser to the provider endpoint.

**CORS proxy:**
- The App Store Connect API and Google Play API do not allow direct browser requests due to CORS restrictions.
- Meridian ships a minimal Cloudflare Worker (`worker/index.js`) that acts as a transparent pass-through proxy.
- The worker validates the `Origin` header against an allowlist before forwarding any request.
- In local development, Vite proxies `/api/appstoreconnect` and `/api/googleplay` paths to avoid CORS without needing the worker.

```
App Store Connect Auth Flow
─────────────────────────────────────────────────────
 .p8 file  ──(encrypt with password)──► localStorage
                                              │
                                    (decrypt on demand)
                                              │
                                              ▼
                                        ES256 JWT
                                              │
                                    (cache ~19 min)
                                              │
                                              ▼
                                    sessionStorage
                                              │
                                     Bearer token
                                              │
                                              ▼
                                  App Store Connect API
                                  (via CORS proxy)
```

```
Google Play Auth Flow
─────────────────────────────────────────────────────
 Service account JSON ──(parse)──► private_key + client_email
                                              │
                                  (sign RS256 JWT assertion)
                                              │
                                              ▼
                               oauth2.googleapis.com/token
                                              │
                                    access_token
                                              │
                                    (cache ~1 hour)
                                              │
                                              ▼
                                    sessionStorage
                                              │
                                     Bearer token
                                              │
                                              ▼
                               Google Play Developer API
                               (via CORS proxy)
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- A Cloudflare account (for production deployments only; not needed for local development)

### Local Development

```bash
git clone git@github.com:justkelvin/Meridian.git
cd Meridian
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173`. The local proxy configuration in `vite.config.js` routes `/api/appstoreconnect` and `/api/googleplay` to the respective upstream APIs, so you do not need a deployed Cloudflare Worker during development.

---

## Configuration

All credentials are entered through the configuration panel in the sidebar. Nothing is required at build time except the optional proxy URL for production deployments.

### AI Provider Setup

Open the configuration panel and select your preferred provider. Enter the API key and, if required by the provider, the model endpoint or region.

| Provider | Required fields |
|---|---|
| OpenAI | API key |
| Azure OpenAI | API key, endpoint URL, deployment name |
| AWS Bedrock | Access key ID, secret access key, AWS region |
| Anthropic | API key |
| Google Gemini | API key |
| GitHub Models | Personal access token |

Use the **Test Connection** button to verify the credentials before running a translation job.

### App Store Connect API

1. Go to [App Store Connect > Users and Access > Integrations > App Store Connect API](https://appstoreconnect.apple.com/access/integrations/api).
2. Create an API key with the **Admin** or **App Manager** role.
3. Note your **Key ID** and **Issuer ID**.
4. Download the `.p8` private key file (it can only be downloaded once).
5. In Meridian's configuration panel, enter the Key ID, Issuer ID, and upload the `.p8` file.
6. Optionally set a password to encrypt the key for persistent storage.

### Google Play Console API

1. In [Google Cloud Console](https://console.cloud.google.com/), enable the **Google Play Android Developer API** for your project.
2. Create a service account and download the JSON key file.
3. In [Google Play Console](https://play.google.com/console), go to **Users and permissions** and invite the service account email.
4. Grant **Release Manager** or **Admin** access for the target app.
5. In Meridian's configuration panel, upload the service account JSON file.

### Environment Variables

Create a `.env.local` file in the project root for local overrides, or a `.env.production` file for production builds. See `.env.example` for the full list.

```
# Cloudflare Worker URL for the CORS proxy (production only)
VITE_ASC_PROXY_URL=https://your-worker.workers.dev
VITE_GP_PROXY_URL=https://your-worker.workers.dev
```

Do not commit these files. They are listed in `.gitignore`.

---

## Deployment

### Cloudflare Worker (CORS Proxy)

The App Store Connect and Google Play APIs reject direct browser requests. The included Cloudflare Worker handles CORS by proxying requests server-side.

```bash
# Deploy the proxy worker
wrangler deploy -c wrangler.proxy.jsonc
```

After deployment, update the `ALLOWED_ORIGINS` array in `worker/index.js` with your production domain, then redeploy.

### Cloudflare Pages (Frontend)

```bash
# Create a production build
echo "VITE_ASC_PROXY_URL=https://your-worker.workers.dev" > .env.production
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist
```

The `dist/` directory is the build output. You can also deploy it to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.) — just point the host to the `dist` directory and ensure `VITE_ASC_PROXY_URL` is set in the build environment.

### GitHub Pages

```bash
npm run deploy
```

This runs `npm run build` and publishes the `dist/` folder to the `gh-pages` branch using `gh-pages`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (Radix UI primitives) |
| 3D rendering | Three.js (screenshot device frames) |
| Charts | Recharts (pricing chart) |
| JWT signing | jose |
| CORS proxy | Cloudflare Workers |
| Linting | ESLint with React Hooks plugin |

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository and create a feature branch from `main`.
2. Run `npm run lint` before submitting. Lint errors should be clean.
3. Write a clear, imperative commit message (e.g., `Add retry logic for Bedrock API calls`).
4. Open a pull request with a description of the change, the motivation, and any relevant screenshots for UI changes.
5. Call out known limitations or follow-up work in the PR description.

For significant changes, open an issue first to discuss the approach.

---

## License

GNU AGPLv3. Free to use, modify, and distribute with attribution. See [LICENSE](LICENSE) for the full terms.

---

## Credits

- Screenshot generator adapted from [appscreen](https://github.com/YUZU-Hub/appscreen) by Stefan at yuzuhub.com.
- [isnine](https://github.com/isnine) — Azure OpenAI support.
- [krrskl](https://github.com/krrskl) — GitHub Models support.
