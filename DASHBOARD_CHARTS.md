# Dashboard Charts Documentation

This document describes the analysis charts added to the patient dashboard.

## Overview

The dashboard now includes comprehensive visualization tools for analyzing check-in data over time. All charts are designed to be robust, handling edge cases like null values and empty datasets gracefully.

## Chart Components

### 1. StatisticsCard
**Purpose**: Displays key statistical metrics with trend indicators.

**Features**:
- Current value with large, readable display
- 30-day average
- Min-max range
- Week-over-week trend with percentage change
- Visual trend indicators (up/down/stable arrows)

**Used for**: Sleep quality, energy level, mental activation, social connection

---

### 2. WellnessRadarChart
**Purpose**: Provides a multi-dimensional overview of overall wellness.

**Features**:
- Compares 6 wellness dimensions (Sleep, Energy, Mood, Focus, Social, Calm)
- Shows current period (last 7 days) vs previous period (days 8-14)
- Normalized scale (0-4) for all metrics
- Interactive tooltips with exact values

**Metrics visualized**:
- Sleep: Quality of sleep
- Energy: Physical energy level
- Mood: Inverted depression score (higher is better)
- Focus: Inverted distractibility (higher is better)
- Social: Social connection level
- Calm: Inverted anxiety score (higher is better)

---

### 3. MultiMetricChart
**Purpose**: Compare multiple related metrics on the same timeline.

**Features**:
- Line chart with multiple colored lines
- Shared timeline for easy comparison
- Interactive legend (click to show/hide metrics)
- Tooltips showing all metric values at a point in time

**Examples**:
- **Mood & Activation**: Tracks activation, depression, and anxiety together
- **Energy & Focus**: Compares energy, motivation, and distractibility

---

### 4. AreaTrendChart
**Purpose**: Visualize trends with filled areas and statistical reference.

**Features**:
- Smooth area chart with gradient fill
- Average reference line for context
- Handles missing data gracefully (connects valid points)
- Shows both current value and average in tooltip

**Used for**:
- Sleep quality trends
- Anxiety/stress trends
- Social connection over time
- Mental processing speed (rumination axis)

---

### 5. BarComparisonChart
**Purpose**: Compare discrete numeric values side by side.

**Features**:
- Grouped bar charts for direct comparison
- Color-coded bars for different metrics
- Suitable for count-based data

**Examples**:
- **Task Management**: Planned vs completed tasks
- **Physical Activity**: Exercise duration vs caffeine consumption

---

### 6. CorrelationScatterChart
**Purpose**: Discover relationships between two variables.

**Features**:
- Scatter plot with each point representing a day
- Pearson correlation coefficient calculation
- Correlation strength indicator (weak/moderate/strong)
- Reference lines at midpoint values
- Date-labeled tooltips

**Examples**:
- **Sleep vs Energy**: Does better sleep correlate with more energy?
- **Activation vs Anxiety**: How does mental activation relate to anxiety?

**Correlation interpretation**:
- r ≥ 0.7: Strong positive correlation
- 0.3 ≤ r < 0.7: Moderate positive correlation
- -0.3 < r < 0.3: Weak correlation
- -0.7 < r ≤ -0.3: Moderate negative correlation
- r ≤ -0.7: Strong negative correlation

---

## Data Handling

All charts implement robust error handling:

1. **Null values**: Charts connect valid data points, skipping nulls
2. **Empty datasets**: Display gracefully without errors
3. **Missing nested data**: Safe property access prevents crashes
4. **Edge cases**: Handle single data points, all-null datasets, etc.

## Performance Considerations

- **useMemo**: Data processing is memoized to prevent unnecessary recalculations
- **Efficient rendering**: Recharts library provides optimized SVG rendering
- **Responsive**: All charts adapt to container width using ResponsiveContainer

## Color Scheme

Charts use CSS custom properties for theming:
- Primary: `hsl(var(--primary))`
- Chart-1 through Chart-5: `hsl(var(--chart-1))` etc.
- Muted colors for backgrounds and grids
- Semantic colors for trends (green for positive, red for negative)

## Data Time Ranges

- **Statistics Cards**: Last 30 days
- **Wellness Radar**: Last 7 days vs previous 7 days
- **All Other Charts**: Last 30 days
- **Circadian Rhythm**: Up to 14 days (separately configured)

## Future Enhancements

Potential improvements for future iterations:
1. Exportable charts (PNG/PDF)
2. Configurable time ranges
3. Custom metric selection
4. Predictive analytics
5. Alert thresholds
6. Mobile-optimized touch interactions
