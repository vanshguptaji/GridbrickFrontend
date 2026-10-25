export const n = (value, digits = 0) => Number.isFinite(Number(value)) ? Number(value).toLocaleString('en-GB', { maximumFractionDigits: digits }) : '—'
export const shortDate = value => value ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC' : '—'
export const firstPresent = (...values) => values.find(value => value !== null && value !== undefined && value !== '')

export function summarizeRows(rows, fallback) {
  const matched = rows.filter(r => Number.isFinite(Number(r.actual_mw)) && Number.isFinite(Number(r.forecast_mw)))
  if (!matched.length) return fallback
  const errors = matched.map(r => Number(r.forecast_mw) - Number(r.actual_mw))
  const abs = errors.map(Math.abs)
  const mape = matched.filter(r => Number(r.actual_mw) > 100)
  return {
    ...fallback,
    sample_count: matched.length,
    evaluated_intervals: matched.length,
    completeness_pct: matched.length / 48 * 100,
    mae_mw: abs.reduce((a, b) => a + b, 0) / matched.length,
    rmse_mw: Math.sqrt(errors.reduce((a, b) => a + b * b, 0) / matched.length),
    bias_mw: errors.reduce((a, b) => a + b, 0) / matched.length,
    mape_pct: mape.length ? mape.reduce((sum, r) => sum + Math.abs(Number(r.forecast_mw) - Number(r.actual_mw)) / Number(r.actual_mw) * 100, 0) / mape.length : 0,
    wape_pct: abs.reduce((a, b) => a + b, 0) / matched.reduce((sum, r) => sum + Number(r.actual_mw), 0) * 100,
  }
}
