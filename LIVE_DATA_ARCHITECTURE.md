# 🚀 Live Data Architecture Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Core Data Functions](#core-data-functions)
4. [Data Transformation](#data-transformation)
5. [Component Architecture](#component-architecture)
6. [Data Flow](#data-flow)
7. [Error Handling](#error-handling)
8. [Performance Considerations](#performance-considerations)
9. [Maintenance & Updates](#maintenance--updates)

---

## 🎯 System Overview

### **Purpose**
Immigratic's live data integration system provides real-time immigration draw information directly from Supabase, eliminating the need for manual updates and ensuring visitors always see current immigration data.

### **Key Benefits**
- **Real-time updates** from immigration databases
- **Zero manual maintenance** required
- **Professional presentation** of live data
- **Competitive advantage** over static immigration sites

### **Technology Stack**
- **Backend**: Supabase (PostgreSQL)
- **Frontend**: Astro (SSR)
- **Data Sync**: Whalesync (Airtable → Supabase)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js

---

## 🗄️ Database Schema

### **ImmiWatch Table Structure**
```sql
-- Main immigration draws table
CREATE TABLE ImmiWatch (
  whalesync_postgres_id UUID PRIMARY KEY,
  name TEXT,                    -- "OINP-International Students - 2025-06-03"
  program TEXT,                 -- "OINP-International Students"
  region TEXT,                  -- "ALL"
  draw_date_most_recent DATE,   -- "2025-06-03"
  score INTEGER,                -- 68 (CRS cutoff score)
  scoring_system TEXT,          -- "CRS" or "PNP"
  filter_by_program TEXT,       -- "Express Entry" or "OINP"
  invitation INTEGER            -- 1350 (invitations issued)
);
```

### **Data Categories**
- **Express Entry Programs**: `filter_by_program = 'Express Entry'`
  - EE-CEC, EE-FSW, EE-PNP, EE-FST
  - EE-HEALTH, EE-TRADE, EE-EDUCATION, EE-FRENCH, EE-AGRICULTURE
- **OINP Programs**: `filter_by_program = 'OINP'`
  - OINP-International Students, OINP-In-Demand, OINP-FWS
  - OINP-Masters Stream, OINP-Trade, OINP-French, OINP-Human Capital, OINP-PhD Stream

---

## 🔧 Core Data Functions

### **1. Latest Draw Functions**

#### **`getLatestDrawForProgram(programCode: string)`**
```typescript
/**
 * Get the latest draw for a specific program
 * @param programCode - Program code (e.g., 'EE-CEC', 'OINP-International Students')
 * @returns Promise<DisplayImmiWatchDraw | null>
 */
export async function getLatestDrawForProgram(programCode: string): Promise<DisplayImmiWatchDraw | null>
```
- **Purpose**: Fetch latest draw data for any specific program
- **Filter**: `program = programCode`
- **Order**: `draw_date_most_recent DESC`
- **Limit**: 1 record
- **Returns**: Transformed draw data or null

#### **`getLatestExpressEntryDraw()`**
```typescript
/**
 * Get the latest Express Entry draw (any program)
 * @returns Promise<DisplayImmiWatchDraw | null>
 */
export async function getLatestExpressEntryDraw(): Promise<DisplayImmiWatchDraw | null>
```
- **Purpose**: Fetch latest draw across all Express Entry programs
- **Filter**: `filter_by_program = 'Express Entry'`
- **Use Case**: Main services page Express Entry card

#### **`getLatestOINPDraw()`**
```typescript
/**
 * Get the latest OINP draw (any stream)
 * @returns Promise<DisplayImmiWatchDraw | null>
 */
export async function getLatestOINPDraw(): Promise<DisplayImmiWatchDraw | null>
```
- **Purpose**: Fetch latest draw across all OINP streams
- **Filter**: `filter_by_program = 'OINP'`
- **Use Case**: Main services page OINP card

#### **Program-Specific Latest Draws**
```typescript
export async function getLatestCECDraw(): Promise<DisplayImmiWatchDraw | null>
export async function getLatestFSWDraw(): Promise<DisplayImmiWatchDraw | null>
export async function getLatestPNPDraw(): Promise<DisplayImmiWatchDraw | null>
export async function getLatestHealthDraw(): Promise<DisplayImmiWatchDraw | null>
```
- **Purpose**: Fetch latest draw for specific programs
- **Use Case**: Individual program pages (e.g., `/services/pr/ee-cec`)

### **2. Recent Draws Functions**

#### **`getRecentExpressEntryDraws()`**
```typescript
/**
 * Get the 3 most recent Express Entry draws
 * @returns Promise<DisplayImmiWatchDraw[]>
 */
export async function getRecentExpressEntryDraws(): Promise<DisplayImmiWatchDraw[]>
```
- **Purpose**: Fetch 3 most recent draws across all Express Entry programs
- **Filter**: `filter_by_program = 'Express Entry'`
- **Order**: `draw_date_most_recent DESC`
- **Limit**: 3 records
- **Use Case**: Main services page Recent Draws section

#### **`getRecentOINPDraws()`**
```typescript
/**
 * Get the 3 most recent OINP draws
 * @returns Promise<DisplayImmiWatchDraw[]>
 */
export async function getRecentOINPDraws(): Promise<DisplayImmiWatchDraw[]>
```
- **Purpose**: Fetch 3 most recent draws across all OINP streams
- **Filter**: `filter_by_program = 'OINP'`
- **Order**: `draw_date_most_recent DESC`
- **Limit**: 3 records
- **Use Case**: Main services page OINP Recent Draws section

### **3. Aggregation Functions**

#### **Total Invitations (2025)**
```typescript
export async function getCECTotalInvitations2025(): Promise<number>
export async function getHealthTotalInvitations2025(): Promise<number>
```
- **Purpose**: Calculate total invitations issued for specific programs in 2025
- **Filter**: `program = programCode` AND `draw_date_most_recent >= '2025-01-01'`
- **Aggregation**: `SUM(invitation)`

#### **Weighted Average CRS**
```typescript
export async function getCECWeightedAverageCRS2025(): Promise<number>
export async function getHealthWeightedAverageCRS2025(): Promise<number>
```
- **Purpose**: Calculate weighted average CRS scores by invitation count
- **Formula**: `SUM(score * invitation) / SUM(invitation)`
- **Filter**: `program = programCode` AND `draw_date_most_recent >= '2025-01-01'`

#### **Capacity Calculations**
```typescript
export async function getRealCapacityUsed2025(): Promise<number>
export async function getCapacityRemaining2025(): Promise<number>
```
- **Purpose**: Calculate Express Entry capacity usage and remaining
- **Formula**: 
  - Real Capacity Used = `SUM(all_ee_invitations) × 1.6`
  - Capacity Remaining = `89000 - Real Capacity Used`
- **Total Allocation**: 89,000 for all Express Entry programs

#### **Category Programs Capacity**
```typescript
export async function getCategoryProgramsRealCapacityUsed2025(): Promise<number>
export async function getCategoryProgramsCapacityRemaining2025(): Promise<number>
```
- **Purpose**: Calculate capacity for category-based programs (Healthcare, Trade, etc.)
- **Formula**:
  - Real Capacity Used = `SUM(category_invitations) × 1.6`
  - Capacity Remaining = `62000 - Real Capacity Used`
- **Total Allocation**: 62,000 for category-based programs

### **4. Trend Analysis Functions**

#### **CRS Trend Calculation**
```typescript
export async function getCECCRSTrend(): Promise<CRSTrendData | null>
export async function getHealthCRSTrend(): Promise<CRSTrendData | null>
```
- **Purpose**: Calculate CRS score difference from previous draw
- **Returns**:
  - `currentScore`, `previousScore`, `difference`
  - `trend`: 'up', 'down', or 'same'
  - `trendIcon`: '↑', '↓', or '→'
  - `trendColor`: CSS color classes

### **5. Chart Data Functions**

#### **Historical Data for Charts**
```typescript
export async function getCECDrawsForChart2025(): Promise<ChartDrawData[]>
export async function getHealthDrawsForChart2025(): Promise<ChartDrawData[]>
```
- **Purpose**: Fetch historical draw data for Chart.js visualizations
- **Filter**: `program = programCode` AND `draw_date_most_recent >= '2025-01-01'`
- **Order**: `draw_date_most_recent ASC`
- **Returns**: Array of draws with dates, scores, and invitations

---

## 🔄 Data Transformation

### **`transformImmiWatchData(draw: ImmiWatchDraw)`**
```typescript
export function transformImmiWatchData(draw: ImmiWatchDraw): DisplayImmiWatchDraw
```
- **Purpose**: Convert raw database data to user-friendly format
- **Transformations**:
  - `program` → `programName` (via `getProgramDisplayName`)
  - `draw_date_most_recent` → `drawDate` (formatted)
  - `score` → `crsScore`
  - `invitation` → `invitationsIssued`
  - `scoring_system` → `scoringSystem`
  - `filter_by_program` → `programCategory`

### **`getProgramDisplayName(programCode: string)`**
```typescript
export function getProgramDisplayName(programCode: string): string
```
- **Purpose**: Convert program codes to user-friendly names
- **Examples**:
  - `'EE-CEC'` → `'Canadian Experience Class'`
  - `'EE-HEALTH'` → `'Healthcare Workers'`
  - `'OINP-International Students'` → `'International Students'`

### **Date Formatting**
```typescript
export function formatDrawDate(dateString: string): string
```
- **Purpose**: Format database dates for display
- **Input**: `'2025-06-03'`
- **Output**: `'June 3, 2025'`

---

## 🧩 Component Architecture

### **Data Display Components**

#### **`LiveCECData.astro`**
- **Purpose**: Display latest CEC draw data
- **Data Source**: `getLatestCECDraw()`, `getCECCRSTrend()`
- **Features**: CRS score, invitations, CRS trend with visual indicators

#### **`LiveCECMetrics.astro`**
- **Purpose**: Display aggregated CEC program metrics
- **Data Source**: `getCECTotalInvitations2025()`, `getCECWeightedAverageCRS2025()`
- **Features**: Total invitations, average CRS, capacity remaining

#### **`LiveCECChart.astro`**
- **Purpose**: Visualize CEC CRS trends over time
- **Data Source**: `getCECDrawsForChart2025()`
- **Features**: Chart.js dual-axis chart (CRS line + invitations bars)

#### **`LiveHealthData.astro`**
- **Purpose**: Display latest Healthcare draw data
- **Data Source**: `getLatestHealthDraw()`, `getHealthCRSTrend()`
- **Features**: Similar to CEC but for Healthcare category

#### **`LiveHealthMetrics.astro`**
- **Purpose**: Display aggregated Healthcare metrics
- **Data Source**: `getHealthTotalInvitations2025()`, `getHealthWeightedAverageCRS2025()`
- **Features**: Category-specific capacity calculations

#### **`LiveHealthChart.astro`**
- **Purpose**: Visualize Healthcare CRS trends over time
- **Data Source**: `getHealthDrawsForChart2025()`
- **Features**: Chart.js visualization with green color scheme

#### **`LiveExpressEntryData.astro`**
- **Purpose**: Display latest Express Entry draw on main services page
- **Data Source**: `getLatestExpressEntryDraw()`
- **Features**: Program name, CRS score, draw date

#### **`LiveRecentDraws.astro`**
- **Purpose**: Display 3 most recent Express Entry draws
- **Data Source**: `getRecentExpressEntryDraws()`
- **Features**: Program abbreviations, CRS scores, dates

#### **`LiveOINPData.astro`**
- **Purpose**: Display latest OINP draw on main services page
- **Data Source**: `getLatestOINPDraw()`
- **Features**: Program name, score, stream type

#### **`LiveOINPRecentDraws.astro`**
- **Purpose**: Display 3 most recent OINP draws
- **Data Source**: `getRecentOINPDraws()`
- **Features**: Stream abbreviations, scores, dates

### **Component Features**
- **Loading States**: Handle data fetching gracefully
- **Error Handling**: Display fallback content when data unavailable
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Hover Effects**: Interactive elements with smooth transitions
- **Live Indicators**: Visual cues showing real-time data

---

## 🔄 Data Flow

### **1. Data Source**
```
Airtable → Whalesync → Supabase → ImmiWatch Table
```

### **2. Data Fetching**
```
Component → Function Call → Supabase Query → Raw Data
```

### **3. Data Transformation**
```
Raw Data → transformImmiWatchData() → DisplayImmiWatchDraw
```

### **4. Component Rendering**
```
Transformed Data → Astro Component → HTML Output
```

### **5. Client-Side Enhancement**
```
HTML → Chart.js Script → Interactive Charts
```

---

## ⚠️ Error Handling

### **Database Connection Errors**
- **Supabase Connection**: Graceful fallback to static content
- **Query Errors**: Console logging for debugging
- **Data Validation**: Null checks and default values

### **Data Availability**
- **Empty Results**: Display "No data available" messages
- **Partial Data**: Show available information with placeholders
- **Date Formatting**: Fallback to ISO format if parsing fails

### **Component Loading**
- **Async Operations**: Handle loading states
- **Error Boundaries**: Prevent component crashes
- **Fallback Content**: Always provide user experience

---

## ⚡ Performance Considerations

### **Build-Time Data Fetching**
- **SSR Benefits**: Data fetched during build, not client-side
- **Static Generation**: Pages pre-rendered with current data
- **CDN Caching**: Static assets cached globally

### **Data Optimization**
- **Selective Queries**: Only fetch required fields
- **Limit Clauses**: Restrict result sets (e.g., limit 3 for recent draws)
- **Efficient Filtering**: Use indexed columns for queries

### **Component Efficiency**
- **Conditional Rendering**: Only render when data available
- **Lazy Loading**: Charts load after component mount
- **Memory Management**: Clean up Chart.js instances

---

## 🔧 Maintenance & Updates

### **Automatic Updates**
- **Whalesync Sync**: Continuous Airtable → Supabase synchronization
- **Build Triggers**: New deployments fetch fresh data
- **Zero Manual Work**: System self-updates

### **Data Monitoring**
- **Console Logging**: Track data fetching and transformation
- **Error Reporting**: Monitor for database connection issues
- **Performance Metrics**: Track query response times

### **Adding New Programs**
1. **Database**: Add new program to ImmiWatch table
2. **Functions**: Create program-specific fetch functions
3. **Components**: Build display components
4. **Integration**: Add to relevant pages

### **Schema Changes**
- **Interface Updates**: Modify TypeScript interfaces
- **Function Updates**: Update transformation logic
- **Component Updates**: Adjust data display logic

---

## 📊 Usage Examples

### **Adding Live Data to New Page**
```astro
---
import { getLatestCECDraw } from '../lib/immiwatch-data';

const latestDraw = await getLatestCECDraw();
---

<div class="live-data-card">
  <h3>Latest CEC Draw</h3>
  <p>CRS Score: {latestDraw?.crsScore || 'N/A'}</p>
  <p>Date: {latestDraw?.drawDate || 'No data'}</p>
</div>
```

### **Creating New Aggregation Function**
```typescript
export async function getNewProgramTotalInvitations2025(programCode: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('invitation')
      .eq('program', programCode)
      .gte('draw_date_most_recent', '2025-01-01')
    
    if (error) throw error;
    
    return data?.reduce((sum, record) => sum + (record.invitation || 0), 0) || 0;
  } catch (error) {
    console.error(`Error fetching ${programCode} total invitations:`, error);
    return 0;
  }
}
```

---

## 🎯 Best Practices

### **Data Fetching**
- Always use try-catch blocks
- Log errors for debugging
- Provide fallback values
- Use appropriate TypeScript types

### **Component Design**
- Handle loading and error states
- Use consistent naming conventions
- Maintain responsive design
- Include accessibility features

### **Performance**
- Limit query results appropriately
- Use efficient database filters
- Implement proper error boundaries
- Monitor build times

---

## 🚀 Future Enhancements

### **Real-Time Updates**
- WebSocket connections for live data
- Push notifications for new draws
- Real-time dashboard updates

### **Advanced Analytics**
- Predictive CRS score modeling
- Program success rate analysis
- Historical trend predictions

### **Data Export**
- CSV/PDF report generation
- API endpoints for external access
- Data visualization tools

---

## 📞 Support & Troubleshooting

### **Common Issues**
1. **Data Not Loading**: Check Supabase connection and API keys
2. **Component Errors**: Verify data transformation functions
3. **Build Failures**: Check for TypeScript errors
4. **Performance Issues**: Monitor query optimization

### **Debugging Tools**
- Browser console logging
- Supabase dashboard queries
- Build-time error messages
- Component error boundaries

---

*This documentation is maintained by the Immigratic development team. Last updated: January 2025*
