"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  type AdminAnalyticsPeriod,
  type AdminAnalyticsResponse,
  downloadAdminAnalyticsCsv,
  fetchAdminAnalytics,
  OVERVIEW_LABELS,
  PERIOD_LABELS,
} from "@/lib/adminAnalytics";

const PERIODS: AdminAnalyticsPeriod[] = ["all", "7d", "30d", "month"];

const distributionColGroup = (
  <colgroup>
    <col />
    <col style={{ width: "4.5rem" }} />
    <col style={{ width: "3.5rem" }} />
  </colgroup>
);

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xs border border-neutral-300 dark:border-neutral-600 px-4 py-3 bg-[var(--background)]">
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

function DistributionTable({
  title,
  rows,
  valueKey,
}: {
  title: string;
  rows: { count: number; percent: number; title?: string; location?: string }[];
  valueKey: "title" | "location";
}) {
  const label = valueKey === "title" ? "Title" : "Location";

  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--light-brown)] mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm opacity-70">No data yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xs border border-neutral-300 dark:border-neutral-600">
          <table className="w-full table-fixed text-sm">
            {distributionColGroup}
            <thead className="border-b border-neutral-300 dark:border-neutral-600 bg-[var(--background)]">
              <tr>
                <th className="text-left px-3 py-2 font-medium">{label}</th>
                <th className="text-right px-3 py-2 font-medium">Count</th>
                <th className="text-right px-3 py-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row[valueKey] ?? "unknown"}
                  className="border-b border-neutral-200 dark:border-neutral-700 last:border-b-0"
                >
                  <td className="px-3 py-2">{row[valueKey] || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.count}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminSection() {
  const { user, loading: authLoading } = useAuth();
  const [period, setPeriod] = useState<AdminAnalyticsPeriod>("30d");
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminAnalytics(period);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (!user?.is_superuser) return;
    void load();
  }, [load, user?.is_superuser]);

  if (authLoading) {
    return <p className="text-sm opacity-70 px-0.5 py-4">Loading…</p>;
  }

  if (!user?.is_superuser) {
    return (
      <p className="text-sm opacity-70 px-0.5 py-4">
        Admin analytics are only available to site administrators.
      </p>
    );
  }

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await downloadAdminAnalyticsCsv(period);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export CSV.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="px-0.5 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12 text-[var(--foreground)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm opacity-80 max-w-2xl">
            Site-wide metrics for urGallery. Active users had portfolio, page, comment, save, or
            profile activity in the selected period.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={exporting || loading}
          className="shrink-0 px-4 py-2 bg-[var(--light-brown)] text-[var(--foreground)] rounded-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-xs text-sm font-medium transition-colors ${
              period === p
                ? "bg-[var(--light-brown)] text-[var(--foreground)]"
                : "border border-neutral-300 dark:border-neutral-600 opacity-80 hover:opacity-100"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-sm opacity-70">Loading analytics…</p>
      ) : data ? (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-[var(--light-brown)] mb-3">Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {(Object.keys(data.overview) as (keyof typeof data.overview)[]).map((key) => (
                <StatCard
                  key={key}
                  label={OVERVIEW_LABELS[key]}
                  value={data.overview[key]}
                />
              ))}
            </div>
          </div>

          <DistributionTable title="Top titles" rows={data.titles} valueKey="title" />
          <DistributionTable title="Top locations" rows={data.locations} valueKey="location" />
        </div>
      ) : null}
    </div>
  );
}
