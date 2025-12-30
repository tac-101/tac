import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query/client'
import { supabase } from '@/lib/supabaseClient'

// Types
interface DashboardStats {
  totalShipments: number
  pendingShipments: number
  inTransitShipments: number
  deliveredShipments: number
  totalRevenue: number
  activeVehicles: number
  totalCustomers: number
  avgDeliveryTime: number
}

interface ChartData {
  name: string
  value: number
  date?: string
}

interface AnalyticsFilters {
  dateFrom?: string
  dateTo?: string
  period?: 'day' | 'week' | 'month' | 'year'
}

// API functions
const analyticsApi = {
  getDashboardStats: async (filters: AnalyticsFilters = {}): Promise<DashboardStats> => {
    // Using imported supabase client
    
    // Get date range
    const dateFrom = filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const dateTo = filters.dateTo || new Date().toISOString()
    
    // Parallel queries for better performance
    const [
      shipmentsResult,
      pendingResult,
      inTransitResult,
      deliveredResult,
      vehiclesResult,
      customersResult
    ] = await Promise.all([
      // Total shipments
      supabase
        .from('shipments')
        .select('id', { count: 'exact' })
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo),
      
      // Pending shipments
      supabase
        .from('shipments')
        .select('id', { count: 'exact' })
        .eq('status', 'pending')
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo),
      
      // In transit shipments
      supabase
        .from('shipments')
        .select('id', { count: 'exact' })
        .eq('status', 'in_transit')
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo),
      
      // Delivered shipments
      supabase
        .from('shipments')
        .select('id', { count: 'exact' })
        .eq('status', 'delivered')
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo),
      
      // Active vehicles
      supabase
        .from('vehicles')
        .select('id', { count: 'exact' })
        .eq('status', 'active'),
      
      // Total customers
      supabase
        .from('customers')
        .select('id', { count: 'exact' })
    ])
    
    return {
      totalShipments: shipmentsResult.count || 0,
      pendingShipments: pendingResult.count || 0,
      inTransitShipments: inTransitResult.count || 0,
      deliveredShipments: deliveredResult.count || 0,
      totalRevenue: 0, // TODO: Calculate from shipments
      activeVehicles: vehiclesResult.count || 0,
      totalCustomers: customersResult.count || 0,
      avgDeliveryTime: 0, // TODO: Calculate average delivery time
    }
  },
  
  getShipmentTrends: async (filters: AnalyticsFilters = {}): Promise<ChartData[]> => {
    // Using imported supabase client
    const period = filters.period || 'day'
    const dateFrom = filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const dateTo = filters.dateTo || new Date().toISOString()
    
    // Generate date format based on period
    const dateFormat = {
      day: 'YYYY-MM-DD',
      week: 'YYYY-"W"WW',
      month: 'YYYY-MM',
      year: 'YYYY'
    }[period]
    
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        created_at,
        status
      `)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .order('created_at')
    
    if (error) throw error
    
    // Group data by date
    const grouped = (data || []).reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date]++
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(grouped).map(([date, value]) => ({
      name: date,
      value,
      date
    }))
  },
  
  getStatusDistribution: async (filters: AnalyticsFilters = {}): Promise<ChartData[]> => {
    // Using imported supabase client
    const dateFrom = filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const dateTo = filters.dateTo || new Date().toISOString()
    
    const { data, error } = await supabase
      .from('shipments')
      .select('status')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
    
    if (error) throw error
    
    // Count by status
    const statusCounts = (data || []).reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }))
  },
}

// Hooks
export function useDashboardStats(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(),
    queryFn: () => analyticsApi.getDashboardStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useShipmentTrends(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.analytics.report('shipment-trends', filters),
    queryFn: () => analyticsApi.getShipmentTrends(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useStatusDistribution(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.analytics.report('status-distribution', filters),
    queryFn: () => analyticsApi.getStatusDistribution(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
