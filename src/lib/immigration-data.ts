import { supabase, type ImmigrationDraw, type DisplayDraw } from './supabase'

/**
 * Get the latest immigration draw for a specific program
 */
export async function getLatestDraw(program: string): Promise<DisplayDraw | null> {
  try {
    const { data, error } = await supabase
      .from('Recent-Draws')
      .select('*')
      .eq('scoring_system', program)
      .order('draw_date_most_recent', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching latest draw:', error)
      return null
    }

    return data ? transformDrawData(data) : null
  } catch (error) {
    console.error('Error fetching latest draw:', error)
    return null
  }
}

/**
 * Get all immigration draws for a specific program
 */
export async function getDrawHistory(program: string, limit: number = 10): Promise<DisplayDraw[]> {
  try {
    const { data, error } = await supabase
      .from('Recent-Draws')
      .select('*')
      .eq('scoring_system', program)
      .order('draw_date_most_recent', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching draw history:', error)
      return []
    }

    return data ? data.map(transformDrawData) : []
  } catch (error) {
    console.error('Error fetching draw history:', error)
    return []
  }
}

/**
 * Get latest draws for all programs
 */
export async function getLatestDrawsForAllPrograms(): Promise<DisplayDraw[]> {
  try {
    // Get the latest draw for each program
    const programs = ['CEC', 'FSW', 'PNP', 'FST']
    const latestDraws: DisplayDraw[] = []

    for (const program of programs) {
      const draw = await getLatestDraw(program)
      if (draw) {
        latestDraws.push(draw)
      }
    }

    return latestDraws.sort((a, b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime())
  } catch (error) {
    console.error('Error fetching latest draws for all programs:', error)
    return []
  }
}

/**
 * Get the latest CEC draw specifically
 */
export async function getLatestCECDraw(): Promise<DisplayDraw | null> {
  try {
    console.log('getLatestCECDraw: Starting to fetch CEC data...');
    
    const { data, error } = await supabase
      .from('Recent-Draws')
      .select('*')
      .eq('name', 'draw.ee.cec')
      .order('draw_date_most_recent', { ascending: false })
      .limit(1)
      .single()

    console.log('getLatestCECDraw: Supabase response:', { data, error });

    if (error) {
      console.error('Error fetching latest CEC draw:', error)
      return null
    }

    if (!data) {
      console.log('getLatestCECDraw: No CEC data found in database');
      return null;
    }

    console.log('getLatestCECDraw: Found CEC data:', data);
    const transformed = transformDrawData(data);
    console.log('getLatestCECDraw: Transformed data:', transformed);
    return transformed;
  } catch (error) {
    console.error('Error fetching latest CEC draw:', error)
    return null
  }
}

/**
 * Transform raw immigration draw data to user-friendly format
 */
export function transformDrawData(draw: ImmigrationDraw): DisplayDraw {
  return {
    id: draw.id,
    programName: getProgramDisplayName(draw.name),
    drawDate: formatDrawDate(draw.draw_date_most_recent),
    category: draw.category,
    scoringSystem: draw.scoring_system,
    cutoffScore: draw.score, // This is the CRS cutoff score
    invitationsIssued: null, // We don't have this data yet
    region: draw.region,
    province: draw.filter_by_program
  }
}

/**
 * Get user-friendly program names
 */
export function getProgramDisplayName(technicalName: string): string {
  const programNames: Record<string, string> = {
    'draw.oinp.fws': 'Ontario Foreign Worker Stream',
    'draw.oinp.masters': 'Ontario Masters Graduate Stream',
    'draw.oinp.phd': 'Ontario PhD Graduate Stream',
    'draw.oinp.international-students': 'Ontario International Student Stream',
    'draw.oinp.in-demand-skills': 'Ontario In-Demand Skills Stream',
    'draw.oinp.french': 'Ontario French-Speaking Skilled Worker Stream',
    'draw.oinp.human-capital': 'Ontario Human Capital Priorities Stream',
    'draw.oinp.trade': 'Ontario Skilled Trades Stream',
    'draw.ee.cec': 'Canadian Experience Class',
    'draw.ee.fsw': 'Federal Skilled Worker',
    'draw.ee.fst': 'Federal Skilled Trades',
    'draw.ee.pnp': 'Provincial Nominee Program'
  }
  
  return programNames[technicalName] || technicalName
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

/**
 * Format cutoff score for display
 */
export function formatCutoffScore(score: number): string {
  return score.toLocaleString()
}

/**
 * Format invitations count for display
 */
export function formatInvitations(count: number): string {
  return count.toLocaleString()
}
