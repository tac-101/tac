import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
})

// Query keys factory for consistent key management
export const queryKeys = {
  // Shipments
  shipments: {
    all: ['shipments'] as const,
    lists: () => [...queryKeys.shipments.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.shipments.lists(), filters] as const,
    details: () => [...queryKeys.shipments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.shipments.details(), id] as const,
    tracking: (id: string) => [...queryKeys.shipments.detail(id), 'tracking'] as const,
  },
  
  // Customers
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
  },
  
  // Vehicles
  vehicles: {
    all: ['vehicles'] as const,
    lists: () => [...queryKeys.vehicles.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.vehicles.lists(), filters] as const,
    details: () => [...queryKeys.vehicles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.vehicles.details(), id] as const,
    location: (id: string) => [...queryKeys.vehicles.detail(id), 'location'] as const,
  },
  
  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    reports: () => [...queryKeys.analytics.all, 'reports'] as const,
    report: (type: string, params: Record<string, any>) => 
      [...queryKeys.analytics.reports(), type, params] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    profile: (id: string) => [...queryKeys.users.all, 'profile', id] as const,
  },
} as const

// Utility function to invalidate related queries
export const invalidateQueries = {
  shipments: () => queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all }),
  customers: () => queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  vehicles: () => queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all }),
  analytics: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  all: () => queryClient.invalidateQueries(),
}
