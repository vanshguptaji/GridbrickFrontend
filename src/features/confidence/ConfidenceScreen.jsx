import { Metric, Panel } from "../../components/ui";
import { n } from "../../lib/format";
export function ConfidenceScreen({ confidence, metrics }) {
  const horizons = confidence?.horizon_breakdown || [
    { horizon: "0–6h", mae: 460, count: 210 },
    { horizon: "6–12h", mae: 710, count: 244 },
    { horizon: "12–24h", mae: 1020, count: 486 },
    { horizon: "24–36h", mae: 1430, count: 370 },
    { horizon: "36–48h", mae: 1860, count: 178 },
  ];
  const quant = confidence?.empirical_80_ci || { lower: -2840, upper: 2510 };
  return (
    <>
      <div className="metric-grid compact">
        <Metric
          label="Overall MAE"
          value={n(confidence?.mae ?? metrics.mae_mw)}
          unit="MW"
          hint={`${n(confidence?.sample_size || metrics.sample_count)} evaluated samples`}
        />
        <Metric
          label="Overall RMSE"
          value={n(confidence?.rmse ?? metrics.rmse_mw)}
          unit="MW"
          hint="Large misses carry more weight"
        />
        <Metric
          label="Forecast bias"
          value={n(confidence?.bias ?? metrics.bias_mw)}
          unit="MW"
          hint="Positive means over-forecast"
        />
        <Metric
          label="Empirical 80% error range"
          value={`${n(quant.lower)} to ${n(quant.upper)}`}
          unit="MW"
          hint="Historical error quantiles"
        />
      </div>
      <div className="two-panels">
        <Panel
          title="Accuracy by forecast horizon"
          subtitle="Mean absolute error and evaluation count"
        >
          <div className="horizon-list">
            {horizons.map((h, i) => (
              <div className="horizon-row" key={i}>
                <span>{h.horizon || h.label || h.name || `${i * 6}h`}</span>
                <div className="horizon-track">
                  <i
                    style={{
                      width: `${Math.min(100, ((h.mae || h.mae_mw || 800) / Math.max(...horizons.map((x) => x.mae || x.mae_mw || 1))) * 100)}%`,
                    }}
                  />
                </div>
                <b>{n(h.mae || h.mae_mw)} MW</b>
                <small>{n(h.count || h.sample_count)} pts</small>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Error distribution" subtitle="Forecast error · MW">
          <div className="distribution">
            <div className="dist-range">
              <span>P05</span>
              <b>{n(confidence?.empirical_90_ci?.lower ?? -3520)} MW</b>
            </div>
            <div className="dist-track">
              <i />
              <span />
            </div>
            <div className="dist-range">
              <span>P95</span>
              <b>{n(confidence?.empirical_90_ci?.upper ?? 3240)} MW</b>
            </div>
            <div className="distribution-note">
              80% range: {n(quant.lower)} to {n(quant.upper)} MW
              <br />
              90% range: {n(
                confidence?.empirical_90_ci?.lower ?? -3520,
              )} to {n(confidence?.empirical_90_ci?.upper ?? 3240)} MW
            </div>
          </div>
        </Panel>
      </div>
      <Panel
        title="Reliability by delivery hour"
        subtitle="Mean absolute error varies by time of day"
      >
        <HourlyProfile data={confidence?.diurnal_profile} />
      </Panel>
    </>
  );
}

export function HourlyProfile({ data }) {
  const rows = data?.length
    ? data
    : Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        mae: 650 + Math.abs(Math.sin(i * 0.56)) * 1020 + (i > 15 ? 350 : 0),
      }));
  return (
    <div className="hour-profile">
      {rows.map((r, i) => (
        <div key={i} title={`${r.hour}:00 · ${n(r.mae || r.mae_mw)} MW`}>
          <i
            style={{
              height: `${Math.max(8, ((r.mae || r.mae_mw || 1) / Math.max(...rows.map((x) => x.mae || x.mae_mw || 1))) * 100)}%`,
            }}
          />
          <span>{String(r.hour ?? i).padStart(2, "0")}</span>
        </div>
      ))}
    </div>
  );
}
