function makeDemo() {
  return Array.from({ length: 48 }, (_, i) => {
    const hour = i / 2;
    const actual = Math.max(
      1700,
      8200 +
        4200 * Math.sin(((hour - 5) / 24) * Math.PI * 2) +
        1500 * Math.sin((hour / 24) * Math.PI * 6),
    );
    const forecast = Math.max(
      1200,
      actual + 1300 * Math.sin(i * 0.79) + 500 * Math.cos(i * 0.31),
    );
    return {
      interval_start: `2026-01-15T${String(Math.floor(hour)).padStart(2, "0")}:${i % 2 ? "30" : "00"}:00Z`,
      actual_mw: Math.round(actual),
      forecast_mw: Math.round(forecast),
      error_mw: Math.round(forecast - actual),
      absolute_error_mw: Math.round(Math.abs(forecast - actual)),
      lead_time_hours: 24,
    };
  });
}

export const demo = makeDemo();
export const demoMetrics = {
  sample_count: 1488,
  evaluated_intervals: 1488,
  completeness_pct: 96.8,
  mae_mw: 1184,
  rmse_mw: 1620,
  bias_mw: -186,
  mape_pct: 18.4,
  wape_pct: 13.2,
};
