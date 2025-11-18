# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Previso - Patient Dashboard

This project is a patient dashboard for tracking mental health check-ins and analyzing wellness trends.

### Features

- **Daily Check-ins**: Multi-step wizard for capturing sleep, mood, energy, social connection, and more
- **Comprehensive Analytics**: Advanced visualization tools for tracking trends and correlations
- **Circadian Rhythm Tracking**: Visual sleep/wake pattern analysis
- **Statistical Insights**: Trend indicators, averages, and correlation analysis

### Dashboard Charts

The dashboard includes multiple chart types for comprehensive data analysis:
- **Statistics Cards**: Quick overview with trends
- **Wellness Radar**: Multi-dimensional health profile
- **Multi-Metric Charts**: Compare multiple variables over time
- **Correlation Analysis**: Discover relationships between metrics
- **Trend Analysis**: Area charts with statistical reference lines
- **Bar Comparisons**: Side-by-side metric comparisons

For detailed documentation on the dashboard charts, see [DASHBOARD_CHARTS.md](./DASHBOARD_CHARTS.md).

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
