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
  draw_type: string // 'draw.oinp.fws', etc.
  draw_date: string
  category: string // 'All', etc.
  program: string // 'PNP', 'CEC', 'FSW', etc.
  invitations_issued: number
  additional_field?: string | null
  region: string // 'Northern Ontario', etc.
  province_program: string // 'OINP', etc.
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
