import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query/client'
import { createClient } from '@/lib/supabase/client'

// Types
interface Shipment {
  id: string
  shipment_ref: string
  customer_name: string
  origin: string
  destination: string
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
  weight: number
  created_at: string
  updated_at: string
}

interface ShipmentFilters {
  status?: string
  customer?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  limit?: number
  offset?: number
}

// API functions
const shipmentsApi = {
  getAll: async (filters: ShipmentFilters = {}): Promise<Shipment[]> => {
    const supabase = createClient()
    let query = supabase.from('shipments').select('*')
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.customer) {
      query = query.ilike('customer_name', `%${filters.customer}%`)
    }
    
    if (filters.search) {
      query = query.or(`shipment_ref.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`)
    }
    
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }
    
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },
  
  getById: async (id: string): Promise<Shipment> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },
  
  create: async (shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>): Promise<Shipment> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipment)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  update: async (id: string, updates: Partial<Shipment>): Promise<Shipment> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('shipments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    const supabase = createClient()
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },
}

// Hooks
export function useShipments(filters: ShipmentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.shipments.list(filters),
    queryFn: () => shipmentsApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(id),
    queryFn: () => shipmentsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateShipment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: shipmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all })
    },
  })
}

export function useUpdateShipment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Shipment> }) =>
      shipmentsApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all })
      queryClient.setQueryData(queryKeys.shipments.detail(data.id), data)
    },
  })
}

export function useDeleteShipment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: shipmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all })
    },
  })
}
