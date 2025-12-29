import { z } from 'zod'

// Shipment validation schemas
export const shipmentSchema = z.object({
  shipment_ref: z.string().min(1, 'Shipment reference is required'),
  customer_name: z.string().min(1, 'Customer name is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  status: z.enum(['pending', 'in_transit', 'delivered', 'cancelled']),
  weight: z.number().positive('Weight must be positive'),
  description: z.string().optional(),
  special_instructions: z.string().optional(),
})

export const createShipmentSchema = shipmentSchema.omit({
  status: true,
}).extend({
  status: z.enum(['pending']).default('pending'),
})

export const updateShipmentSchema = shipmentSchema.partial()

export const shipmentFiltersSchema = z.object({
  status: z.string().optional(),
  customer: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
})

// Customer validation schemas
export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
})

export const createCustomerSchema = customerSchema
export const updateCustomerSchema = customerSchema.partial()

// Vehicle validation schemas
export const vehicleSchema = z.object({
  vehicle_number: z.string().min(1, 'Vehicle number is required'),
  type: z.enum(['truck', 'van', 'motorcycle', 'bicycle']),
  capacity: z.number().positive('Capacity must be positive'),
  status: z.enum(['active', 'inactive', 'maintenance']),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
})

export const createVehicleSchema = vehicleSchema.omit({
  status: true,
}).extend({
  status: z.enum(['active']).default('active'),
})

export const updateVehicleSchema = vehicleSchema.partial()

// Analytics validation schemas
export const analyticsFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('day'),
})

// Export types
export type Shipment = z.infer<typeof shipmentSchema>
export type CreateShipment = z.infer<typeof createShipmentSchema>
export type UpdateShipment = z.infer<typeof updateShipmentSchema>
export type ShipmentFilters = z.infer<typeof shipmentFiltersSchema>

export type Customer = z.infer<typeof customerSchema>
export type CreateCustomer = z.infer<typeof createCustomerSchema>
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>

export type Vehicle = z.infer<typeof vehicleSchema>
export type CreateVehicle = z.infer<typeof createVehicleSchema>
export type UpdateVehicle = z.infer<typeof updateVehicleSchema>

export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>
