import { supabase, type ImmigrationDraw } from './supabase'

/**
 * Get the latest immigration draw for a specific program
 */
export async function getLatestDraw(program: string): Promise<ImmigrationDraw | null> {
  try {
    const { data, error } = await supabase
      .from('Recent-Draws')
      .select('*')
      .eq('program', program)
      .order('draw_date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching latest draw:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching latest draw:', error)
    return null
  }
}

/**
 * Get all immigration draws for a specific program
 */
export async function getDrawHistory(program: string, limit: number = 10): Promise<ImmigrationDraw[]> {
  try {
    const { data, error } = await supabase
      .from('Recent-Draws')
      .select('*')
      .eq('program', program)
      .order('draw_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching draw history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching draw history:', error)
    return []
  }
}

/**
 * Get latest draws for all programs
 */
export async function getLatestDrawsForAllPrograms(): Promise<ImmigrationDraw[]> {
  try {
    // Get the latest draw for each program
    const programs = ['CEC', 'FSW', 'PNP', 'FST']
    const latestDraws: ImmigrationDraw[] = []

    for (const program of programs) {
      const draw = await getLatestDraw(program)
      if (draw) {
        latestDraws.push(draw)
      }
    }

    return latestDraws.sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime())
  } catch (error) {
    console.error('Error fetching latest draws for all programs:', error)
    return []
  }
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
