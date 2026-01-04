"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

type Profile = {
  id: string;
  name: string;
  tag: string;
};

const MOCK_PROFILES: Profile[] = [
  { id: "sri", name: "Sri", tag: "Default profile" },
  { id: "focus", name: "Deep Focus", tag: "Workday protocol" },
  { id: "recovery", name: "Recovery", tag: "Low-load days" },
];

export default function HomePage() {
  const [activeProfileId, setActiveProfileId] = useState<string>("sri");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ----- local storage backed metrics -----
  import.meta.env; // keep bundler happy if unused

  type MetricEntry = { date: string; value: number };
  type ProfileMetrics = {
    sleep: MetricEntry[];
    focus: MetricEntry[];
    load: MetricEntry[];
  };

  const [metricsByProfile, setMetricsByProfile] = useLocalStorage<Record<string, ProfileMetrics>>("metrics", {});

  const activeProfile = MOCK_PROFILES.find((p) => p.id === activeProfileId) ?? MOCK_PROFILES[0];

  const ensureProfileMetrics = (id: string): ProfileMetrics => {
    const existing = metricsByProfile[id];
    return existing ?? { sleep: [], focus: [], load: [] };
  };

  // helpers
  const isoToday = () => new Date().toISOString().slice(0, 10);
  const upsertEntry = (arr: MetricEntry[], date: string, value: number) => {
    const idx = arr.findIndex((e) => e.date === date);
    const copy = [...arr];
    if (idx === -1) copy.push({ date, value });
    else copy[idx] = { date, value };
    // keep sorted by date
    copy.sort((a, b) => (a.date > b.date ? 1 : -1));
    return copy;
  };

  function saveMetric(profileId: string, metric: keyof ProfileMetrics, value: number) {
    const cur = ensureProfileMetrics(profileId);
    const updated = { ...cur, [metric]: upsertEntry(cur[metric], isoToday(), value) } as ProfileMetrics;
    setMetricsByProfile({ ...metricsByProfile, [profileId]: updated });
  }

  function resetMetrics(profileId: string) {
    setMetricsByProfile({ ...metricsByProfile, [profileId]: { sleep: [], focus: [], load: [] } });
  }

  function lastNLabels(n = 7) {
    const days: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString(undefined, { weekday: "short" }));
    }
    return days;
  }

  function seriesFor(profileId: string, metric: keyof ProfileMetrics, n = 7) {
    const cur = ensureProfileMetrics(profileId);
    const arr = cur[metric];
    const values: number[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const found = arr.find((e) => e.date === iso);
      values.push(found?.value ?? NaN);
    }
    return values;
  }

  // local input states for quick capture
  const [sleepInput, setSleepInput] = useState<string>("");
  const [focusInput, setFocusInput] = useState<string>("");
  const [loadInput, setLoadInput] = useState<string>("");


  const labels = lastNLabels();
  // mock fallback for any missing days
  const MOCK_SERIES = [72, 78, 81, 75, 82, 88, 90];
  const sleepSeries = seriesFor(activeProfileId, "sleep");
  const finalSleep = sleepSeries.map((v, i) => (Number.isFinite(v) ? v : MOCK_SERIES[i] ?? NaN));

  const MOCK_FOCUS = [5, 6, 7, 6, 7, 8, 7];
  const focusSeries = seriesFor(activeProfileId, "focus");
  const finalFocus = focusSeries.map((v, i) => (Number.isFinite(v) ? v : MOCK_FOCUS[i] ?? NaN));

  const lineData = {
    labels,
    datasets: [
      {
        label: "Sleep score",
        data: finalSleep,
        borderColor: "rgba(96, 165, 250, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.25)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: "rgba(248, 250, 252, 1)",
      },
      {
        label: "Focus",
        data: finalFocus,
        borderColor: "rgba(249, 115, 115, 1)",
        backgroundColor: "rgba(249, 115, 115, 0.1)",
        tension: 0.35,
        fill: false,
        pointRadius: 2,
        borderDash: [6, 4],
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#cbd5f5",
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#e5edff",
        bodyColor: "#e5edff",
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(55, 65, 81, 0.4)" },
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(31, 41, 55, 0.8)" },
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
    },
  } as const;

  return (
    <div className="bm-main">
      {/* Sidebar */}
      <aside className="bm-sidebar">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <div className="bm-dot" />
            <span style={{ fontWeight: 600, letterSpacing: "0.06em", fontSize: "0.75rem" }}>
              BODYMIND
            </span>
          </div>
          <span className="bm-chip">ALPHA</span>
        </div>

        <div>
          <div className="text-uppercase text-secondary mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.16em" }}>
            Profiles
          </div>
          <div className="d-flex flex-column gap-2">
            {MOCK_PROFILES.map((profile) => {
              const isActive = profile.id === activeProfileId;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setActiveProfileId(profile.id)}
                  className={
                    "bm-profile-pill w-100 text-start" +
                    (isActive ? " bm-profile-pill--active" : "")
                  }
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "999px",
                      background:
                        "radial-gradient(circle at 30% 20%, rgba(248, 250, 252, 0.9), transparent 60%), radial-gradient(circle at 80% 90%, rgba(59, 130, 246, 0.65), rgba(15, 23, 42, 1) 70%)",
                      border: "1px solid rgba(148, 163, 184, 0.6)",
                    }}
                  />
                  <div className="d-flex flex-column">
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{profile.name}</span>
                    <span style={{ fontSize: "0.68rem", color: "#9ca3af" }}>{profile.tag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto">
          <div
            className="bm-glass p-3"
            style={{ borderRadius: "1rem", fontSize: "0.8rem" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span style={{ fontWeight: 500 }}>Quick note</span>
              <span className="bm-chip">Today</span>
            </div>
            <p className="mb-1" style={{ color: "#d1d5db" }}>
              This is a minimal BodyMind shell. Metrics, multi-profile states, and richer charts will layer on top.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="bm-content">
        <div className="container-fluid h-100">
          <div className="row g-3">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      color: "#9ca3af",
                    }}
                  >
                    Overview
                  </div>
                  <h1
                    className="mb-0"
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 600,
                    }}
                  >
                    Body & mind for{" "}
                    <span style={{ color: "#60a5fa" }}>{activeProfile.name}</span>
                  </h1>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="bm-chip">Prototype</span>
                  <span className="bm-chip">Local only</span>
                </div>
              </div>
            </div>

            {/* Metric row */}
            <div className="col-12 col-lg-4">
              <div className="bm-metric-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "#9ca3af",
                    }}
                  >
                    Sleep quality
                  </span>
                  <span className="bm-chip">Last 7 days</span>
                </div>
                <div className="d-flex align-items-end gap-3">
                  <div>
                    {(() => {
                      const m = ensureProfileMetrics(activeProfileId).sleep;
                      const latest = m.length ? m[m.length - 1].value : 82;
                      return (
                        <>
                          <div style={{ fontSize: "2.1rem", fontWeight: 600 }}>{latest}</div>
                          <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Composite sleep score</div>
                        </>
                      );
                    })()}
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <input
                        aria-label="sleep score"
                        value={sleepInput}
                        onChange={(e) => setSleepInput(e.target.value)}
                        placeholder="score"
                        style={{ width: 70, padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(148,163,184,0.25)" }}
                      />
                      <button type="button" onClick={() => { const v = Number(sleepInput); if (!Number.isFinite(v)) return; saveMetric(activeProfileId, "sleep", v); setSleepInput(""); }} className="bm-profile-pill">Add</button>
                      <button type="button" onClick={() => resetMetrics(activeProfileId)} className="bm-profile-pill" style={{ background: "transparent", border: "1px solid rgba(148,163,184,0.15)" }}>Reset</button>
                    </div>
                  </div>
                  <div className="ms-auto text-end">
                    <div style={{ fontSize: "0.8rem", color: "#4ade80" }}>+6 vs baseline</div>
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Consistent wind-down helps</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="bm-metric-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "#9ca3af",
                    }}
                  >
                    Cognitive load
                  </span>
                  <span className="bm-chip">Today</span>
                </div>
                <div className="d-flex align-items-end gap-3">
                  <div>
                    {(() => {
                      const m = ensureProfileMetrics(activeProfileId).focus;
                      const latest = m.length ? m[m.length - 1].value : 7.3;
                      return (
                        <>
                          <div style={{ fontSize: "2.1rem", fontWeight: 600 }}>{latest}</div>
                          <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Self-reported focus</div>
                        </>
                      );
                    })()}
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <input
                        aria-label="focus"
                        value={focusInput}
                        onChange={(e) => setFocusInput(e.target.value)}
                        placeholder="0-10"
                        style={{ width: 70, padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(148,163,184,0.25)" }}
                      />
                      <button type="button" onClick={() => { const v = Number(focusInput); if (!Number.isFinite(v)) return; saveMetric(activeProfileId, "focus", v); setFocusInput(""); }} className="bm-profile-pill">Add</button>
                    </div>
                  </div>
                  <div className="ms-auto text-end">
                    <div style={{ fontSize: "0.8rem", color: "#f97373" }}>High band</div>
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                      Schedule recovery block tonight
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="bm-metric-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "#9ca3af",
                    }}
                  >
                    Training load
                  </span>
                  <span className="bm-chip">Rolling</span>
                </div>
                <div className="d-flex align-items-end gap-3">
                  <div>
                    {(() => {
                      const m = ensureProfileMetrics(activeProfileId).load;
                      const latest = m.length ? m[m.length - 1].value : 0.84;
                      return (
                        <>
                          <div style={{ fontSize: "2.1rem", fontWeight: 600 }}>{latest}</div>
                          <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Load:recovery ratio</div>
                        </>
                      );
                    })()}
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <input
                        aria-label="training load"
                        value={loadInput}
                        onChange={(e) => setLoadInput(e.target.value)}
                        placeholder="ratio"
                        style={{ width: 70, padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(148,163,184,0.25)" }}
                      />
                      <button type="button" onClick={() => { const v = Number(loadInput); if (!Number.isFinite(v)) return; saveMetric(activeProfileId, "load", v); setLoadInput(""); }} className="bm-profile-pill">Add</button>
                    </div>
                  </div>
                  <div className="ms-auto text-end">
                    <div style={{ fontSize: "0.8rem", color: "#4ade80" }}>Balanced</div>
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                      Safe to add a small push
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart + notes */}
            <div className="col-12 col-xl-8">
              <div className="bm-glass p-3 h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        color: "#9ca3af",
                      }}
                    >
                      Trend
                    </div>
                    <div style={{ fontSize: "0.95rem", color: "#e5edff" }}>
                      Sleep vs days of week
                    </div>
                  </div>
                  <span className="bm-chip">Mock data</span>
                </div>
                <div style={{ height: 260 }}>
                  {mounted && <Line data={lineData} options={lineOptions} />}
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="bm-glass p-3 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#9ca3af",
                    }}
                  >
                    Interpretation
                  </span>
                  <span className="bm-chip">Static</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#e5e7eb" }}>
                  You&apos;re currently in a reasonably healthy band: sleep trending up, load balanced, focus high.
                  The next step is wiring real inputs — sleep, energy, training, focus — into this shell.
                </p>
                <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                  This build is intentionally opinionated about layout and information density, but all metrics and
                  visuals are mock values for now.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}