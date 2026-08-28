# Daily Hub

A quiet, local-first desktop app for planning the day, capturing quick ideas, and closing the loop with a short daily review.

Daily Hub is built for one person, one machine, and one simple daily ritual: decide what matters today, mark progress as work happens, jot down stray thoughts, and leave tomorrow a clean starting point.

## What It Does

- Plan today's tasks
- Add, edit, complete, uncomplete, and delete tasks
- See progress calculated from completed tasks
- Capture quick ideas for the selected day
- Fill a three-question daily review
- Switch dates without mixing records
- Keep all data locally in SQLite
- Run as a Windows desktop app with no network required

## Screens

Daily Hub uses a compact desktop layout with a persistent left rail, date switching, a daily progress board, quick idea capture, and review fields.

```text
Daily Hub
├─ Today Plan
├─ Progress
├─ Quick Ideas
└─ Daily Review
```

## Local-First Architecture

```text
React Renderer
↓
Electron preload / IPC
↓
DailyHubRepository
↓
SQLite
```

React components never execute SQL directly. Data access stays behind `DailyHubRepository`.

## Data Location

User data is not stored in the source directory. The app writes SQLite data to Electron's `userData` directory.

On Windows, the installed app stores data at:

```text
%APPDATA%\daily-hub\daily-hub.sqlite
```

Development and test runs can use isolated paths through:

```text
DAILY_HUB_USER_DATA_PATH
DAILY_HUB_DB_PATH
```

## Tech Stack

- Electron
- React
- TypeScript
- Vite
- SQLite
- better-sqlite3
- Vitest
- React Testing Library
- Playwright
- electron-builder

## Getting Started

Install dependencies:

```powershell
npm install
```

Run the desktop app in development:

```powershell
npm run dev
```

Development mode starts Vite and Electron together. Use the Electron window for the full app experience; a plain browser tab does not have access to the local SQLite IPC bridge.

## Quality Checks

```powershell
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

The E2E suite builds the app and tests the packaged Windows executable.

## Build A Windows App

Create an unpacked local app directory:

```powershell
npm run pack
```

Create a Windows installer:

```powershell
npm run dist
```

Generated files are written to:

```text
release/
```

The current installer output is:

```text
release/Daily Hub Setup 0.1.0.exe
```

## Offline Use

After installation, Daily Hub works without an internet connection. Tasks, ideas, reviews, progress, and date-specific records are read from and written to local SQLite.

## Current Scope

Included:

- Daily task checklist
- Dynamic progress
- Quick idea capture
- Daily review
- Date switching
- Local SQLite persistence
- Windows desktop packaging

Not included:

- Login
- Cloud sync
- Mobile app
- Calendar system
- Pomodoro
- Weekly reports
- AI summaries
- Team collaboration

## Notes

- The Windows installer is currently unsigned, so Windows may show a trust warning.
- The app currently uses Electron's default icon.
- Real SQLite data, build output, and release artifacts are intentionally ignored by Git.
