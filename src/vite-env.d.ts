/// <reference types="vite/client" />

import type { DailyHubApi } from "./shared/dailyHub";

declare global {
  interface Window {
    dailyHub?: DailyHubApi;
  }
}

export {};
