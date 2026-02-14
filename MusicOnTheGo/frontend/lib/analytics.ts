/**
 * App usage analytics - screen views and feature clicks.
 * Data is sent to the backend and visible in the admin panel under "App usage".
 */
import { api } from "./api";

function sanitizeName(name: string): string {
  return name
    .replace(/\//g, "_")
    .replace(/[()]/g, "")
    .replace(/^_|_$/g, "")
    .slice(0, 100) || "root";
}

export function trackScreenView(screenName: string): void {
  const name = sanitizeName(screenName);
  api("/api/analytics/event", {
    method: "POST",
    body: { eventType: "screen_view", name },
    auth: true,
  }).catch(() => {
    // Fire-and-forget; don't surface errors to the user
  });
}

export function trackFeatureClick(featureName: string): void {
  const name = sanitizeName(featureName).slice(0, 100);
  api("/api/analytics/event", {
    method: "POST",
    body: { eventType: "feature_click", name },
    auth: true,
  }).catch(() => {});
}
