/**
 * Icon mapping from Hugeicons to Tabler Icons
 * This helps maintain visual consistency during the migration
 */

// Hugeicons to Tabler Icons mapping
export const iconMapping = {
  // Navigation and UI
  'ArrowRight01Icon': 'IconArrowRight',
  'ArrowLeft01Icon': 'IconArrowLeft', 
  'ArrowDown01Icon': 'IconArrowDown',
  'ArrowUp01Icon': 'IconArrowUp',
  'MoreHorizontalCircle01Icon': 'IconDots',
  'MoreVerticalCircle01Icon': 'IconDotsVertical',
  'Cancel01Icon': 'IconX',
  'Tick02Icon': 'IconCheck',
  
  // Files and Folders
  'FileIcon': 'IconFile',
  'File01Icon': 'IconFile',
  'FolderIcon': 'IconFolder',
  'FolderOpenIcon': 'IconFolderOpen',
  'CodeIcon': 'IconCode',
  
  // Actions
  'PlusSignIcon': 'IconPlus',
  'SearchIcon': 'IconSearch',
  'FloppyDiskIcon': 'IconDeviceFloppy',
  'DownloadIcon': 'IconDownload',
  'EyeIcon': 'IconEye',
  'LogoutIcon': 'IconLogout',
  
  // Interface
  'LayoutIcon': 'IconLayout',
  'PaintBoardIcon': 'IconPalette',
  'UnfoldMoreIcon': 'IconChevronUpDown',
  
  // Theme
  'SunIcon': 'IconSun',
  'MoonIcon': 'IconMoon',
  'ComputerIcon': 'IconDeviceDesktop',
  
  // User and Account
  'UserIcon': 'IconUser',
  'CreditCardIcon': 'IconCreditCard',
  'SettingsIcon': 'IconSettings',
  'KeyboardIcon': 'IconKeyboard',
  'LanguageCircleIcon': 'IconLanguage',
  'NotificationIcon': 'IconBell',
  'MailIcon': 'IconMail',
  'ShieldIcon': 'IconShield',
  'HelpCircleIcon': 'IconHelp',
  
  // Connectivity
  'BluetoothIcon': 'IconBluetooth',
} as const

// Helper function to get Tabler icon name from Hugeicons name
export function getTablerIcon(hugeiconName: string): string {
  return iconMapping[hugeiconName as keyof typeof iconMapping] || hugeiconName
}

// Common icon imports for easy replacement
export const commonTablerIcons = {
  // Navigation
  IconArrowRight: 'IconArrowRight',
  IconArrowLeft: 'IconArrowLeft',
  IconArrowDown: 'IconArrowDown',
  IconArrowUp: 'IconArrowUp',
  IconChevronRight: 'IconChevronRight',
  IconChevronLeft: 'IconChevronLeft',
  IconChevronDown: 'IconChevronDown',
  IconChevronUp: 'IconChevronUp',
  
  // Actions
  IconX: 'IconX',
  IconCheck: 'IconCheck',
  IconPlus: 'IconPlus',
  IconMinus: 'IconMinus',
  IconSearch: 'IconSearch',
  IconDots: 'IconDots',
  IconDotsVertical: 'IconDotsVertical',
  
  // Files
  IconFile: 'IconFile',
  IconFolder: 'IconFolder',
  IconFolderOpen: 'IconFolderOpen',
  
  // Interface
  IconEye: 'IconEye',
  IconEyeOff: 'IconEyeOff',
  IconSettings: 'IconSettings',
  IconUser: 'IconUser',
  IconMail: 'IconMail',
  IconBell: 'IconBell',
  IconShield: 'IconShield',
  IconHelp: 'IconHelp',
  
  // Theme
  IconSun: 'IconSun',
  IconMoon: 'IconMoon',
  IconDeviceDesktop: 'IconDeviceDesktop',
} as const
