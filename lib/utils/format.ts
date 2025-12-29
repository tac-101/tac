import { format, formatDistanceToNow, parseISO } from 'date-fns'

// Date formatting utilities
export const formatDate = (date: string | Date, pattern = 'MMM dd, yyyy') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, pattern)
}

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm')
}

export const formatRelativeTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

// Number formatting utilities
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
  return new Intl.NumberFormat('en-US', options).format(num)
}

export const formatWeight = (weight: number, unit = 'kg') => {
  return `${formatNumber(weight, { maximumFractionDigits: 2 })} ${unit}`
}

export const formatPercentage = (value: number, total: number) => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${formatNumber(percentage, { maximumFractionDigits: 1 })}%`
}

// String formatting utilities
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const formatPhoneNumber = (phone: string) => {
  // Simple phone number formatting for display
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

// Status formatting
export const getStatusColor = (status: string) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_transit: 'bg-blue-100 text-blue-800 border-blue-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  } as const
  
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}
