import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fneodphdhnnogfuxcpxn.supabase.co'
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  throw new Error('Missing PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for immigration draw data - matches actual Supabase table
export interface ImmigrationDraw {
  id: string
  name: string // 'draw.oinp.fws', etc.
  draw_date_most_recent: string // '2025-06-06'
  category: string // 'All', etc.
  scoring_system: string // 'PNP', 'CEC', 'FSW', etc.
  score: number // cutoff score or invitation count
  number_of_draws_in_12_months?: number | null
  region: string // 'Northern Ontario', etc.
  filter_by_program: string // 'OINP', etc.
}

// User-friendly display interface
export interface DisplayDraw {
  id: string
  programName: string // 'Ontario Foreign Worker Stream'
  drawDate: string // 'June 6, 2025'
  category: string // 'All'
  scoringSystem: string // 'PNP'
  cutoffScore?: number // if available
  invitationsIssued?: number // if available
  region: string // 'Northern Ontario'
  province: string // 'OINP'
}

// Types for NOC codes
export interface NOCCode {
  id: string
  code: string // e.g., '2171'
  title: string // e.g., 'Information systems analysts and consultants'
  description?: string
  skill_level: 'A' | 'B' | 'C' | 'D' | '0'
  created_at: string
}
