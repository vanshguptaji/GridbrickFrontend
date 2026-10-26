import { Chart, Panel } from "../../components/ui";
import { demo } from "../../lib/demoData";
import { n, shortDate } from "../../lib/format";
export function TimeMachine({
  date,
  setDate,
  cutoff,
  setCutoff,
  replay,
  replayError,
}) {
  const cutoffTime = new Date(`${cutoff}:00Z`).getTime();
  const rows =
    replay?.intervals ||
    demo.map((r, i) => ({
      interval_start: r.interval_start.replace("2026-01-15", date),
      forecast_mw: r.forecast_mw,
      actual_mw:
        cutoffTime >=
        new Date(r.interval_start.replace("2026-01-15", date)).getTime()
          ? r.actual_mw
          : null,
      is_actual_revealed:
        cutoffTime >=
        new Date(r.interval_start.replace("2026-01-15", date)).getTime(),
      publication_count_up_to_cutoff: Math.max(0, 10 - (i % 12)),
    }));
  const hasEligibleForecast = rows.some(
    (row) =>
      row.forecast_mw != null && Number.isFinite(Number(row.forecast_mw)),
  );
  const chartRows = hasEligibleForecast
    ? rows
    : rows.map((row, i) => ({
        ...row,
        forecast_mw: demo[i % demo.length].forecast_mw,
      }));
  const forecastNotice = !hasEligibleForecast && !replayError;
  return (
    <>
      <div className="toolbar">
        <label>
          Delivery date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min="2026-01-01"
            max="2026-01-31"
          />
        </label>
        <label>
          Decision cutoff (UTC)
          <input
            type="datetime-local"
            value={cutoff}
            onChange={(e) => setCutoff(e.target.value)}
          />
        </label>
        <span className="toolbar-note">
          <span className="lock">◉</span> Actuals are hidden until each interval
          is delivered
        </span>
      </div>
      <Panel
        title="Information available at cutoff"
        subtitle={`Forecast publications available by ${shortDate(new Date(`${cutoff}:00Z`).toISOString())}`}
      >
        {(replayError || forecastNotice) && (
          <div className="data-warning">
            {replayError ||
              "No eligible forecast values were returned for this cutoff. The forecast line below is illustrative; interval details still show backend data."}
          </div>
        )}
        <div className="legend">
          <span>
            <i className="legend-line forecast" />{" "}
            {forecastNotice
              ? "Illustrative forecast"
              : "Latest eligible forecast"}
          </span>
          <span>
            <i className="legend-line actual" /> Actual (revealed after
            delivery)
          </span>
        </div>
        <Chart
          rows={chartRows}
          actualLabel="Actual generation (hidden before delivery)"
          forecastLabel={
            forecastNotice
              ? "Illustrative forecast"
              : "Latest eligible forecast"
          }
        />
        <div className="replay-legend">
          <span>
            Published forecasts{" "}
            <b>
              {n(
                rows.reduce(
                  (a, r) => a + (r.publication_count_up_to_cutoff || 0),
                  0,
                ),
              )}
            </b>
          </span>
          <span>
            Intervals with actuals revealed{" "}
            <b>{n(rows.filter((r) => r.is_actual_revealed).length)} / 48</b>
          </span>
        </div>
      </Panel>
      <Panel
        title="Delivery timeline"
        subtitle="Publication availability and realized output by settlement period"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Delivery interval</th>
                <th>Latest forecast</th>
                <th>Published</th>
                <th>Revisions</th>
                <th>Actual generation</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 16).map((r, i) => (
                <tr key={i}>
                  <td>{shortDate(r.interval_start)}</td>
                  <td>
                    {r.forecast_mw == null ? "—" : `${n(r.forecast_mw)} MW`}
                  </td>
                  <td>
                    {r.latest_forecast_publish_time
                      ? shortDate(r.latest_forecast_publish_time)
                      : "—"}
                  </td>
                  <td>{r.total_revisions_so_far ?? "—"}</td>
                  <td>
                    {r.actual_mw == null ? "Hidden" : `${n(r.actual_mw)} MW`}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${r.is_actual_revealed ? "good" : "neutral"}`}
                    >
                      <i />
                      {r.is_actual_revealed ? "Delivered" : "Forecast only"}
                    </span>
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
