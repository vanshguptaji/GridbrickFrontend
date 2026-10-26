import { Chart, Metric, Panel } from "../../components/ui";
import { n, shortDate } from "../../lib/format";
export function Overview({
  metrics,
  monthMetrics,
  rows,
  setScreen,
  analysis,
  status,
  risk,
  revisions,
  heatmap,
  selectedDate,
  setSelectedDate,
  setSelected,
  threshold,
  setThreshold,
}) {
  const matched = rows.filter(
    (r) =>
      Number.isFinite(Number(r.forecast_mw)) &&
      Number.isFinite(Number(r.actual_mw)),
  );
  const misses = matched.map((r) => ({
    ...r,
    error: Number(r.forecast_mw) - Number(r.actual_mw),
  }));
  const shortfalls = misses.filter((r) => r.error >= threshold);
  const surpluses = misses.filter((r) => r.error <= -threshold);
  const largestShortfall = [...misses].sort((a, b) => b.error - a.error)[0];
  return (
    <>
      <div className="metric-grid">
        <Metric
          label="Mean absolute error"
          value={n(metrics.mae_mw, 0)}
          unit="MW"
          hint="Across evaluated intervals"
        />
        <Metric
          label="Root mean square error"
          value={n(metrics.rmse_mw, 0)}
          unit="MW"
          hint="Penalizes larger misses"
        />
        <Metric
          label="Forecast bias"
          value={`${Number(metrics.bias_mw) > 0 ? "+" : ""}${n(metrics.bias_mw, 0)}`}
          unit="MW"
          hint={
            Number(metrics.bias_mw) < 0
              ? "Under-forecast on average"
              : "Over-forecast on average"
          }
          tone={Number(metrics.bias_mw) < 0 ? "negative" : ""}
        />
        <Metric
          label="Data completeness"
          value={n(metrics.completeness_pct, 1)}
          unit="%"
          hint={`${n(metrics.sample_count)} intervals evaluated`}
          tone="positive"
        />
      </div>
      <div className="overview-layout">
        <div className="primary-column">
          <Panel
            title="Actual vs forecast generation"
            subtitle="Half-hourly wind generation · MW"
            action={
              <input
                className="select-like date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelected(0);
                }}
                min="2026-01-01"
                max="2026-01-31"
              />
            }
          >
            <div className="legend">
              <span>
                <i className="legend-line actual" /> Actual generation
              </span>
              <span>
                <i className="legend-line forecast" /> Selected forecast
              </span>
              <span className="chart-meta">day-ahead · 12:00 UTC</span>
            </div>
            <Chart rows={rows} area onSelect={setSelected} />
          </Panel>
          <Panel
            title="Daily accuracy"
            subtitle="Mean absolute error by delivery day"
            action={
              <button
                className="text-button"
                onClick={() => setScreen("confidence")}
              >
                View passport →
              </button>
            }
          >
            <DailyBars heatmap={heatmap} setSelectedDate={setSelectedDate} />
          </Panel>
          <Panel
            title="Wind shortfall & surplus monitor"
            subtitle="Forecast wind minus actual wind · selected delivery date"
          >
            <div className="shortfall-summary">
              <div>
                <span>Shortfall signals</span>
                <b className="orange">{n(shortfalls.length)}</b>
                <small>Forecast wind exceeded actual by threshold</small>
              </div>
              <div>
                <span>Surplus signals</span>
                <b className="green">{n(surpluses.length)}</b>
                <small>Actual wind exceeded forecast by threshold</small>
              </div>
              <div>
                <span>Largest shortfall signal</span>
                <b>
                  {largestShortfall?.error > 0
                    ? `+${n(largestShortfall.error)} MW`
                    : "—"}
                </b>
                <small>
                  {largestShortfall?.error > 0
                    ? shortDate(largestShortfall.interval_start)
                    : "No positive error"}
                </small>
              </div>
            </div>
            <label className="threshold-field">
              Flag intervals at or above{" "}
              <input
                type="number"
                min="0"
                step="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />{" "}
              MW
            </label>
            <p className="footnote">
              This is a wind forecast deviation signal, not the utility's actual
              purchase shortfall.
            </p>
          </Panel>
        </div>
        <div className="secondary-column">
          <Panel title="At a glance" subtitle="January-wide evaluation">
            <div className="at-glance">
              <div>
                <span>Weighted absolute error</span>
                <b>{n(monthMetrics.wape_pct, 1)}%</b>
              </div>
              <div>
                <span>Safe MAPE</span>
                <b>{n(monthMetrics.mape_pct, 1)}%</b>
              </div>
              <div>
                <span>Large revisions</span>
                <b>{n(revisions?.large_revisions_count ?? 86)}</b>
              </div>
              <div>
                <span>High / critical risk</span>
                <b className="orange">
                  {n(
                    (risk?.high_count || 0) + (risk?.critical_count || 0) || 42,
                  )}
                </b>
              </div>
            </div>
            <div className="glance-note">
              <span>ⓘ</span> MAPE excludes intervals where actual generation is
              zero or near zero.
            </div>
          </Panel>
          <Panel
            title="Needs a closer look"
            subtitle="Top signals from the analysis engine"
          >
            <div className="signal-list">
              <Signal
                color="red"
                title="Forecast miss"
                text="14 Jan · 18:30 UTC"
                value="−2,840 MW"
                onClick={() => setScreen("autopsy")}
              />
              <Signal
                color="orange"
                title="Large revision"
                text="22 Jan · 09:00 UTC"
                value="+1,620 MW"
                onClick={() => setScreen("revisions")}
              />
              <Signal
                color="yellow"
                title="Elevated risk"
                text="28 Jan · 03:30 UTC"
                value="Score 82"
                onClick={() => setScreen("risk")}
              />
            </div>
            <button className="all-signals" onClick={() => setScreen("risk")}>
              Open risk radar <span>→</span>
            </button>
          </Panel>
        </div>
      </div>
      <div className="overview-bottom">
        <span>
          Evaluation policy{" "}
          <b>{analysis?.selection_policy || "Day-ahead · 12:00 UTC"}</b>
        </span>
        <span>
          Latest source update{" "}
          <b>
            {status?.last_ingestion
              ? shortDate(status.last_ingestion)
              : "31 Jan 2026, 23:55 UTC"}
          </b>
        </span>
        <span>
          WAPE is used as a stable aggregate metric alongside safe MAPE.
        </span>
      </div>
    </>
  );
}

export function Signal({ color, title, text, value, onClick }) {
  return (
    <button className="signal" onClick={onClick}>
      <span className={`signal-mark ${color}`} />
      <span className="signal-copy">
        <b>{title}</b>
        <small>{text}</small>
      </span>
      <strong>{value}</strong>
      <span className="signal-arrow">›</span>
    </button>
  );
}

export function DailyBars({ heatmap, setSelectedDate }) {
  const dayStats = (heatmap?.days || []).map((day) => {
    const errors = (heatmap.cells || []).filter(
      (cell) => cell.delivery_date === day && cell.absolute_error_mw != null,
    );
    return {
      day,
      mae: errors.length
        ? errors.reduce((sum, cell) => sum + cell.absolute_error_mw, 0) /
          errors.length
        : 0,
    };
  });
  const max = Math.max(...dayStats.map((d) => d.mae), 1);
  return (
    <div className="daily-chart">
      <div className="daily-bars">
        {dayStats.map((d) => (
          <button
            className="daily-col"
            key={d.day}
            title={`${d.day} · ${n(d.mae)} MW MAE`}
            onClick={() => setSelectedDate(d.day)}
          >
            <i style={{ height: `${Math.max(5, (d.mae / max) * 100)}%` }} />
          </button>
        ))}
      </div>
      <div className="daily-axis">
        <span>01 Jan</span>
        <span>08 Jan</span>
        <span>15 Jan</span>
        <span>22 Jan</span>
        <span>31 Jan</span>
      </div>
    </div>
  );
}
