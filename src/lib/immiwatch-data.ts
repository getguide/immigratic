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
    'EE-FST': 'Federal Skilled Trades'
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
