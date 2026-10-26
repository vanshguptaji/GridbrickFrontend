import { useState } from "react";
import { demo } from "../../lib/demoData";
import { n, shortDate } from "../../lib/format";
export function Chart({
  rows,
  height = 230,
  actualKey = "actual_mw",
  forecastKey = "forecast_mw",
  thirdKey,
  actualLabel = "Actual generation",
  forecastLabel = "Forecast generation",
  thirdLabel = "System sell price",
  unit = "MW",
  area = false,
  onSelect,
}) {
  const [hovered, setHovered] = useState(null);
  const width = 760,
    pad = { t: 15, r: 14, b: 30, l: 48 };
  const data = rows?.length ? rows.slice(0, 96) : demo;
  const vals = data.flatMap((d) =>
    [d[actualKey], d[forecastKey], thirdKey ? d[thirdKey] : null]
      .filter((v) => v != null && Number.isFinite(Number(v)))
      .map(Number),
  );
  const max = Math.max(...vals, 1) * 1.12;
  const min = Math.min(...vals, 0);
  const low = min < 0 ? min * 1.12 : 0;
  const x = (i) =>
    pad.l + (i * (width - pad.l - pad.r)) / Math.max(data.length - 1, 1);
  const y = (v) =>
    height -
    pad.b -
    ((Number(v || 0) - low) / (max - low)) * (height - pad.t - pad.b);
  const line = (key, bridgeGaps = false) => {
    let active = false;
    return data
      .map((d, i) => {
        if (d[key] == null || !Number.isFinite(Number(d[key]))) {
          if (!bridgeGaps) active = false;
          return "";
        }
        const segment = `${active ? "L" : "M"}${x(i)},${y(d[key])}`;
        active = true;
        return segment;
      })
      .join(" ");
  };
  const fill = `${line(actualKey)} L${x(data.length - 1)},${height - pad.b} L${x(0)},${height - pad.b} Z`;
  function chooseIndex(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointX = ((event.clientX - rect.left) / rect.width) * width;
    return Math.max(
      0,
      Math.min(
        data.length - 1,
        Math.round(
          ((pointX - pad.l) / (width - pad.l - pad.r)) * (data.length - 1),
        ),
      ),
    );
  }
  function axis(value) {
    return unit === "MW" ? `${n(value / 1000, 1)}k` : n(value, 0);
  }
  const point = hovered == null ? null : data[hovered];
  return (
    <div className="chart-shell">
      <div className="chart-wrap">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="chart"
          role="img"
          aria-label={`Interactive ${unit} time series`}
          onMouseMove={(e) => setHovered(chooseIndex(e))}
          onMouseLeave={() => setHovered(null)}
          onClick={(e) => onSelect?.(chooseIndex(e))}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((v) => {
            const val = low + (max - low) * v;
            return (
              <g key={v}>
                <line
                  x1={pad.l}
                  x2={width - pad.r}
                  y1={y(val)}
                  y2={y(val)}
                  className="gridline"
                />
                <text
                  x={pad.l - 8}
                  y={y(val) + 4}
                  textAnchor="end"
                  className="axis-label"
                >
                  {axis(val)}
                </text>
              </g>
            );
          })}
          {area && <path d={fill} className="chart-area" />}
          <path d={line(actualKey)} className="line actual-line" />
          <path d={line(forecastKey, true)} className="line forecast-line" />
          {thirdKey && <path d={line(thirdKey)} className="line third-line" />}
          {point && (
            <>
              <line
                x1={x(hovered)}
                x2={x(hovered)}
                y1={pad.t}
                y2={height - pad.b}
                className="crosshair"
              />
              {point[actualKey] != null && (
                <circle
                  cx={x(hovered)}
                  cy={y(point[actualKey])}
                  r="4"
                  className="hover-dot actual-dot"
                />
              )}
              {point[forecastKey] != null && (
                <circle
                  cx={x(hovered)}
                  cy={y(point[forecastKey])}
                  r="4"
                  className="hover-dot forecast-dot"
                />
              )}
              {thirdKey && point[thirdKey] != null && (
                <circle
                  cx={x(hovered)}
                  cy={y(point[thirdKey])}
                  r="4"
                  className="hover-dot third-dot"
                />
              )}
            </>
          )}
          <text x={pad.l} y={height - 6} className="axis-label">
            00:00
          </text>
          <text
            x={width / 2}
            y={height - 6}
            textAnchor="middle"
            className="axis-label"
          >
            12:00
          </text>
          <text
            x={width - pad.r}
            y={height - 6}
            textAnchor="end"
            className="axis-label"
          >
            23:30
          </text>
        </svg>
      </div>
      {point && (
        <div className="chart-tooltip">
          <b>{shortDate(point.interval_start || point.start_time)}</b>
          <span>
            <i className="legend-dot actual" />
            {actualLabel}
            <strong>
              {point[actualKey] == null
                ? "—"
                : `${n(point[actualKey], 1)} ${unit}`}
            </strong>
          </span>
          <span>
            <i className="legend-dot forecast" />
            {forecastLabel}
            <strong>
              {point[forecastKey] == null
                ? "—"
                : `${n(point[forecastKey], 1)} ${unit}`}
            </strong>
          </span>
          {thirdKey && (
            <span>
              <i className="legend-dot third" />
              {thirdLabel}
              <strong>
                {point[thirdKey] == null
                  ? "—"
                  : `${n(point[thirdKey], 1)} ${unit}`}
              </strong>
            </span>
          )}
          {point.error_mw != null && (
            <span className="tooltip-error">
              Forecast error<strong>{n(point.error_mw, 1)} MW</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
