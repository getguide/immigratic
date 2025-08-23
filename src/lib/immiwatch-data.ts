import { supabase } from './supabase'

// Types for ImmiWatch table data
export interface ImmiWatchDraw {
  whalesync_postgres_id: string
  name: string // "EE-PNP - 2025-02-04"
  program: string // "EE-PNP"
  region: string // "ALL"
  draw_date_most_recent: string // "2025-02-04"
  score: number // 802 (CRS cutoff score)
  scoring_system: string // "CRS"
  filter_by_program: string // "Express Entry"
  invitation: number // 455 (invitations issued)
}

// User-friendly display interface
export interface DisplayImmiWatchDraw {
  id: string
  programName: string // "Provincial Nominee Program"
  drawDate: string // "February 4, 2025"
  crsScore: number // 802
  invitationsIssued: number // 455
  scoringSystem: string // "CRS"
  region: string // "ALL"
  programCategory: string // "Express Entry"
}

/**
 * Get the latest draw for a specific program
 */
export async function getLatestDrawForProgram(programCode: string): Promise<DisplayImmiWatchDraw | null> {
  try {
    console.log(`getLatestDrawForProgram: Fetching latest ${programCode} draw...`);
    
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('*')
      .eq('program', programCode)
      .order('draw_date_most_recent', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error(`Error fetching latest ${programCode} draw:`, error)
      return null
    }

    if (!data) {
      console.log(`No ${programCode} data found in ImmiWatch table`);
      return null
    }

    console.log(`Found ${programCode} data:`, data);
    const transformed = transformImmiWatchData(data);
    console.log(`Transformed ${programCode} data:`, transformed);
    return transformed;
  } catch (error) {
    console.error(`Error fetching latest ${programCode} draw:`, error)
    return null
  }
}

/**
 * Get the latest CEC draw
 */
export async function getLatestCECDraw(): Promise<DisplayImmiWatchDraw | null> {
  return getLatestDrawForProgram('EE-CEC');
}

/**
 * Get the latest FSW draw
 */
export async function getLatestFSWDraw(): Promise<DisplayImmiWatchDraw | null> {
  return getLatestDrawForProgram('EE-FSW');
}

/**
 * Get the latest PNP draw
 */
export async function getLatestPNPDraw(): Promise<DisplayImmiWatchDraw | null> {
  return getLatestDrawForProgram('EE-PNP');
}

/**
 * Get the latest HEALTH draw
 */
export async function getLatestHealthDraw(): Promise<DisplayImmiWatchDraw | null> {
  return getLatestDrawForProgram('EE-HEALTH');
}

/**
 * Get the latest Express Entry draw (any program)
 */
export async function getLatestExpressEntryDraw(): Promise<DisplayImmiWatchDraw | null> {
  try {
    console.log('getLatestExpressEntryDraw: Fetching latest Express Entry draw...');
    
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('*')
      .eq('filter_by_program', 'Express Entry')
      .order('draw_date_most_recent', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching latest Express Entry draw:', error)
      return null
    }

    if (!data) {
      console.log('No Express Entry data found in ImmiWatch table');
      return null
    }

    console.log('Found Express Entry data:', data);
    const transformed = transformImmiWatchData(data);
    console.log('Transformed Express Entry data:', transformed);
    return transformed;
  } catch (error) {
    console.error('Error fetching latest Express Entry draw:', error)
    return null
  }
}

/**
 * Get total HEALTH invitations for 2025
 */
export async function getHealthTotalInvitations2025(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('invitation')
      .eq('program', 'EE-HEALTH')
      .gte('draw_date_most_recent', '2025-01-01')
      .lte('draw_date_most_recent', '2025-12-31')

    if (error) {
      console.error('Error fetching HEALTH total invitations 2025:', error)
      return 0
    }

    const total = data?.reduce((sum, row) => sum + (row.invitation || 0), 0) || 0
    console.log(`Total HEALTH invitations 2025: ${total}`)
    return total
  } catch (error) {
    console.error('Error calculating HEALTH total invitations 2025:', error)
    return 0
  }
}

/**
 * Get weighted average CRS for HEALTH in 2025
 * Formula: SUM(score * invitation) / SUM(invitation)
 */
export async function getHealthWeightedAverageCRS2025(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('score, invitation')
      .eq('program', 'EE-HEALTH')
      .gte('draw_date_most_recent', '2025-01-01')
      .lte('draw_date_most_recent', '2025-12-31')

    if (error) {
      console.error('Error fetching HEALTH weighted average CRS 2025:', error)
      return 0
    }

    if (!data || data.length === 0) return 0

    const totalWeightedScore = data.reduce((sum, row) => sum + ((row.score || 0) * (row.invitation || 0)), 0)
    const totalInvitations = data.reduce((sum, row) => sum + (row.invitation || 0), 0)

    if (totalInvitations === 0) return 0

    const weightedAverage = Math.round(totalWeightedScore / totalInvitations)
    console.log(`Weighted average CRS for HEALTH 2025: ${weightedAverage}`)
    return weightedAverage
  } catch (error) {
    console.error('Error calculating HEALTH weighted average CRS 2025:', error)
    return 0
  }
}

/**
 * Get total invitations for ALL category-based programs in 2025
 * Includes: EE-HEALTH, EE-Trade, EE-Education, EE-French, EE-Agriculture
 */
export async function getAllCategoryProgramsTotalInvitations2025(): Promise<number> {
  try {
    console.log('🔍 DEBUG: Starting category programs total calculation...')
    
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('program, invitation, draw_date_most_recent')
      .in('program', ['EE-HEALTH', 'EE-Trade', 'EE-Education', 'EE-French', 'EE-Agriculture'])
      .gte('draw_date_most_recent', '2025-01-01')
      .lte('draw_date_most_recent', '2025-12-31')

    if (error) {
      console.error('Error fetching all category programs total invitations 2025:', error)
      return 0
    }

    console.log('🔍 DEBUG: Raw data from Supabase:', data)
    console.log('🔍 DEBUG: Number of records found:', data?.length || 0)
    
    if (data && data.length > 0) {
      console.log('🔍 DEBUG: Sample records:')
      data.slice(0, 5).forEach((row, index) => {
        console.log(`  Record ${index + 1}: Program=${row.program}, Invitations=${row.invitation}, Date=${row.draw_date_most_recent}`)
      })
    }

    const total = data?.reduce((sum, row) => {
      const invitationCount = row.invitation || 0
      console.log(`🔍 DEBUG: Adding ${invitationCount} from ${row.program}`)
      return sum + invitationCount
    }, 0) || 0
    
    console.log(`🔍 DEBUG: Final total: ${total}`)
    return total
  } catch (error) {
    console.error('Error calculating all category programs total invitations 2025:', error)
    return 0
  }
}

/**
 * Calculate real capacity used for category-based programs with 1.6x coefficient
 * Formula: Total Invitations × 1.6
 */
export async function getCategoryProgramsRealCapacityUsed2025(): Promise<number> {
  const totalInvitations = await getAllCategoryProgramsTotalInvitations2025()
  const realCapacityUsed = Math.round(totalInvitations * 1.6)
  console.log(`Real capacity used for category programs 2025 (with 1.6x): ${realCapacityUsed}`)
  return realCapacityUsed
}

/**
 * Calculate capacity remaining from 62,000 total allocation for category programs
 * Formula: 62,000 - Real Capacity Used
 */
export async function getCategoryProgramsCapacityRemaining2025(): Promise<number> {
  const realCapacityUsed = await getCategoryProgramsRealCapacityUsed2025()
  const capacityRemaining = 62000 - realCapacityUsed
  console.log(`Category programs capacity remaining 2025: ${capacityRemaining}`)
  return capacityRemaining
}

/**
 * Get CRS trend comparison between latest and previous HEALTH draw
 * Shows score difference and trend direction
 */
export async function getHealthCRSTrend(): Promise<{
  currentScore: number
  previousScore: number | null
  difference: number | null
  trend: 'up' | 'down' | 'same' | 'first'
  trendText: string
  trendIcon: string
  trendColor: string
} | null> {
  try {
    // Get latest 2 HEALTH draws
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('score, draw_date_most_recent')
      .eq('program', 'EE-HEALTH')
      .order('draw_date_most_recent', { ascending: false })
      .limit(2)

    if (error) {
      console.error('Error fetching HEALTH CRS trend:', error)
      return null
    }

    if (!data || data.length === 0) return null

    const currentScore = data[0]?.score || 0
    const previousScore = data.length > 1 ? data[1]?.score : null

    if (!previousScore) {
      return {
        currentScore,
        previousScore: null,
        difference: null,
        trend: 'first',
        trendText: 'First draw of 2025',
        trendIcon: '→',
        trendColor: 'text-gray-500'
      }
    }

    const difference = currentScore - previousScore
    let trend: 'up' | 'down' | 'same'
    let trendText: string
    let trendIcon: string
    let trendColor: string

    if (difference > 0) {
      trend = 'up'
      trendIcon = '↑'
      trendText = `${difference}`
      trendColor = 'text-green-600'
    } else if (difference < 0) {
      trend = 'down'
      trendIcon = '↓'
      trendText = `${Math.abs(difference)}`
      trendColor = 'text-red-600'
    } else {
      trend = 'same'
      trendIcon = '→'
      trendText = '0'
      trendColor = 'text-gray-500'
    }

    console.log(`HEALTH CRS trend: ${currentScore} (${trendIcon} ${trendText})`)
    return {
      currentScore,
      previousScore,
      difference,
      trend,
      trendText,
      trendIcon,
      trendColor
    }
  } catch (error) {
    console.error('Error calculating HEALTH CRS trend:', error)
    return null
  }
}

/**
 * Get HEALTH draws for chart visualization in 2025
 * Returns array of draws with date, score, and invitations
 */
export async function getHealthDrawsForChart2025(): Promise<{
  drawDate: string
  crsScore: number
  invitationsIssued: number
}[]> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('draw_date_most_recent, score, invitation')
      .eq('program', 'EE-HEALTH')
      .gte('draw_date_most_recent', '2025-01-01')
      .lte('draw_date_most_recent', '2025-12-31')
      .order('draw_date_most_recent', { ascending: true })

    if (error) {
      console.error('Error fetching HEALTH draws for chart 2025:', error)
      return []
    }

    if (!data || data.length === 0) return []

    const chartData = data.map(row => ({
      drawDate: new Date(row.draw_date_most_recent).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      crsScore: row.score || 0,
      invitationsIssued: row.invitation || 0
    }))

    console.log(`HEALTH chart data 2025: ${chartData.length} draws`)
    return chartData
  } catch (error) {
    console.error('Error preparing HEALTH chart data 2025:', error)
    return []
  }
}

/**
 * Get total invitations for a program in a time period
 */
export async function getTotalInvitationsForProgram(
  programCode: string, 
  startDate: string, 
  endDate: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('invitation')
      .eq('program', programCode)
      .gte('draw_date_most_recent', startDate)
      .lte('draw_date_most_recent', endDate)

    if (error) {
      console.error(`Error fetching total invitations for ${programCode}:`, error)
      return 0
    }

    const total = data?.reduce((sum, row) => sum + (row.invitation || 0), 0) || 0
    console.log(`Total invitations for ${programCode} (${startDate} to ${endDate}): ${total}`)
    return total
  } catch (error) {
    console.error(`Error calculating total invitations for ${programCode}:`, error)
    return 0
  }
}

/**
 * Get average CRS score for a program in a time period
 */
export async function getAverageCRSForProgram(
  programCode: string, 
  startDate: string, 
  endDate: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('score')
      .eq('program', programCode)
      .gte('draw_date_most_recent', startDate)
      .lte('draw_date_most_recent', endDate)

    if (error) {
      console.error(`Error fetching average CRS for ${programCode}:`, error)
      return 0
    }

    if (!data || data.length === 0) return 0

    const total = data.reduce((sum, row) => sum + (row.score || 0), 0)
    const average = Math.round(total / data.length)
    console.log(`Average CRS for ${programCode} (${startDate} to ${endDate}): ${average}`)
    return average
  } catch (error) {
    console.error(`Error calculating average CRS for ${programCode}:`, error)
    return 0
  }
}

/**
 * Get total CEC invitations for 2025
 */
export async function getCECTotalInvitations2025(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('invitation')
      .eq('program', 'EE-CEC')
      .gte('draw_date_most_recent', '2025-01-01')
      .lte('draw_date_most_recent', '2025-12-31')

    if (error) {
      console.error('Error fetching CEC total invitations 2025:', error)
      return 0
    }

    const total = data?.reduce((sum, row) => sum + (row.invitation || 0), 0) || 0
    console.log(`Total CEC invitations 2025: ${total}`)
    return total
  } catch (error) {
    console.error('Error calculating CEC total invitations 2025:', error)
    return 0
  }
}

/**
 * Get weighted average CRS for CEC in 2025
 * Formula: SUM(score * invitation) / SUM(invitation)
 */
export async function getCECWeightedAverageCRS2025(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('score, invitation')
      .eq('program', 'EE-CEC')
      .gte('draw_date_most_recent', '2025-01-01')
      .lte('draw_date_most_recent', '2025-12-31')

    if (error) {
      console.error('Error fetching CEC weighted average CRS 2025:', error)
      return 0
    }

    if (!data || data.length === 0) return 0

    const totalWeightedScore = data.reduce((sum, row) => sum + ((row.score || 0) * (row.invitation || 0)), 0)
    const totalInvitations = data.reduce((sum, row) => sum + (row.invitation || 0), 0)

    if (totalInvitations === 0) return 0

    const weightedAverage = Math.round(totalWeightedScore / totalInvitations)
    console.log(`Weighted average CRS for CEC 2025: ${weightedAverage}`)
    return weightedAverage
  } catch (error) {
    console.error('Error calculating CEC weighted average CRS 2025:', error)
    return 0
  }
}

/**
 * Get total invitations for ALL Express Entry programs in 2025
 * Includes: EE-CEC, EE-FSW, EE-FST, EE-PNP
 */
export async function getAllEETotalInvitations2025(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('invitation')
      .in('program', ['EE-CEC', 'EE-FSW', 'EE-FST', 'EE-PNP'])
      .gte('draw_date_most_recent', '2025-01-01')
      .lte('draw_date_most_recent', '2025-12-31')

    if (error) {
      console.error('Error fetching all EE total invitations 2025:', error)
      return 0
    }

    const total = data?.reduce((sum, row) => sum + (row.invitation || 0), 0) || 0
    console.log(`Total all EE invitations 2025: ${total}`)
    return total
  } catch (error) {
    console.error('Error calculating all EE total invitations 2025:', error)
    return 0
  }
}

/**
 * Calculate real capacity used with 1.6x coefficient
 * Formula: Total Invitations × 1.6
 */
export async function getRealCapacityUsed2025(): Promise<number> {
  const totalInvitations = await getAllEETotalInvitations2025()
  const realCapacityUsed = Math.round(totalInvitations * 1.6)
  console.log(`Real capacity used 2025 (with 1.6x): ${realCapacityUsed}`)
  return realCapacityUsed
}

/**
 * Calculate capacity remaining from 89,000 total allocation
 * Formula: 89,000 - Real Capacity Used
 */
export async function getCapacityRemaining2025(): Promise<number> {
  const realCapacityUsed = await getRealCapacityUsed2025()
  const capacityRemaining = 89000 - realCapacityUsed
  console.log(`Capacity remaining 2025: ${capacityRemaining}`)
  return capacityRemaining
}

/**
 * Get all CEC draws in 2025 for charting
 * Returns data sorted by date for trend analysis
 */
export async function getCECDrawsForChart2025(): Promise<Array<{
  date: string
  crsScore: number
  invitations: number
  drawName: string
}>> {
  try {
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('draw_date_most_recent, score, invitation, name')
      .eq('program', 'EE-CEC')
      .gte('draw_date_most_recent', '2025-01-01')
      .lte('draw_date_most_recent', '2025-12-31')
      .order('draw_date_most_recent', { ascending: true })

    if (error) {
      console.error('Error fetching CEC draws for chart 2025:', error)
      return []
    }

    if (!data || data.length === 0) return []

    const chartData = data.map(row => ({
      date: formatDrawDate(row.draw_date_most_recent),
      crsScore: row.score || 0,
      invitations: row.invitation || 0,
      drawName: row.name || ''
    }))

    console.log(`Fetched ${chartData.length} CEC draws for chart 2025`)
    return chartData
  } catch (error) {
    console.error('Error processing CEC draws for chart 2025:', error)
    return []
  }
}

/**
 * Get CRS trend comparison between latest and previous CEC draw
 * Shows score difference and trend direction
 */
export async function getCECCRSTrend(): Promise<{
  currentScore: number
  previousScore: number | null
  difference: number | null
  trend: 'up' | 'down' | 'same' | 'first'
  trendText: string
} | null> {
  try {
    // Get latest 2 CEC draws
    const { data, error } = await supabase
      .from('ImmiWatch')
      .select('score, draw_date_most_recent')
      .eq('program', 'EE-CEC')
      .order('draw_date_most_recent', { ascending: false })
      .limit(2)

    if (error) {
      console.error('Error fetching CEC CRS trend:', error)
      return null
    }

    if (!data || data.length === 0) return null

    const currentScore = data[0]?.score || 0
    const previousScore = data.length > 1 ? data[1]?.score : null

    if (!previousScore) {
      return {
        currentScore,
        previousScore: null,
        difference: null,
        trend: 'first',
        trendText: 'First draw of 2025'
      }
    }

    const difference = currentScore - previousScore
    let trend: 'up' | 'down' | 'same'
    let trendText: string
    let trendIcon: string
    let trendColor: string

    if (difference > 0) {
      trend = 'up'
      trendIcon = '↑'
      trendText = `${difference}`
      trendColor = 'text-green-600'
    } else if (difference < 0) {
      trend = 'down'
      trendIcon = '↓'
      trendText = `${Math.abs(difference)}`
      trendColor = 'text-red-600'
    } else {
      trend = 'same'
      trendIcon = '→'
      trendText = '0'
      trendColor = 'text-gray-500'
    }

    console.log(`CEC CRS trend: ${currentScore} (${trendIcon} ${trendText})`)
    return {
      currentScore,
      previousScore,
      difference,
      trend,
      trendText,
      trendIcon,
      trendColor
    }
  } catch (error) {
    console.error('Error calculating CEC CRS trend:', error)
    return null
  }
}

/**
 * Transform raw ImmiWatch data to user-friendly format
 */
export function transformImmiWatchData(draw: ImmiWatchDraw): DisplayImmiWatchDraw {
  return {
    id: draw.whalesync_postgres_id,
    programName: getProgramDisplayName(draw.program),
    drawDate: formatDrawDate(draw.draw_date_most_recent),
    crsScore: draw.score,
    invitationsIssued: draw.invitation,
    scoringSystem: draw.scoring_system,
    region: draw.region,
    programCategory: draw.filter_by_program
  }
}

/**
 * Get user-friendly program names
 */
export function getProgramDisplayName(programCode: string): string {
  const programNames: Record<string, string> = {
    'EE-CEC': 'Canadian Experience Class',
    'EE-FSW': 'Federal Skilled Worker',
    'EE-PNP': 'Provincial Nominee Program',
    'EE-FST': 'Federal Skilled Trades',
    'EE-HEALTH': 'Healthcare Workers',
    'EE-TRADE': 'Skilled Trades',
    'EE-EDUCATION': 'Education Workers',
    'EE-FRENCH': 'French-Speaking Workers',
    'EE-AGRICULTURE': 'Agriculture Workers'
  }
  
  return programNames[programCode] || programCode
}

/**
 * Format draw date for display
 */
export function formatDrawDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
