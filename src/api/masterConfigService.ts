import { api } from '../shared/utils/api';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface MeetingType {
  _id: string;
  meetingTypeName: string;
  remarks?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingTypeFormData {
  meetingTypeName: string;
  remarks?: string;
  category?: string;
}

export interface GetMeetingTypesResponse {
  success: boolean;
  data: MeetingType[];
  total: number;
}

export interface MeetingTypeResponse {
  success: boolean;
  data: MeetingType;
  message: string;
}

export interface DeleteMeetingTypeResponse {
  success: boolean;
  message: string;
  data: {};
}

export interface MeetingTypeStats {
  totalTypes: number;
  recentlyAdded: number;
  mostUsed: MeetingType[];
  leastUsed: MeetingType[];
}

// ============================================================================
// API Service Functions
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Get all meeting types with pagination
 */
export const getAllMeetingTypes = async (params?: PaginationParams): Promise<PaginatedResponse<MeetingType>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const endpoint = `/meeting-types${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get<PaginatedResponse<MeetingType>>(endpoint);
  return response;
};

/**
 * Get a single meeting type by ID
 */
export const getMeetingTypeById = async (id: string): Promise<MeetingType> => {
  const response = await api.get<any>(`/meeting-types/${id}`);
  // Backend returns: { success, data: {...} }
  return response.data;
};

/**
 * Create a new meeting type
 */
export const createMeetingType = async (data: MeetingTypeFormData): Promise<MeetingType> => {
  const response = await api.post<any>('/meeting-types', data);
  // Backend returns: { success, message, data: {...} }
  return response.data;
};

/**
 * Update an existing meeting type
 */
export const updateMeetingType = async (
  id: string,
  data: MeetingTypeFormData
): Promise<MeetingType> => {
  const response = await api.put<any>(`/meeting-types/${id}`, data);
  // Backend returns: { success, message, data: {...} }
  return response.data;
};

/**
 * Delete a meeting type
 */
export const deleteMeetingType = async (id: string): Promise<void> => {
  await api.delete<DeleteMeetingTypeResponse>(`/meeting-types/${id}`);
};

/**
 * Bulk create meeting types
 */
export const bulkCreateMeetingTypes = async (
  types: MeetingTypeFormData[]
): Promise<MeetingType[]> => {
  const promises = types.map(type => createMeetingType(type));
  return Promise.all(promises);
};

/**
 * Bulk delete meeting types
 */
export const bulkDeleteMeetingTypes = async (ids: string[]): Promise<void> => {
  const promises = ids.map(id => deleteMeetingType(id));
  await Promise.all(promises);
};

/**
 * Export meeting types to CSV format
 */
export const exportMeetingTypesToCSV = (types: MeetingType[]): string => {
  const headers = ['Meeting Type Name', 'Remarks', 'Created At'];
  const rows = types.map(type => [
    type.meetingTypeName,
    type.remarks || '',
    type.createdAt ? new Date(type.createdAt).toLocaleDateString() : ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string = 'meeting-types.csv'): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Import meeting types from CSV
 */
export const parseMeetingTypesFromCSV = (csvText: string): MeetingTypeFormData[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  // Skip header row
  const dataLines = lines.slice(1);
  
  const types: MeetingTypeFormData[] = dataLines.map(line => {
    // Simple CSV parsing (handles quoted fields)
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    
    if (matches && matches.length >= 1) {
      const meetingTypeName = matches[0].replace(/^"(.*)"$/, '$1').trim();
      const remarks = matches[1] ? matches[1].replace(/^"(.*)"$/, '$1').trim() : undefined;
      
      return {
        meetingTypeName,
        remarks
      };
    }
    
    return { meetingTypeName: '' };
  }).filter(type => type.meetingTypeName);
  
  return types;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sort meeting types by various criteria
 */
export const sortMeetingTypes = (
  types: MeetingType[],
  sortBy: 'name' | 'date' | 'remarks',
  order: 'asc' | 'desc' = 'asc'
): MeetingType[] => {
  const sorted = [...types].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.meetingTypeName.localeCompare(b.meetingTypeName);
        break;
      case 'date':
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
      case 'remarks':
        comparison = (a.remarks || '').localeCompare(b.remarks || '');
        break;
      default:
        comparison = 0;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

/**
 * Filter meeting types by search term
 */
export const filterMeetingTypes = (
  types: MeetingType[],
  searchTerm: string
): MeetingType[] => {
  if (!searchTerm.trim()) return types;
  
  const term = searchTerm.toLowerCase();
  return types.filter(type =>
    type.meetingTypeName.toLowerCase().includes(term) ||
    (type.remarks?.toLowerCase().includes(term))
  );
};

/**
 * Paginate meeting types
 */
export const paginateMeetingTypes = (
  types: MeetingType[],
  page: number,
  pageSize: number
): MeetingType[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return types.slice(startIndex, endIndex);
};

/**
 * Calculate meeting type statistics
 */
export const calculateMeetingTypeStats = (types: MeetingType[]): MeetingTypeStats => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentlyAdded = types.filter(type => {
    if (!type.createdAt) return false;
    return new Date(type.createdAt) > thirtyDaysAgo;
  }).length;
  
  return {
    totalTypes: types.length,
    recentlyAdded,
    mostUsed: [], // Will be populated with actual usage data from meetings
    leastUsed: []
  };
};

/**
 * Validate meeting type data
 */
export const validateMeetingType = (data: MeetingTypeFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.meetingTypeName || !data.meetingTypeName.trim()) {
    errors.push('Meeting type name is required');
  }
  
  if (data.meetingTypeName && data.meetingTypeName.length > 100) {
    errors.push('Meeting type name must be less than 100 characters');
  }
  
  if (data.remarks && data.remarks.length > 500) {
    errors.push('Remarks must be less than 500 characters');
  }
  
  return errors;
};

/**
 * Format meeting type for display
 */
export const formatMeetingTypeDisplay = (type: MeetingType): string => {
  return type.meetingTypeName;
};

/**
 * Get initials from meeting type name
 */
export const getMeetingTypeInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default {
  getAllMeetingTypes,
  getMeetingTypeById,
  createMeetingType,
  updateMeetingType,
  deleteMeetingType,
  bulkCreateMeetingTypes,
  bulkDeleteMeetingTypes,
  exportMeetingTypesToCSV,
  downloadCSV,
  parseMeetingTypesFromCSV,
  sortMeetingTypes,
  filterMeetingTypes,
  paginateMeetingTypes,
  calculateMeetingTypeStats,
  validateMeetingType,
  formatMeetingTypeDisplay,
  getMeetingTypeInitials
};
