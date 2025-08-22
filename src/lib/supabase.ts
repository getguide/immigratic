import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fneodphdhnnogfuxcpxn.supabase.co'
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  throw new Error('Missing PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for immigration draw data
export interface ImmigrationDraw {
  id: string
  program: string // 'CEC', 'FSW', 'PNP', etc.
  draw_date: string
  cutoff_score: number
  invitations_issued: number
  tie_breaking_rule?: string
  created_at: string
  updated_at: string
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
