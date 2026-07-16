import { apiUrl } from "@/lib/api";

export type AdminAnalyticsPeriod = "all" | "7d" | "30d" | "month";

export type AdminDistributionRow = {
  title?: string;
  location?: string;
  count: number;
  percent: number;
};

export type AdminAnalyticsResponse = {
  period: AdminAnalyticsPeriod;
  generated_at: string;
  overview: {
    total_users: number;
    new_users: number;
    active_users: number;
    total_portfolios: number;
    new_portfolios: number;
    total_pages: number;
    new_pages: number;
    total_comments: number;
    new_comments: number;
    total_saves: number;
    new_saves: number;
    public_portfolios: number;
    private_portfolios: number;
  };
  titles: AdminDistributionRow[];
  locations: AdminDistributionRow[];
};

function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function adminAnalyticsUrl(period: AdminAnalyticsPeriod, format: "json" | "csv" = "json"): string {
  const params = new URLSearchParams({ period });
  if (format === "csv") params.set("format", "csv");
  return apiUrl(`/api/admin/analytics/?${params.toString()}`);
}

export async function fetchAdminAnalytics(
  period: AdminAnalyticsPeriod
): Promise<AdminAnalyticsResponse> {
  const res = await fetch(adminAnalyticsUrl(period), {
    credentials: "include",
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to load admin analytics.");
  }
  return res.json();
}

export async function downloadAdminAnalyticsCsv(period: AdminAnalyticsPeriod): Promise<void> {
  const res = await fetch(adminAnalyticsUrl(period, "csv"), {
    credentials: "include",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "X-CSRFToken": getCsrfToken(),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to export CSV.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `urgallery-analytics-${period}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const PERIOD_LABELS: Record<AdminAnalyticsPeriod, string> = {
  all: "All-time",
  "7d": "7 days",
  "30d": "30 days",
  month: "This month",
};

export const OVERVIEW_LABELS: Record<keyof AdminAnalyticsResponse["overview"], string> = {
  total_users: "Total users",
  new_users: "New signups",
  active_users: "Active users",
  total_portfolios: "Total portfolios",
  new_portfolios: "New portfolios",
  total_pages: "Total pages",
  new_pages: "New pages",
  total_comments: "Total comments",
  new_comments: "New comments",
  total_saves: "Total saves",
  new_saves: "New saves",
  public_portfolios: "Public portfolios",
  private_portfolios: "Private portfolios",
};
