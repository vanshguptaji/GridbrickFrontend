import { useState } from "react";
import { Panel } from "../../components/ui";
import { n, shortDate } from "../../lib/format";
export function HeatmapScreen({ heatmap, onSelect }) {
  const [threshold, setThreshold] = useState(1000);
  const days =
    heatmap?.days ||
    Array.from(
      { length: 31 },
      (_, i) => `2026-01-${String(i + 1).padStart(2, "0")}`,
    );
  const values = heatmap?.cells?.length
    ? heatmap.cells
    : days.flatMap((day, d) =>
        Array.from({ length: 48 }, (_, slot) => {
          const err = Math.round(
            2500 * Math.sin(d * 0.63 + slot * 0.25) * Math.cos(slot * 0.18),
          );
          return {
            delivery_date: day,
            settlement_period: slot + 1,
            interval_start: `${day}T${String(Math.floor(slot / 2)).padStart(2, "0")}:${slot % 2 ? "30" : "00"}:00Z`,
            absolute_error_mw: Math.abs(err),
            error_mw: err,
            forecast_mw: 9000 + err,
            actual_mw: 9000,
          };
        }),
      );
  const lookup = new Map(
    values.map((c) => [`${c.delivery_date}:${c.settlement_period}`, c]),
  );
  const worst = [...values]
    .filter((c) => c.absolute_error_mw != null)
    .sort((a, b) => b.absolute_error_mw - a.absolute_error_mw)
    .slice(0, 10);
  const max = Math.max(...values.map((c) => c.absolute_error_mw || 0), 1);
  return (
    <>
      <div className="heatmap-toolbar">
        <span>
          <b>{n(heatmap?.evaluated_intervals || worst.length)}</b> evaluated
          intervals
        </span>
        <span>
          <b>{n(heatmap?.missing_intervals || 0)}</b> missing intervals
        </span>
        <label>
          Highlight above{" "}
          <input
            type="number"
            min="0"
            step="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />{" "}
          MW
        </label>
        <span className="toolbar-note">
          Positive error = wind over-forecast / shortfall signal
        </span>
      </div>
      {!heatmap?.cells?.length && (
        <div className="notice">
          Illustrative fallback heatmap. Connect the backend analysis heatmap
          for actual interval data.
        </div>
      )}
      <Panel
        title="January forecast-error heatmap"
        subtitle="Delivery day × half-hour settlement period · hover for exact timestamp and values"
      >
        <div className="heatmap-scroll">
          <div className="heatmap-axis">
            <span>DELIVERY DAY</span>
            <div>
              {Array.from({ length: 48 }, (_, i) =>
                i % 8 === 0 ? (
                  <span key={i} style={{ gridColumn: i + 1 }}>
                    {String(Math.floor(i / 2)).padStart(2, "0")}:00
                  </span>
                ) : null,
              )}
            </div>
          </div>
          <div className="heatmap-grid">
            {days.map((day) => (
              <div className="heatmap-row" key={day}>
                <button
                  className="heatmap-day"
                  onClick={() => onSelect({ delivery_date: day })}
                >
                  {day.slice(-2)} Jan
                </button>
                <div className="heatmap-cells">
                  {Array.from({ length: 48 }, (_, i) => {
                    const c = lookup.get(`${day}:${i + 1}`);
                    const value = c?.error_mw;
                    const opacity =
                      c?.absolute_error_mw == null
                        ? 0
                        : 0.18 + 0.72 * Math.min(1, c.absolute_error_mw / max);
                    const color =
                      value > 0
                        ? `rgba(202, 103, 77, ${opacity})`
                        : `rgba(57, 128, 96, ${opacity})`;
                    const title = c
                      ? `${day} ${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"} UTC · forecast ${n(c.forecast_mw)} MW · actual ${n(c.actual_mw)} MW · error ${value > 0 ? "+" : ""}${n(value)} MW`
                      : `${day} SP${i + 1} · missing data`;
                    return (
                      <button
                        key={i}
                        className={`heat-cell ${c?.absolute_error_mw >= threshold ? "above-threshold" : ""}`}
                        title={title}
                        style={{
                          backgroundColor:
                            c?.absolute_error_mw == null ? "#edf0ee" : color,
                        }}
                        onClick={() => c && onSelect(c)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="heatmap-legend">
          <span>
            <i className="low-error" /> Lower error
          </span>
          <span>
            <i className="high-error" /> Higher error
          </span>
          <span>
            <i className="over-error" /> Over-forecast
          </span>
          <span>
            <i className="under-error" /> Under-forecast
          </span>
          <span>
            <i className="missing-error" /> Missing
          </span>
        </div>
      </Panel>
      <Panel
        title="10 largest deviations"
        subtitle="Click an interval to inspect its selected forecast vintage"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Delivery interval</th>
                <th>Forecast</th>
                <th>Actual</th>
                <th>Signed error</th>
                <th>Absolute error</th>
                <th>Threshold</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {worst.map((c, i) => (
                <tr key={i}>
                  <td>{shortDate(c.interval_start)}</td>
                  <td>{n(c.forecast_mw)} MW</td>
                  <td>{n(c.actual_mw)} MW</td>
                  <td className={c.error_mw > 0 ? "orange" : "green"}>
                    {c.error_mw > 0 ? "+" : ""}
                    {n(c.error_mw)} MW
                  </td>
                  <td>
                    <b>{n(c.absolute_error_mw)} MW</b>
                  </td>
                  <td>
                    {c.absolute_error_mw >= threshold ? "Above" : "Below"}
                  </td>
                  <td>
                    <button className="small-link" onClick={() => onSelect(c)}>
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
