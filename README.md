# WindLens frontend

WindLens is a React workspace for exploring UK wind-generation forecast quality, replaying forecast vintages, investigating error intervals, and comparing public market-price references. The default evaluation range is January 2026.

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` in `.env.local` to the backend API root. The current local configuration uses `http://localhost:8002/api/v1`; change it to match the port where the FastAPI backend is running. Vite reads this variable at startup, so restart the dev server after changing it.

## Screens

- Overview, forecast explorer, and forecast time machine
- Revision explorer, confidence passport, and forecast autopsy
- Daily × settlement-period forecast-error heatmap and wind-risk radar
- What-if simulator with editable demand, wind-generation shock, and optional price assumption
- Market price comparison with public N2EX/Elexon references and manually entered counterparty quotes
- Reviews, alerts, and reports/exports

Charts expose delivery timestamps and values on hover; clicking a chart point or heatmap cell opens the interval in the explorer. Sample display values are used when the associated API data is unavailable and are presented as illustrative.

## Data and API notes

The frontend calls the FastAPI backend routes under `/api/v1`, including `/analysis/heatmap`, `/market/prices`, `/market/compare-quotes`, and `/simulations`. See the backend README for payloads, formulas, and source limitations. Public prices are system-wide market references, not supplier offers. Counterparty rows are entered by the user and are compared by the backend without being stored.

The backend currently has no account-authentication endpoints. The sign-in and sign-up screens create a browser-local demo profile; they do not authenticate requests or attach an Authorization header.

## Checks

```sh
npm run lint
npm run build
```

## Source layout

```text
src/
├── App.jsx                    # App state, data orchestration, and screen composition
├── components/
│   ├── layout/                 # Workspace shell, navigation, headers, status strip
│   └── ui/                     # Shared chart, button, metric, panel, and icon
├── features/                   # One folder and screen module per product section
│   ├── auth/
│   ├── overview/
│   ├── explorer/
│   ├── time-machine/
│   ├── revisions/
│   ├── confidence/
│   ├── autopsy/
│   ├── heatmap/
│   ├── risk/
│   ├── simulator/
│   ├── market/
│   ├── reviews/
│   └── reports/
├── lib/                        # API client, constants, formatting, demo data
└── styles/                     # Base, layout, feature, chart, and responsive styles
```
