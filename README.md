<div align="center">

# Authenticator App

**Two-factor codes on your phone, kept on your phone, synced only when you want.**

A cross-platform TOTP authenticator for iOS, Android and the web, built with React Native and Expo. It works fully offline, can sync through a Casdoor account, and ships with a small Node.js API service in the same repository.

![iOS · Android · Web](https://img.shields.io/badge/iOS%20·%20Android%20·%20Web-1f2937?style=flat-square)
![Expo SDK 52](https://img.shields.io/badge/Expo%20SDK-52-000020?style=flat-square&logo=expo)
![React Native 0.76](https://img.shields.io/badge/React%20Native-0.76-61dafb?style=flat-square&logo=react&logoColor=white)
![Node.js + Express](https://img.shields.io/badge/API-Express%204-339933?style=flat-square&logo=node.js&logoColor=white)
![Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-2ea44f?style=flat-square)

</div>

---

## Contents

- [What's in this repo](#whats-in-this-repo)
- [Features](#features)
- [Getting started: mobile app](#getting-started-mobile-app)
- [Getting started: backend API](#getting-started-backend-api)
- [API reference](#api-reference)
- [How the app works](#how-the-app-works)
- [Project layout](#project-layout)
- [Builds, releases and CI](#builds-releases-and-ci)
- [Security notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

---

## What's in this repo

| Part                   | Path                    | What it is                                                                        |
| ---------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| **Mobile and web app** | `/` (root)              | Expo / React Native authenticator: TOTP codes, QR scanning, imports, Casdoor sync |
| **Backend API**        | [`backend/`](./backend) | Express + Sequelize REST service with `auth`, `news` and `games` modules          |

The two parts are independent. The app does **not** call the backend; its cloud sync talks directly to a [Casdoor](https://casdoor.org) server.

---

## Features

### Codes

- **TOTP (RFC 6238)** with a live countdown ring that refreshes every 30 seconds
- **Tap to copy** with clipboard feedback

### Organize

- **Favorites** pinned to the top of the list
- **Categories**: Banking, Social, Work, Personal, Crypto, Gaming, Shopping, Other, each with its own color and icon
- **Sort modes**: Smart (usage + recency), Alphabetical, Recently used, Default
- **Search** by issuer or account name
- **Notes and backup codes** stored per account, with one-tap copy for each backup code
- **Usage stats**: how often and how recently each code was used

### Add and import

- **Scan a QR code** with the camera, or pick a QR image from the photo library
- **Manual entry** of a Base32 secret
- **Google Authenticator** bulk import via its `otpauth-migration://` export QR
- **Microsoft Authenticator** import from its exported SQLite database file

### Sync and sign-in

- **Casdoor sync** stores your accounts in your Casdoor user's `mfaAccounts` field
- **Three ways to sign in**: manual server setup, scan a login QR, or try the public Casdoor demo
- **Offline-first**: everything works without signing in or without a network

### Experience

- **Light, dark or system theme** (Material Design 3 via React Native Paper)
- **12 languages**: English, 中文, 日本語, Français, Deutsch, 한국어, العربية, Español, Русский, Português, ไทย, Українська

---

## Getting started: mobile app

### Requirements

- Node.js **18+** (CI uses 20)
- For Android: Android Studio, the Android SDK, and `ANDROID_HOME` set
- For iOS: macOS with Xcode and CocoaPods

### Install and run

```bash
git clone <your-repo-url> budhori-authenticator
cd budhori-authenticator
npm install
```

| Command              | What it does                                       |
| -------------------- | -------------------------------------------------- |
| `npm start`          | Start the Expo dev server                          |
| `npm run android`    | Build and run a dev client on a device or emulator |
| `npm run ios`        | Build and run a dev client in the iOS simulator    |
| `npm run web`        | Run the web version in your browser                |
| `npm run export:web` | Produce a static web build in `dist/`              |

> This project uses `expo-dev-client`, so Expo Go is not enough. The first `npm run android` or `npm run ios` compiles the native project, which takes a few minutes.

### Database migrations

The app's local database is SQLite, managed by Drizzle ORM. Migrations in [`drizzle/`](./drizzle) run automatically on startup. After changing [`db/schema.js`](./db/schema.js), generate a new migration with:

```bash
npx drizzle-kit generate
```

---

## Getting started: backend API

The backend lives in [`backend/`](./backend) and has its own `package.json`.

```bash
cd backend
npm install
cp .env.example .env     # then edit the values
npm run dev              # nodemon, auto-restart on change
# or
npm start                # plain node
```

The server starts on `http://localhost:5000` by default.

### Environment variables

| Variable                                   | Default                        | Notes                                                                   |
| ------------------------------------------ | ------------------------------ | ----------------------------------------------------------------------- |
| `PORT`                                     | `5000`                         | HTTP port                                                               |
| `NODE_ENV`                                 | `development`                  | In `development`, tables are auto-altered to match the models           |
| `JWT_SECRET`                               | `change-me-in-env`             | **Set a long random string in every real environment**                  |
| `JWT_EXPIRES_IN`                           | `7d`                           | Token lifetime                                                          |
| `DB_DIALECT`                               | `mysql`                        | `mysql`, `postgres` or `sqlite` (drivers for these three are installed) |
| `DB_HOST` / `DB_PORT`                      | `localhost` / `3306`           | Ignored for SQLite                                                      |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD`      | `app_db` / `root` / empty      | Ignored for SQLite                                                      |
| `DB_STORAGE`                               | `./data/dev.sqlite`            | SQLite file path, SQLite only                                           |
| `DB_LOGGING`                               | `false`                        | `true` prints every SQL query                                           |
| `DB_POOL_MAX` / `MIN` / `IDLE` / `ACQUIRE` | `10` / `0` / `10000` / `30000` | Connection pool tuning                                                  |

**Quickest local setup:** set `DB_DIALECT=sqlite` and you don't need a database server at all.

---

## API reference

Base URL: `http://localhost:5000/api/v1`

Routes marked 🔒 need a header of the form `Authorization: Bearer <token>`, using the token returned by `/auth/login`.

### Health

| Method | Path      | Description       |
| ------ | --------- | ----------------- |
| `GET`  | `/health` | Status and uptime |

### Auth

| Method | Path             | Body                        | Description            |
| ------ | ---------------- | --------------------------- | ---------------------- |
| `POST` | `/auth/register` | `name`, `email`, `password` | Create a user          |
| `POST` | `/auth/login`    | `email`, `password`         | Returns a JWT          |
| `GET`  | `/auth/me` 🔒    |                             | Current user's profile |

### News

| Method   | Path           | Description                                      |
| -------- | -------------- | ------------------------------------------------ |
| `GET`    | `/news`        | List articles                                    |
| `GET`    | `/news/:id`    | Get one article                                  |
| `POST`   | `/news` 🔒     | Create an article (`title`, `content`, `author`) |
| `PUT`    | `/news/:id` 🔒 | Update an article                                |
| `DELETE` | `/news/:id` 🔒 | Delete an article                                |

### Games

| Method | Path                     | Description                                     |
| ------ | ------------------------ | ----------------------------------------------- |
| `GET`  | `/games`                 | List games                                      |
| `GET`  | `/games/:id`             | Get one game                                    |
| `POST` | `/games` 🔒              | Create a game (`name`, `genre`)                 |
| `POST` | `/games/:id/scores` 🔒   | Submit a score (`score`) for the signed-in user |
| `GET`  | `/games/:id/leaderboard` | Top 10 scores for a game                        |

### Response shape

Every response uses the same envelope:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Login successful",
  "success": true
}
```

### Example

```bash
# Register, then log in and use the token
curl -X POST localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"s3cret"}'

TOKEN=$(curl -s -X POST localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"s3cret"}' | jq -r '.data.token')

curl localhost:5000/api/v1/auth/me -H "Authorization: Bearer $TOKEN"
```

---

## How the app works

### Local storage

Each account is a row in the on-device SQLite table `accounts`:

| Column                                          | Purpose                                         |
| ----------------------------------------------- | ----------------------------------------------- |
| `account_name`, `issuer`                        | Identity (unique together)                      |
| `secret`                                        | Base32 TOTP secret                              |
| `is_favorite`, `category`                       | Organization                                    |
| `notes`, `backup_codes`                         | Free text and newline-separated recovery codes  |
| `usage_count`, `last_used_at`                   | Feed the Smart sort                             |
| `changed_at`, `sync_at`, `deleted_at`, `origin` | Sync bookkeeping; deletes are soft until synced |

Settings and the signed-in session are kept in AsyncStorage through Zustand.

### Casdoor sync

1. Sign in from **Settings**. The default config points at the public demo, `https://door.casdoor.com` (see [`src/DefaultCasdoorSdkConfig.js`](./src/DefaultCasdoorSdkConfig.js)).
2. The app reads your user's `mfaAccounts` from `/api/get-user`, merges them with local changes using the timestamps above, and writes the result back with `/api/update-user`.
3. Each install gets a random `origin` ID, so the app can tell which device made a change.

**QR login** expects a code in this format:

```
casdoor-authenticator://login?serverUrl=<url>&accessToken=<token>
```

You can scan it or paste it from the clipboard.

---

## Project layout

```
.
├── src/                        App source
│   ├── App.js                  Root: migrations, fonts, theme, navigation
│   ├── NavigationBar.js        Stack: Home → Item detail, Settings
│   ├── HomePage.js             Account list, filters, sort sheet, FAB
│   ├── ItemDetailPage.js       Code, stats, notes, backup codes
│   ├── EnterAccountDetails.js  Manual add
│   ├── EditAccountDetails.js   Edit, category, notes, backup codes
│   ├── ScanQRCode.js           QR scan + Google Authenticator migration
│   ├── ImportManager.js        Import sheet (Google / Microsoft)
│   ├── MSAuthImportLogic.js    Microsoft Authenticator DB reader
│   ├── CasdoorLoginPage.js     Casdoor sign-in flow
│   ├── LoginMethodSelector.js  Manual / QR / demo picker
│   ├── ScanLogin.js            Login-QR parser
│   ├── syncLogic.js            Merge + push/pull with Casdoor
│   ├── api.js                  Casdoor HTTP client
│   ├── useAccountStore.js      Accounts, categories, sort logic
│   ├── totpUtil.js             Code generation + countdown
│   └── theme.js                Light / dark Material themes
├── db/                         Drizzle schema + SQLite client
├── drizzle/                    Generated migrations
├── google/                     Protobuf schema for Google Authenticator export
├── locales/                    12 translation bundles
├── assets/                     Icon, splash, favicon
├── android/  ios/              Native projects
├── backend/                    Express API (see above)
│   ├── modules/{auth,news,game}/   routes · controller · service · model
│   ├── middlewares/            JWT auth, logger, error handler
│   ├── db/  config/  utils/
│   └── index.js                Entry point
├── app.json                    Expo config (bundle ID com.budhori.authenticator)
└── eas.json                    EAS build profiles
```

---

## Builds, releases and CI

### Local release builds

**Android APK**

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

**iOS**

```bash
npx expo prebuild --platform ios
cd ios && pod install
# open ios/*.xcworkspace in Xcode and archive
```

**Web**

```bash
npm run export:web    # → dist/
```

### EAS profiles

[`eas.json`](./eas.json) defines `development`, `preview` and `production` profiles. Android builds produce an APK; iOS preview builds target the simulator.

```bash
eas build --profile preview --platform android
```

### GitHub Actions

| Workflow         | Trigger                               | What it does                                         |
| ---------------- | ------------------------------------- | ---------------------------------------------------- |
| `release.yml`    | Push or PR to `master`, or manual run | Builds the Android APK and runs semantic-release     |
| `deploy-web.yml` | Push to `master`, or manual run       | Exports the web build and deploys it to GitHub Pages |
| `preview.yml`    | A `/preview` comment on a PR          | Publishes an EAS Update to a `pr-<branch>` channel   |

Versioning follows [semantic-release](https://semantic-release.gitbook.io), so commit messages should use the Conventional Commits format (`feat:`, `fix:`, `chore:` …).

---

## Security notes

- Secrets stay on the device unless you sign in and sync.
- The local SQLite database lives in the app's private sandbox but is **not encrypted at rest**.
- When you sync, secrets are sent to your Casdoor server and stored in your user record. Only use a server you trust.
- For the backend: always set `JWT_SECRET`, and run with `NODE_ENV=production` so the schema is not auto-altered.

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b feat/short-description`
2. Make your change and run `npx eslint src` before committing
3. Use a Conventional Commit message, for example `feat: add HOTP support`
4. Open a pull request. Maintainers can comment `/preview` to get a test build.

---

## License

[Apache License 2.0](./LICENSE). Originally based on the Casdoor Authenticator.
