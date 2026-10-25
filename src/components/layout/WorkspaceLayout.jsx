import { Button, Icon } from '../ui'
import { nav } from '../../lib/constants'
import { n, shortDate } from '../../lib/format'

export function WorkspaceLayout({ profile, screen, setScreen, health, demoMode, apiHost, riskCount, onRefresh, onLogout, onExport, onRefreshSource, loading, error, onDismissError, status, actualCount, title, description, isOverview, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">W</span><span>windlens</span></div>
        <div className="workspace-switch"><span className="workspace-icon">N</span><span><b>Northstar Energy</b><small>Procurement desk</small></span><span className="chevron">⌄</span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav>{nav.map(([id, label, glyph]) => <button key={id} className={`nav-item ${screen === id ? 'active' : ''}`} onClick={() => setScreen(id)}><Icon>{glyph}</Icon>{label}{id === 'risk' && riskCount > 0 && <span className="nav-count">{riskCount}</span>}</button>)}</nav>
        <div className="sidebar-bottom">
          <div className="api-state"><span className={`state-dot ${health === 'connected' ? 'online' : ''}`}/><span><b>API {health === 'connected' ? 'connected' : health === 'checking' ? 'checking…' : 'offline'}</b><small>{apiHost}</small></span><button title="Refresh data" onClick={onRefresh}>↻</button></div>
          <div className="profile"><div className="avatar">{profile.name.slice(0, 1).toUpperCase()}</div><div><b>{profile.name}</b><small>{profile.email}</small></div><button onClick={onLogout} title="Sign out">⋯</button></div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <b>{title}</b></div><div className="top-actions"><span className="period-tag"><span className="tiny-dot"/> Jan 1 – 31, 2026</span><button className="icon-button" onClick={onRefresh} title="Refresh">↻</button><button className="avatar top-avatar" title={profile.name}>{profile.name.slice(0, 1).toUpperCase()}</button></div></header>
        <div className="content">
          <div className="page-heading"><div><div className="eyebrow">WIND FORECAST INTELLIGENCE <span>·</span> JANUARY 2026</div><h1>{isOverview ? `Good morning, ${profile.name.split(' ')[0]}` : title}<span className="heading-period">{isOverview ? ' — here’s your wind outlook.' : ''}</span></h1><p>{isOverview ? 'A clear view of what’s forecast, what changed, and where to look closer.' : description}</p></div><div className="heading-actions"><Button onClick={onExport} kind="secondary">⇩ <span>Export</span></Button><Button onClick={onRefresh} kind="primary">{loading ? 'Refreshing…' : '↻  Refresh data'}</Button></div></div>
          {error && <div className="notice"><span>ⓘ</span>{error}<button onClick={onDismissError}>×</button></div>}
          <div className="data-strip"><span className={`status-pill ${demoMode || health === 'offline' ? 'warn' : 'good'}`}><i/>{demoMode ? 'Sample data where unavailable' : health === 'offline' ? 'API unavailable' : 'Data connected'}</span><span>Last ingestion <b>{status?.last_ingestion_run?.completed_at ? shortDate(status.last_ingestion_run.completed_at) : 'Jan 31, 2026'}</b></span><span>Source <b>Elexon BMRS · FUELHH / WINDFOR</b></span><span>Intervals <b>{n(status?.total_actuals_count || actualCount || 1_440)}</b></span><button onClick={onRefreshSource}>Refresh source ↗</button></div>
          {children}
          <footer className="footer"><span>WindLens <b>·</b> Analytical workspace</span><span>All timestamps shown in UTC <b>·</b> January 2026 evaluation scope</span></footer>
        </div>
      </main>
    </div>
  )
}
