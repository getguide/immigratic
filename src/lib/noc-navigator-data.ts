import { supabase } from './supabase';

export interface NOCSearchResult {
  noc_code: number;
  class_title: string;
  element_type_label: string;
  element_description: string;
  teer_category: number;
  skill_level_description: string;
  total_eligibility_count: number;
  ee_priority_score: number;
  provincial_opportunities_count: number;
  best_pathways: string[];
  available_regions: string[];
  // Express Entry eligibility
  ee_health_eligible: boolean;
  ee_cec_eligible: boolean;
  ee_fsw_eligible: boolean;
  ee_agriculture_eligible: boolean;
  ee_stem_eligible: boolean;
  ee_education_eligible: boolean;
  ee_trade_eligible: boolean;
  ee_trade_program_eligible: boolean;
  // Provincial programs
  oinp_health_eligible: boolean;
  oinp_tech_eligible: boolean;
  oinp_in_demand_skills_eligible: boolean;
  oinp_skilled_trades_eligible: boolean;
  oinp_foreign_worker_eligible: boolean;
  oinp_international_student_eligible: boolean;
  bcpnp_construction_eligible: boolean;
  bcpnp_health_eligible: boolean;
  bcpnp_tech_eligible: boolean;
  bcpnp_vet_eligible: boolean;
  bcpnp_childcare_eligible: boolean;
  bcpnp_skilled_worker_eligible: boolean;
  bcpnp_international_students_eligible: boolean;
  // Other programs
  sowp_c41_eligible: boolean;
  cusma_professional_eligible: boolean;
  cec_clb_required: string;
}

export interface NOCSearchFilters {
  searchTerm?: string;
  teerLevel?: number;
  eeProgram?: string;
  provincialProgram?: string;
  minOpportunities?: number;
  minPriority?: number;
  page?: number;
  limit?: number;
}

export interface NOCSearchResponse {
  results: NOCSearchResult[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Search NOC codes with advanced filtering
 */
export async function searchNOCCodes(filters: NOCSearchFilters): Promise<NOCSearchResponse> {
  try {
    let query = supabase
      .from('noc_navigator')
      .select('*');

    // Apply search term filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      query = query.or(
        `class_title.ilike.%${searchTerm}%,element_description.ilike.%${searchTerm}%,noc_code.eq.${searchTerm}`
      );
    }

    // Apply TEER level filter
    if (filters.teerLevel !== undefined) {
      query = query.eq('teer_category', filters.teerLevel);
    }

    // Apply Express Entry program filter
    if (filters.eeProgram) {
      switch (filters.eeProgram) {
        case 'health':
          query = query.eq('ee_health_eligible', true);
          break;
        case 'stem':
          query = query.eq('ee_stem_eligible', true);
          break;
        case 'education':
          query = query.eq('ee_education_eligible', true);
          break;
        case 'agriculture':
          query = query.eq('ee_agriculture_eligible', true);
          break;
        case 'trade':
          query = query.eq('ee_trade_eligible', true);
          break;
        case 'trade_program':
          query = query.eq('ee_trade_program_eligible', true);
          break;
      }
    }

    // Apply provincial program filter
    if (filters.provincialProgram) {
      switch (filters.provincialProgram) {
        case 'ontario':
          query = query.or(
            'oinp_health_eligible.eq.true,oinp_tech_eligible.eq.true,oinp_in_demand_skills_eligible.eq.true,oinp_skilled_trades_eligible.eq.true,oinp_foreign_worker_eligible.eq.true,oinp_international_student_eligible.eq.true'
          );
          break;
        case 'bc':
          query = query.or(
            'bcpnp_construction_eligible.eq.true,bcpnp_health_eligible.eq.true,bcpnp_tech_eligible.eq.true,bcpnp_vet_eligible.eq.true,bcpnp_childcare_eligible.eq.true,bcpnp_skilled_worker_eligible.eq.true,bcpnp_international_students_eligible.eq.true'
          );
          break;
      }
    }

    // Apply minimum opportunities filter
    if (filters.minOpportunities && filters.minOpportunities > 0) {
      query = query.gte('total_eligibility_count', filters.minOpportunities);
    }

    // Apply minimum priority filter
    if (filters.minPriority && filters.minPriority > 0) {
      query = query.gte('ee_priority_score', filters.minPriority);
    }

    // Get total count for pagination
    const countQuery = query.clone();
    const { count } = await countQuery.count();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('ee_priority_score', { ascending: false })
      .order('total_eligibility_count', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error('Failed to fetch NOC codes');
    }

    // Transform the data to include calculated fields
    const transformedResults = (data || []).map(transformNOCData);

    return {
      results: transformedResults,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };

  } catch (error) {
    console.error('NOC search error:', error);
    throw error;
  }
}

/**
 * Get NOC code details by NOC code
 */
export async function getNOCDetails(nocCode: number): Promise<NOCSearchResult | null> {
  try {
    const { data, error } = await supabase
      .from('noc_navigator')
      .select('*')
      .eq('noc_code', nocCode)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      return null;
    }

    return data ? transformNOCData(data) : null;

  } catch (error) {
    console.error('Get NOC details error:', error);
    return null;
  }
}

/**
 * Get NOC codes by TEER level
 */
export async function getNOCByTEER(teerLevel: number, limit: number = 50): Promise<NOCSearchResult[]> {
  try {
    const { data, error } = await supabase
      .from('noc_navigator')
      .select('*')
      .eq('teer_category', teerLevel)
      .order('ee_priority_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase query error:', error);
      return [];
    }

    return (data || []).map(transformNOCData);

  } catch (error) {
    console.error('Get NOC by TEER error:', error);
    return [];
  }
}

/**
 * Get high-priority NOC codes
 */
export async function getHighPriorityNOCs(limit: number = 20): Promise<NOCSearchResult[]> {
  try {
    const { data, error } = await supabase
      .from('noc_navigator')
      .select('*')
      .gte('ee_priority_score', 20)
      .order('ee_priority_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase query error:', error);
      return [];
    }

    return (data || []).map(transformNOCData);

  } catch (error) {
    console.error('Get high priority NOCs error:', error);
    return [];
  }
}

/**
 * Get NOC codes by specific program eligibility
 */
export async function getNOCByProgram(program: string, limit: number = 50): Promise<NOCSearchResult[]> {
  try {
    let query = supabase.from('noc_navigator').select('*');

    // Map program names to database columns
    switch (program.toLowerCase()) {
      case 'ee-health':
        query = query.eq('ee_health_eligible', true);
        break;
      case 'ee-stem':
        query = query.eq('ee_stem_eligible', true);
        break;
      case 'ee-education':
        query = query.eq('ee_education_eligible', true);
        break;
      case 'ee-agriculture':
        query = query.eq('ee_agriculture_eligible', true);
        break;
      case 'ee-trade':
        query = query.eq('ee_trade_eligible', true);
        break;
      case 'ee-trade-program':
        query = query.eq('ee_trade_program_eligible', true);
        break;
      case 'oinp-health':
        query = query.eq('oinp_health_eligible', true);
        break;
      case 'oinp-tech':
        query = query.eq('oinp_tech_eligible', true);
        break;
      case 'bcpnp-health':
        query = query.eq('bcpnp_health_eligible', true);
        break;
      case 'bcpnp-tech':
        query = query.eq('bcpnp_tech_eligible', true);
        break;
      default:
        return [];
    }

    const { data, error } = await query
      .order('ee_priority_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase query error:', error);
      return [];
    }

    return (data || []).map(transformNOCData);

  } catch (error) {
    console.error('Get NOC by program error:', error);
    return [];
  }
}

/**
 * Transform raw database data to search result format
 */
function transformNOCData(data: any): NOCSearchResult {
  // Calculate best pathways based on eligibility
  const bestPathways: string[] = [];
  
  if (data.ee_health_eligible) bestPathways.push('EE-Healthcare (Priority)');
  if (data.ee_stem_eligible) bestPathways.push('EE-STEM (High Priority)');
  if (data.ee_education_eligible) bestPathways.push('EE-Education (Medium Priority)');
  if (data.ee_agriculture_eligible) bestPathways.push('EE-Agriculture (Medium Priority)');
  if (data.ee_trade_eligible) bestPathways.push('EE-Trade (High Priority)');
  if (data.ee_trade_program_eligible) bestPathways.push('EE-Trade Program (High Priority)');
  
  if (data.oinp_health_eligible) bestPathways.push('OINP-Health (Ontario)');
  if (data.oinp_tech_eligible) bestPathways.push('OINP-Tech (Ontario)');
  if (data.oinp_in_demand_skills_eligible) bestPathways.push('OINP-In-Demand Skills (Ontario)');
  if (data.oinp_skilled_trades_eligible) bestPathways.push('OINP-Skilled Trades (Ontario)');
  
  if (data.bcpnp_health_eligible) bestPathways.push('BCPNP-Health (BC)');
  if (data.bcpnp_tech_eligible) bestPathways.push('BCPNP-Tech (BC)');
  if (data.bcpnp_construction_eligible) bestPathways.push('BCPNP-Construction (BC)');
  if (data.bcpnp_vet_eligible) bestPathways.push('BCPNP-Veterinary (BC)');
  if (data.bcpnp_childcare_eligible) bestPathways.push('BCPNP-Childcare (BC)');

  // Calculate available regions
  const availableRegions: string[] = [];
  if (data.ee_cec_eligible || data.ee_fsw_eligible) availableRegions.push('Federal');
  if (data.oinp_health_eligible || data.oinp_tech_eligible || data.oinp_in_demand_skills_eligible || 
      data.oinp_skilled_trades_eligible || data.oinp_foreign_worker_eligible || data.oinp_international_student_eligible) {
    availableRegions.push('Ontario');
  }
  if (data.bcpnp_health_eligible || data.bcpnp_tech_eligible || data.bcpnp_construction_eligible || 
      data.bcpnp_vet_eligible || data.bcpnp_childcare_eligible || data.bcpnp_skilled_worker_eligible || 
      data.bcpnp_international_students_eligible) {
    availableRegions.push('British Columbia');
  }

  // Get skill level description
  const skillLevelDescription = getSkillLevelDescription(data.teer_category);

  return {
    noc_code: data.noc_code,
    class_title: data.class_title,
    element_type_label: data.element_type_label,
    element_description: data.element_description,
    teer_category: data.teer_category,
    skill_level_description: skillLevelDescription,
    total_eligibility_count: data.total_eligibility_count || 0,
    ee_priority_score: data.ee_priority_score || 0,
    provincial_opportunities_count: data.provincial_opportunities_count || 0,
    best_pathways: bestPathways,
    available_regions: availableRegions,
    // Express Entry eligibility
    ee_health_eligible: data.ee_health_eligible || false,
    ee_cec_eligible: data.ee_cec_eligible || false,
    ee_fsw_eligible: data.ee_fsw_eligible || false,
    ee_agriculture_eligible: data.ee_agriculture_eligible || false,
    ee_stem_eligible: data.ee_stem_eligible || false,
    ee_education_eligible: data.ee_education_eligible || false,
    ee_trade_eligible: data.ee_trade_eligible || false,
    ee_trade_program_eligible: data.ee_trade_program_eligible || false,
    // Provincial programs
    oinp_health_eligible: data.oinp_health_eligible || false,
    oinp_tech_eligible: data.oinp_tech_eligible || false,
    oinp_in_demand_skills_eligible: data.oinp_in_demand_skills_eligible || false,
    oinp_skilled_trades_eligible: data.oinp_skilled_trades_eligible || false,
    oinp_foreign_worker_eligible: data.oinp_foreign_worker_eligible || false,
    oinp_international_student_eligible: data.oinp_international_student_eligible || false,
    bcpnp_construction_eligible: data.bcpnp_construction_eligible || false,
    bcpnp_health_eligible: data.bcpnp_health_eligible || false,
    bcpnp_tech_eligible: data.bcpnp_tech_eligible || false,
    bcpnp_vet_eligible: data.bcpnp_vet_eligible || false,
    bcpnp_childcare_eligible: data.bcpnp_childcare_eligible || false,
    bcpnp_skilled_worker_eligible: data.bcpnp_skilled_worker_eligible || false,
    bcpnp_international_students_eligible: data.bcpnp_international_students_eligible || false,
    // Other programs
    sowp_c41_eligible: data.sowp_c41_eligible || false,
    cusma_professional_eligible: data.cusma_professional_eligible || false,
    cec_clb_required: data.cec_clb_required || 'N/A'
  };
}

/**
 * Get skill level description from TEER category
 */
function getSkillLevelDescription(teerCategory: number): string {
  switch (teerCategory) {
    case 0: return 'Management Level';
    case 1: return 'Professional Level';
    case 2: return 'Technical Level';
    case 3: return 'Skilled Level';
    case 4: return 'Semi-Skilled Level';
    case 5: return 'Unskilled Level';
    default: return 'Unknown Level';
  }
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(searchTerm: string, limit: number = 10): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('noc_navigator')
      .select('class_title, noc_code')
      .or(`class_title.ilike.%${searchTerm}%,noc_code.eq.${searchTerm}`)
      .limit(limit);

    if (error) {
      console.error('Supabase query error:', error);
      return [];
    }

    return (data || []).map(item => 
      `${item.noc_code} - ${item.class_title}`
    );

  } catch (error) {
    console.error('Get search suggestions error:', error);
    return [];
  }
}
