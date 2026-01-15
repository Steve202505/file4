// API Constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// User Roles
export const USER_ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin'
};

// Win/Loss Control Levels
export const CONTROL_LEVELS = [
  { value: 'none', label: 'None', description: 'No control - Normal trading allowed' },
  { value: 'low', label: 'Low Control', description: 'Minimal limits on trading activities' },
  { value: 'medium', label: 'Medium Control', description: 'Moderate limits on trading activities' },
  { value: 'high', label: 'High Control', description: 'Strict limits on trading activities' }
];

// Agent Permissions
export const AGENT_PERMISSIONS = [
  { value: 'view_users', label: 'View Users' },
  { value: 'edit_users', label: 'Edit Users' },
  { value: 'manage_winloss', label: 'Manage Win/Loss' },
  { value: 'delete_users', label: 'Delete Users' }
];

// Table Page Sizes
export const PAGE_SIZES = [10, 25, 50, 100];

// Status Options
export const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

// User Search Filters
export const USER_SEARCH_FILTERS = [
  { value: 'username', label: 'Username' },
  { value: 'email', label: 'Email' },
  { value: 'mobile', label: 'Mobile Number' },
  { value: 'id', label: 'User ID' }
];

// Agent Search Filters
export const AGENT_SEARCH_FILTERS = [
  { value: 'username', label: 'Username' },
  { value: 'role', label: 'Role' },
  { value: 'status', label: 'Status' }
];

// Local Storage Keys
export const STORAGE_KEYS = {
  AGENT_TOKEN: 'agentToken',
  AGENT_DATA: 'agentData',
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData'
};

// Route Paths
export const ROUTE_PATHS = {
  AGENT_LOGIN: '/login',
  AGENT_DASHBOARD: '/dashboard',
  USER_MANAGEMENT: '/user-management',
  AGENT_MANAGEMENT: '/agent-management'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  TIME: 'hh:mm A',
  FULL: 'MMM DD, YYYY hh:mm A'
};

// Default Values
export const DEFAULT_VALUES = {
  PAGE: 1,
  PAGE_SIZE: 10,
  SEARCH_DEBOUNCE: 300 // milliseconds
};