export const START = '2026-01-01T00:00:00Z'
export const END = '2026-01-31T23:30:00Z'

export const nav = [
  ['overview', 'Overview', '◫'], ['explorer', 'Forecast explorer', '⌕'], ['time', 'Time machine', '◷'],
  ['revisions', 'Revision explorer', '↗'], ['confidence', 'Confidence passport', '◉'], ['autopsy', 'Forecast autopsy', '⌁'],
  ['heatmap', 'Risk & error heatmap', '▦'], ['risk', 'Wind risk radar', '⌖'], ['simulator', 'What-if simulator', '⤨'], ['market', 'Market price comparison', '£'], ['reviews', 'Reviews & alerts', '☷'], ['reports', 'Reports & exports', '⇩'],
]

export function pageDescription(screen) {
  return ({
    explorer: 'Explore actual generation alongside forecast vintages at each delivery interval.',
    time: 'Reconstruct the information available at a historical decision cutoff.',
    revisions: 'Trace forecast changes from first publication to the latest eligible vintage.',
    confidence: 'Understand how forecast error behaves across lead times and delivery hours.',
    autopsy: 'Inspect the intervals where forecasts missed the mark and why.',
    heatmap: 'Find difficult days and delivery periods in the half-hourly error heatmap.',
    risk: 'Prioritize forecast intervals for analyst review using explainable signals.',
    simulator: 'Change the demand, wind, and price assumptions and see scenario volumes update.',
    market: 'Compare public day-ahead and balancing price benchmarks with entered counterparty quotes.',
    reviews: 'Track investigations, review notes and configured alert events.',
    reports: 'Export the filtered data and evaluation details for offline analysis.',
  })[screen]
}
