import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { API_HOST, query, request } from './lib/api'
import { END, nav, pageDescription, START } from './lib/constants'
import { demo, demoMetrics } from './lib/demoData'
import { firstPresent, summarizeRows } from './lib/format'
import { WorkspaceLayout } from './components/layout/WorkspaceLayout'
import { AuthScreen } from './features/auth/AuthScreen'
import { Overview } from './features/overview/OverviewScreen'
import { HeatmapScreen } from './features/heatmap/HeatmapScreen'
import { Explorer } from './features/explorer/ForecastExplorerScreen'
import { TimeMachine } from './features/time-machine/TimeMachineScreen'
import { RevisionScreen } from './features/revisions/RevisionScreen'
import { ConfidenceScreen } from './features/confidence/ConfidenceScreen'
import { AutopsyScreen } from './features/autopsy/AutopsyScreen'
import { RiskScreen } from './features/risk/RiskScreen'
import { Simulator } from './features/simulator/SimulatorScreen'
import { MarketScreen } from './features/market/MarketScreen'
import { ReviewScreen } from './features/reviews/ReviewScreen'
import { Reports } from './features/reports/ReportsScreen'

function App() {
  const [profile, setProfile] = useState(() => { try { return JSON.parse(localStorage.getItem('windlens-profile')) } catch { return null } })
  const [screen, setScreen] = useState('overview')
  const [demoMode, setDemoMode] = useState(false)
  const [health, setHealth] = useState('checking')
  const [status, setStatus] = useState(null)
  const [actuals, setActuals] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [revisions, setRevisions] = useState(null)
  const [risk, setRisk] = useState(null)
  const [autopsy, setAutopsy] = useState(null)
  const [replay, setReplay] = useState(null)
  const [replayError, setReplayError] = useState('')
  const [simulation, setSimulation] = useState(null)
  const [investigations, setInvestigations] = useState([])
  const [alertRules, setAlertRules] = useState([])
  const [events, setEvents] = useState([])
  const [heatmap, setHeatmap] = useState(null)
  const [marketPrices, setMarketPrices] = useState(null)
  const [dayActuals, setDayActuals] = useState([])
  const [dayForecasts, setDayForecasts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState('2026-01-15')
  const [selectedDate, setSelectedDate] = useState('2026-01-15')
  const [cutoff, setCutoff] = useState('2026-01-14T12:00')
  const [selected, setSelected] = useState(0)
  const [demand, setDemand] = useState(32000)
  const [windShock, setWindShock] = useState(0)
  const [priceOverride, setPriceOverride] = useState('')
  const [deviationThreshold, setDeviationThreshold] = useState(1000)
  const [quoteRows, setQuoteRows] = useState([])
  const [policy, setPolicy] = useState('day_ahead_1200')
  const [severity, setSeverity] = useState('')
  const periodStart = `${START.slice(0, 10)}T00:00:00Z`
  const periodEnd = `${END.slice(0, 10)}T23:30:00Z`

  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    const jobs = [
      ['health', '/health', setHealth, x => x.status === 'healthy' ? 'connected' : 'degraded'],
      ['status', '/data/status', setStatus],
      ['actuals', `/actuals?${query({ start: periodStart, end: periodEnd, limit: '1500' })}`, setActuals],
      ['analysis', '/analyses', setAnalysis],
      ['confidence', `/confidence?${query({ date_from: periodStart, date_to: periodEnd, selection_policy: policy })}`, setConfidence],
      ['revisions', `/forecasts/revisions?${query({ date_from: periodStart, date_to: periodEnd, threshold_mw: '800' })}`, setRevisions],
      ['risk', `/risk/intervals?${query({ date_from: periodStart, date_to: periodEnd, ...(severity ? { severity } : {}) })}`, setRisk],
      ['autopsy', `/autopsy/summary?${query({ date_from: periodStart, date_to: periodEnd, top_n: '10' })}`, setAutopsy],
      ['heatmap', `/analysis/heatmap?${query({ date_from: periodStart, date_to: periodEnd, selection_policy: policy, threshold_mw: '1000' })}`, setHeatmap],
      ['marketPrices', `/market/prices?${query({ date_from: periodStart.slice(0, 10), date_to: periodEnd.slice(0, 10) })}`, setMarketPrices],
      ['investigations', '/investigations', setInvestigations], ['alertRules', '/alerts/rules', setAlertRules], ['events', '/alerts/events?limit=100', setEvents],
    ]
    let failed = false
    await Promise.all(jobs.map(async ([key, path, setter, map]) => { try { const isAnalysis = key === 'analysis'; const value = await request(path, isAnalysis ? { method: 'POST', body: JSON.stringify({ date_from: periodStart, date_to: periodEnd, selection_policy: policy, decision_cutoff: null, horizon_hours: null, metrics: ['mae', 'rmse', 'bias', 'mape', 'wape'] }) } : {}); setter(map ? map(value) : value) } catch { failed = true; if (key === 'health') setHealth('offline') } }))
    setDemoMode(failed); if (failed) setError('Some backend data is unavailable. Sample values are shown where needed. Check the API URL and backend status.'); setLoading(false)
  }, [policy, severity, periodStart, periodEnd])
  useEffect(() => { if (!profile) return; const timer = setTimeout(refresh, 0); return () => clearTimeout(timer) }, [profile, refresh])
  useEffect(() => { if (!profile) return; const timer = setTimeout(() => { setReplayError(''); request(`/time-machine/replay?${query({ delivery_date: deliveryDate, decision_cutoff: new Date(`${cutoff}:00Z`).toISOString() })}`).then(snapshot => setReplay({ ...snapshot, intervals: (snapshot.intervals || []).map(row => ({ ...row, forecast_mw: firstPresent(row.forecast_mw, row.forecast_generation_mw, row.latest_forecast_mw, row.generation_mw), actual_mw: firstPresent(row.actual_mw, row.actual_generation_mw, row.realized_mw), latest_forecast_publish_time: firstPresent(row.latest_forecast_publish_time, row.forecast_publish_time, row.publish_time) })) })).catch(() => { setReplay(null); setReplayError('Replay data is unavailable from the backend. The chart is showing illustrative sample data.') }) }, 250); return () => clearTimeout(timer) }, [profile, deliveryDate, cutoff])
  useEffect(() => { if (!profile) return; const start = `${selectedDate}T00:00:00Z`, end = `${selectedDate}T23:30:00Z`; let alive = true; Promise.all([request(`/actuals?${query({ start, end, limit: 60 })}`), request(`/forecasts?${query({ start, end, limit: 2500 })}`)]).then(([a, f]) => { if (alive) { setDayActuals(a); setDayForecasts(f) } }).catch(() => { if (alive) { setDayActuals(demo); setDayForecasts([]) } }); return () => { alive = false } }, [profile, selectedDate])

  const dataRows = useMemo(() => {
    if (!dayForecasts.length && dayActuals.some(a => a.forecast_mw != null)) return dayActuals
    const byTime = new Map(dayActuals.map(a => [new Date(a.start_time || a.interval_start).getTime(), a]))
    const forecastByTime = new Map()
    dayForecasts.forEach(f => { const key = new Date(f.start_time).getTime(); forecastByTime.set(key, [...(forecastByTime.get(key) || []), { ...f, generation_mw: firstPresent(f.generation_mw, f.forecast_mw, f.forecast_generation_mw, f.value_mw) }]) })
    return [...byTime.entries()].map(([t, a]) => { const versions = forecastByTime.get(t) || []; const interval = new Date(t); const cutoffTime = policy === 'day_ahead_1200' ? new Date(`${new Date(t).toISOString().slice(0, 10)}T12:00:00Z`) : interval; if (policy === 'day_ahead_1200') cutoffTime.setUTCDate(cutoffTime.getUTCDate() - 1); const eligible = policy === 'earliest_available' ? versions : versions.filter(f => new Date(f.publish_time) <= cutoffTime); const f = policy === 'earliest_available' ? eligible[0] : eligible.at(-1); return { interval_start: a.start_time || a.interval_start, actual_mw: a.generation_mw ?? a.actual_mw, forecast_mw: f?.generation_mw, forecast_publish_time: firstPresent(f?.publish_time, f?.forecast_publish_time, f?.published_at), error_mw: f ? Number(f.generation_mw) - Number(a.generation_mw ?? a.actual_mw) : null } })
  }, [dayActuals, dayForecasts, policy])
  const visibleMetrics = analysis?.metrics || demoMetrics
  const selectedDayMetrics = summarizeRows(dataRows, visibleMetrics)
  const title = nav.find(item => item[0] === screen)?.[1] || 'Overview'

  if (!profile) return <AuthScreen onLogin={setProfile}/>
  function logout() { localStorage.removeItem('windlens-profile'); setProfile(null) }
  async function runSimulation() { try { setSimulation(await request('/simulations', { method: 'POST', body: JSON.stringify({ date_from: periodStart, date_to: periodEnd, policies: ['day_ahead_1200', 'latest_available', 'earliest_available'], assumed_demand_mw: Number(demand), forecast_shock_mw: Number(windShock), include_market_prices: true, day_ahead_price_override_gbp_mwh: priceOverride === '' ? null : Number(priceOverride) }) })) } catch { setSimulation({ evaluated_intervals: dataRows.filter(r => r.forecast_mw != null).length, assumed_demand_mw: Number(demand), forecast_shock_mw: Number(windShock), takeaway_summary: 'Backend simulation is unavailable. The local preview below uses the selected delivery day only.', policy_results: [], market_price_data: { included: false, available: false, summary: marketPrices?.summary || null, sources: marketPrices?.sources || [], limitations: 'The backend simulation endpoint is offline.' } }) } }
  async function createReview(row) { const payload = { interval_start: row.interval_start, reason: row.diagnosis || row.reasons?.join(', ') || 'Forecast risk flagged for analyst review', notes: '', created_by: profile.email }; try { await request('/investigations', { method: 'POST', body: JSON.stringify(payload) }); setInvestigations(await request('/investigations')) } catch { setInvestigations(items => [{ id: `local-${Date.now()}`, ...payload, status: 'open', created_at: new Date().toISOString() }, ...items]) } }
  async function downloadCsv() { try { const blob = await request(`/reports/export/csv?${query({ date_from: START, date_to: END, selection_policy: policy })}`); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'windlens-evaluation-jan-2026.csv'; a.click(); URL.revokeObjectURL(url) } catch { const csv = ['interval_start,forecast_mw,actual_mw,error_mw', ...demo.map(r => `${r.interval_start},${r.forecast_mw},${r.actual_mw},${r.error_mw}`)].join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'windlens-demo-evaluation.csv'; a.click() } }

  async function refreshSource() { try { await request('/data/refresh', { method: 'POST', body: JSON.stringify({}) }); setError('January 2026 data refresh requested.') } catch { setError('Could not request a refresh from the backend.') } }

  return <WorkspaceLayout profile={profile} screen={screen} setScreen={setScreen} health={health} demoMode={demoMode} apiHost={API_HOST} riskCount={risk?.critical_count || 0} onRefresh={refresh} onLogout={logout} onExport={downloadCsv} onRefreshSource={refreshSource} loading={loading} error={error} onDismissError={() => setError('')} status={status} actualCount={actuals.length} title={title} description={pageDescription(screen)} isOverview={screen === 'overview'}>
      {screen === 'overview' && <Overview metrics={selectedDayMetrics} monthMetrics={visibleMetrics} rows={dataRows} setScreen={setScreen} analysis={analysis} status={status} risk={risk} revisions={revisions} heatmap={heatmap} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setSelected={setSelected} threshold={deviationThreshold} setThreshold={setDeviationThreshold}/>}
      {screen === 'explorer' && <Explorer rows={dataRows} metrics={selectedDayMetrics} selected={selected} setSelected={setSelected} policy={policy} setPolicy={setPolicy} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>}
      {screen === 'time' && <TimeMachine date={deliveryDate} setDate={setDeliveryDate} cutoff={cutoff} setCutoff={setCutoff} replay={replay} replayError={replayError}/>}
      {screen === 'revisions' && <RevisionScreen revisions={revisions}/>}
      {screen === 'confidence' && <ConfidenceScreen confidence={confidence} metrics={visibleMetrics}/>}
      {screen === 'autopsy' && <AutopsyScreen autopsy={autopsy} onReview={createReview}/>}
      {screen === 'risk' && <RiskScreen risk={risk} severity={severity} setSeverity={setSeverity} onReview={createReview} onInvestigate={row => { setSelected(0); setSelectedDate(String(row.interval_start).slice(0, 10)); setScreen('explorer'); localStorage.setItem('windlens-focus-interval', row.interval_start) }}/>}
      {screen === 'heatmap' && <HeatmapScreen heatmap={heatmap} onSelect={row => { setSelectedDate(row.delivery_date); setSelected(0); setScreen('explorer') }}/>} 
      {screen === 'simulator' && <Simulator demand={demand} setDemand={setDemand} windShock={windShock} setWindShock={setWindShock} priceOverride={priceOverride} setPriceOverride={setPriceOverride} run={runSimulation} simulation={simulation} marketPrices={marketPrices} rows={dataRows}/>}
      {screen === 'market' && <MarketScreen marketPrices={marketPrices} selectedDate={selectedDate} setSelectedDate={setSelectedDate} quoteRows={quoteRows} setQuoteRows={setQuoteRows}/>}
      {screen === 'reviews' && <ReviewScreen investigations={investigations} rules={alertRules} events={events} refresh={refresh}/>}
      {screen === 'reports' && <Reports onDownload={downloadCsv} policy={policy} setPolicy={setPolicy} metrics={visibleMetrics} rows={dataRows}/>}
  </WorkspaceLayout>
}

export default App
