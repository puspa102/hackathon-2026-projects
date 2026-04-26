// API Base URL - Configure based on environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/accounts/register/',
    LOGIN: '/accounts/login/',
    LOGOUT: '/accounts/logout/',
  },

  // Check-ins
  CHECKINS: {
    LIST: '/checkins/',
    CREATE: '/checkins/',
    DETAIL: (id: string | number) => `/checkins/${id}/`,
  },

  // Doctors
  DOCTORS: {
    LIST: '/doctors/',
    DETAIL: (id: string | number) => `/doctors/${id}/`,
    NEARBY: '/doctors/nearby/',
  },

  // Chat
  CHAT: {
    LIST: '/chat/',
    SEND: '/chat/send/',
    DETAIL: (id: string | number) => `/chat/${id}/`,
  },

  // Alerts
  ALERTS: {
    LIST: '/alerts/',
    DETAIL: (id: string | number) => `/alerts/${id}/`,
    UNREAD_COUNT: '/alerts/unread_count/',
    MARK_AS_READ: '/alerts/mark_as_read/',
    MARK_ALL_READ: '/alerts/mark_all_as_read/',
    ACKNOWLEDGE: (id: string | number) => `/alerts/${id}/acknowledge/`,
    CRITICAL: '/alerts/critical_alerts/',
  },

  // Medicines
  MEDICINES: {
    LIST: '/medicines/',
    CREATE: '/medicines/',
    DETAIL: (id: string | number) => `/medicines/${id}/`,
    UPDATE: (id: string | number) => `/medicines/${id}/`,
    DELETE: (id: string | number) => `/medicines/${id}/`,
  },

  // Reports
  REPORTS: {
    LIST: '/reports/',
    UPLOAD: '/reports/upload/',
    DETAIL: (id: string | number) => `/reports/${id}/`,
    DELETE: (id: string | number) => `/reports/${id}/`,
  },
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// HTTP Methods
export enum HTTP_METHOD {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

// Request options
export interface RequestOptions {
  method?: HTTP_METHOD;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  token?: string;
}

// Risk Level Constants
export const RISK_LEVELS = {
  NORMAL: 'normal',
  WARNING: 'warning',
  EMERGENCY: 'emergency',
} as const;

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
} as const;

// Alert Types
export const ALERT_TYPES = {
  HEALTH_CHECK: 'health_check',
  MEDICATION: 'medication',
  APPOINTMENT: 'appointment',
  DOCTOR_MESSAGE: 'doctor_message',
  SYSTEM: 'system',
} as const;

// Alert Severity
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// File Upload Config
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
