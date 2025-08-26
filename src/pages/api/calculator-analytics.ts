import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

// Ensure this endpoint is server-side rendered
export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log(`📊 Analytics: Fetching data for last ${days} days`);

    // Get all usage data for the specified period
    const { data: usageData, error } = await supabase
      .from('calculator_usage')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching analytics data:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch analytics data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Analytics: Found ${usageData?.length || 0} records`);

    // Process the data for analytics
    const analytics = {
      totalUsage: usageData?.length || 0,
      
      // Calculator type breakdown
      byCalculator: usageData?.reduce((acc, record) => {
        const type = record.calculator_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},

      // Device type breakdown
      byDevice: usageData?.reduce((acc, record) => {
        const device = record.device_type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},

      // UTM source breakdown
      bySource: usageData?.reduce((acc, record) => {
        const source = record.utm_source || 'direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},

      // Conversion events breakdown
      byEvent: usageData?.reduce((acc, record) => {
        const event = record.conversion_event || 'unknown';
        acc[event] = (acc[event] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},

      // Daily usage (last 7 days for chart)
      dailyUsage: (() => {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayUsage = usageData?.filter(record => 
            record.created_at?.startsWith(dateStr)
          ).length || 0;
          
          last7Days.push({
            date: dateStr,
            count: dayUsage,
            label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          });
        }
        return last7Days;
      })(),

      // Average session time
      avgSessionTime: (() => {
        const sessionTimes = usageData?.filter(record => 
          record.time_spent_seconds && record.time_spent_seconds > 0
        ).map(record => record.time_spent_seconds) || [];
        
        if (sessionTimes.length === 0) return 0;
        
        const total = sessionTimes.reduce((sum, time) => sum + time, 0);
        return Math.round(total / sessionTimes.length);
      })(),

      // Top calculation results (CRS and FSW scores)
      topScores: (() => {
        const crsScores = [];
        const fswScores = [];
        let fswEligibleCount = 0;
        let totalFswCalculations = 0;
        
        usageData?.forEach(record => {
          if (!record.calculation_result) return;
          
          // Handle both object and potential string formats
          let result = record.calculation_result;
          if (typeof result === 'string') {
            try {
              result = JSON.parse(result);
            } catch (e) {
              return;
            }
          }
          
          if (!result || typeof result !== 'object') return;
          
          // Separate CRS and FSW scores by calculator type
          if (record.calculator_type === 'crs' && 'crsScore' in result && result.crsScore > 0) {
            crsScores.push(result.crsScore);
          } else if (record.calculator_type === 'fsw' && 'fswScore' in result && result.fswScore > 0) {
            fswScores.push(result.fswScore);
            totalFswCalculations++;
            if (result.fswScore >= 67) { // FSW pass mark is typically 67
              fswEligibleCount++;
            }
          }
        });
        
        console.log(`📊 Analytics: Found ${crsScores.length} CRS scores and ${fswScores.length} FSW scores`);
        
        return {
          crs: crsScores.length > 0 ? {
            avg: Math.round(crsScores.reduce((sum, score) => sum + score, 0) / crsScores.length),
            max: Math.max(...crsScores),
            min: Math.min(...crsScores),
            count: crsScores.length
          } : null,
          fsw: fswScores.length > 0 ? {
            avg: Math.round(fswScores.reduce((sum, score) => sum + score, 0) / fswScores.length),
            max: Math.max(...fswScores),
            min: Math.min(...fswScores),
            count: fswScores.length,
            eligibleRate: totalFswCalculations > 0 ? Math.round((fswEligibleCount / totalFswCalculations) * 100) : 0
          } : null
        };
      })(),

      // Recent activity (last 10 records)
      recentActivity: usageData?.slice(0, 10).map(record => ({
        calculator: record.calculator_type,
        event: record.conversion_event,
        device: record.device_type,
        source: record.utm_source,
        timeAgo: (() => {
          const now = new Date();
          const recordTime = new Date(record.created_at);
          const diffMinutes = Math.floor((now.getTime() - recordTime.getTime()) / (1000 * 60));
          
          if (diffMinutes < 1) return 'Just now';
          if (diffMinutes < 60) return `${diffMinutes}m ago`;
          if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
          return `${Math.floor(diffMinutes / 1440)}d ago`;
        })()
      })) || []
    };

    console.log('📊 Analytics processed successfully:', {
      total: analytics.totalUsage,
      calculators: Object.keys(analytics.byCalculator).length,
      avgTime: analytics.avgSessionTime
    });

    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('❌ Error in calculator-analytics API:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
