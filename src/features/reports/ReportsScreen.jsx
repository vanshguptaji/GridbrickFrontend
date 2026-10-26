import { Button, Panel } from "../../components/ui";
import { n } from "../../lib/format";
export function Reports({ onDownload, policy, setPolicy, metrics, rows }) {
  return (
    <>
      <div className="report-hero">
        <div>
          <span className="eyebrow">REPRODUCIBLE EXPORTS</span>
          <h2>Take the analysis with you.</h2>
          <p>
            Export interval details with the evaluation policy and scope used to
            generate them.
          </p>
        </div>
        <span className="report-icon">⇩</span>
      </div>
      <div className="report-grid">
        <article className="report-card">
          <span className="report-kind">CSV · INTERVAL DETAIL</span>
          <h3>Forecast evaluation data</h3>
          <p>
            Interval-by-interval forecast, actual, error and publication
            information for the selected scope.
          </p>
          <div className="report-meta">
            <span>
              Period <b>Jan 1–31, 2026</b>
            </span>
            <span>
              Selection <b>{policy.replaceAll("_", " ")}</b>
            </span>
            <span>
              Rows <b>{n(metrics.sample_count)}</b>
            </span>
          </div>
          <Button kind="primary" onClick={onDownload}>
            ⇩ Download CSV
          </Button>
        </article>
        <article className="report-card summary-card">
          <span className="report-kind">SUMMARY · JANUARY 2026</span>
          <h3>Accuracy snapshot</h3>
          <p>Headline quality metrics from the current evaluation policy.</p>
          <div className="report-metrics">
            <span>
              MAE <b>{n(metrics.mae_mw)} MW</b>
            </span>
            <span>
              RMSE <b>{n(metrics.rmse_mw)} MW</b>
            </span>
            <span>
              Bias <b>{n(metrics.bias_mw)} MW</b>
            </span>
            <span>
              Completeness <b>{n(metrics.completeness_pct, 1)}%</b>
            </span>
          </div>
          <Button kind="secondary" onClick={onDownload}>
            ⇩ Export summary data
          </Button>
        </article>
      </div>
      <Panel
        title="Export settings"
        subtitle="These parameters are recorded with each report"
      >
        <div className="toolbar report-toolbar">
          <label>
            Evaluation scope
            <input value="January 1–31, 2026" readOnly />
          </label>
          <label>
            Forecast selection
            <select value={policy} onChange={(e) => setPolicy(e.target.value)}>
              <option value="day_ahead_1200">Day-ahead · 12:00 UTC</option>
              <option value="latest_available">Latest available</option>
              <option value="earliest_available">Earliest available</option>
            </select>
          </label>
          <label>
            Interval rows
            <input value={n(rows.length ? metrics.sample_count : 0)} readOnly />
          </label>
        </div>
        <div className="export-note">
          Policy and data scope are included in the backend CSV metadata when
          available. Sample export is used if the report endpoint is offline.
        </div>
      </Panel>
      <Panel title="Data coverage" subtitle="Current export scope">
        <div className="coverage-row">
          <span>Actual generation records</span>
          <b>{n(metrics.sample_count)}</b>
          <span>Forecasted wind intervals</span>
          <b>{n(metrics.evaluated_intervals)}</b>
          <span>Evaluation window</span>
          <b>2026-01-01 — 2026-01-31</b>
        </div>
      </Panel>
    </>
  );
}
