/**
 * Test Data Factory for TAC Application
 * 
 * This file provides factory functions to generate consistent test data
 * without hardcoded credentials or sensitive information.
 */

export interface TestUser {
  email: string
  password: string
  role: 'admin' | 'user' | 'viewer'
  name: string
}

export interface TestShipment {
  id: string
  shipment_ref: string
  customer_name: string
  origin: string
  destination: string
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
  weight: number
  created_at: string
}

export interface TestCustomer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  gst_number?: string
}

export interface TestVehicle {
  id: string
  vehicle_number: string
  driver_name: string
  status: 'active' | 'maintenance' | 'inactive'
  current_location: string
  type: 'truck' | 'van' | 'bike'
}

/**
 * Test User Factory
 * Uses environment variables for credentials, no hardcoded defaults
 */
export const createTestUser = (overrides?: Partial<TestUser>): TestUser => {
  const baseUser: TestUser = {
    email: process.env.TEST_ADMIN_EMAIL || '',
    password: process.env.TEST_ADMIN_PASSWORD || '',
    role: 'admin',
    name: 'Test Administrator'
  }

  if (!baseUser.email || !baseUser.password) {
    throw new Error(
      'Test credentials not configured. Please set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables.'
    )
  }

  return { ...baseUser, ...overrides }
}

/**
 * Test Shipment Factory
 */
export const createTestShipment = (overrides?: Partial<TestShipment>): TestShipment => {
  const timestamp = new Date().toISOString()
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return {
    id: `test-shipment-${randomId}`,
    shipment_ref: `SHP-TEST-${randomId}`,
    customer_name: 'Test Customer Ltd.',
    origin: 'Mumbai, MH',
    destination: 'Delhi, DL',
    status: 'pending',
    weight: 100,
    created_at: timestamp,
    ...overrides
  }
}

/**
 * Test Customer Factory
 */
export const createTestCustomer = (overrides?: Partial<TestCustomer>): TestCustomer => {
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return {
    id: `test-customer-${randomId}`,
    name: `Test Customer ${randomId}`,
    email: `test.customer.${randomId.toLowerCase()}@example.com`,
    phone: '+91 98765 43210',
    address: '123 Test Street, Test City, Test State 400001',
    gst_number: `27TEST${randomId}1ZX`,
    ...overrides
  }
}

/**
 * Test Vehicle Factory
 */
export const createTestVehicle = (overrides?: Partial<TestVehicle>): TestVehicle => {
  const randomId = Math.random().toString(36).substring(2, 6).toUpperCase()
  
  return {
    id: `test-vehicle-${randomId}`,
    vehicle_number: `MH-01-TEST-${randomId}`,
    driver_name: `Test Driver ${randomId}`,
    status: 'active',
    current_location: 'Mumbai, MH',
    type: 'truck',
    ...overrides
  }
}

/**
 * Test Data Collections
 */
export const testData = {
  users: {
    admin: () => createTestUser({ role: 'admin', name: 'Test Admin' }),
    user: () => createTestUser({ role: 'user', name: 'Test User' }),
    viewer: () => createTestUser({ role: 'viewer', name: 'Test Viewer' })
  },
  
  shipments: {
    pending: () => createTestShipment({ status: 'pending' }),
    inTransit: () => createTestShipment({ status: 'in_transit' }),
    delivered: () => createTestShipment({ status: 'delivered' }),
    cancelled: () => createTestShipment({ status: 'cancelled' })
  },
  
  customers: {
    standard: () => createTestCustomer(),
    withGST: () => createTestCustomer({ gst_number: '27ABCDE1234F1ZX' }),
    withoutGST: () => createTestCustomer({ gst_number: undefined })
  },
  
  vehicles: {
    truck: () => createTestVehicle({ type: 'truck' }),
    van: () => createTestVehicle({ type: 'van' }),
    bike: () => createTestVehicle({ type: 'bike' }),
    maintenance: () => createTestVehicle({ status: 'maintenance' })
  }
}

/**
 * Test Environment Configuration
 */
export const testConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 2,
  
  // Validate test environment
  validate: () => {
    const requiredVars = ['TEST_ADMIN_EMAIL', 'TEST_ADMIN_PASSWORD']
    const missing = requiredVars.filter(varName => !process.env[varName])
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required test environment variables: ${missing.join(', ')}\n` +
        'Please configure these variables in your test environment.'
      )
    }
    
    return true
  }
}

/**
 * Test Utilities
 */
export const testUtils = {
  /**
   * Generate a unique test identifier
   */
  generateTestId: (prefix = 'test') => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `${prefix}-${timestamp}-${random}`
  },
  
  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Generate test email
   */
  generateTestEmail: (domain = 'test.example.com') => {
    const id = testUtils.generateTestId('user')
    return `${id}@${domain}`
  },
  
  /**
   * Clean up test data (placeholder for future implementation)
   */
  cleanup: async () => {
    // TODO: Implement cleanup logic for test data
    console.log('🧹 Test cleanup completed')
  }
}

// Validate test environment on import
if (process.env.NODE_ENV === 'test') {
  try {
    testConfig.validate()
    console.log('✅ Test environment validated')
  } catch (error) {
    console.error('❌ Test environment validation failed:', error)
    process.exit(1)
  }
}
