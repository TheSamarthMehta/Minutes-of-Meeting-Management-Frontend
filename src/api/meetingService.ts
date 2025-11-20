import { api } from '../shared/utils/api';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface MeetingType {
  _id: string;
  meetingTypeName: string;
  remarks?: string;
}

export interface Meeting {
  _id: string;
  meetingTitle: string;
  meetingDescription?: string;
  meetingTypeId: string | MeetingType;
  meetingDate: string;
  meetingTime: string;
  duration?: number;
  location?: string;
  agenda?: string;
  status?: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  createdAt?: string;
  updatedAt?: string;
  created?: string;
  modified?: string;
  // Intelligent status fields from backend
  intelligentStatus?: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  timeInfo?: {
    status: 'upcoming' | 'inProgress' | 'ended' | 'cancelled';
    message: string;
    minutesUntilStart?: number;
    minutesElapsed?: number;
    minutesRemaining?: number;
    minutesSinceEnd?: number;
  };
  hasStarted?: boolean;
  hasEnded?: boolean;
  meetingDateTime?: string;
  meetingEndTime?: string;
}

export interface MeetingFormData {
  meetingTitle: string;
  meetingDescription?: string;
  meetingTypeId: string;
  meetingDate: string;
  meetingTime: string;
  duration?: number;
  location?: string;
  agenda?: string;
  status?: string;
}

export interface GetMeetingsResponse {
  success: boolean;
  data: Meeting[];
  totalPages?: number;
  currentPage?: number;
  total: number;
}

export interface MeetingResponse {
  success: boolean;
  data: Meeting;
  message: string;
}

export interface MeetingStats {
  totalMeetings: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  upcomingMeetings: number;
  todayMeetings: number;
  thisWeekMeetings: number;
  completedMeetings: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  meetingTypeId?: string;
  startDate?: string;
  endDate?: string;
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

// ============================================================================
// Meeting API Functions
// ============================================================================

/**
 * Get all meetings with pagination and filters
 */
export const getAllMeetings = async (params?: PaginationParams): Promise<PaginatedResponse<Meeting>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.meetingTypeId) queryParams.append('meetingTypeId', params.meetingTypeId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const endpoint = `/meetings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get<PaginatedResponse<Meeting>>(endpoint);
  return response;
};

/**
 * Get a single meeting by ID
 */
export const getMeetingById = async (id: string): Promise<Meeting> => {
  const response = await api.get<MeetingResponse>(`/meetings/${id}`);
  return response.data;
};

/**
 * Create a new meeting
 */
export const createMeeting = async (data: MeetingFormData): Promise<Meeting> => {
  const response = await api.post<MeetingResponse>('/meetings', data);
  return response.data;
};

/**
 * Update an existing meeting
 */
export const updateMeeting = async (id: string, data: MeetingFormData): Promise<Meeting> => {
  const response = await api.put<MeetingResponse>(`/meetings/${id}`, data);
  return response.data;
};

/**
 * Delete a meeting
 */
export const deleteMeeting = async (id: string): Promise<void> => {
  await api.delete(`/meetings/${id}`);
};

/**
 * Bulk delete meetings
 */
export const bulkDeleteMeetings = async (ids: string[]): Promise<void> => {
  const promises = ids.map(id => deleteMeeting(id));
  await Promise.all(promises);
};

// ============================================================================
// Meeting Type API Functions
// ============================================================================

/**
 * Get all meeting types
 */
export const getAllMeetingTypes = async (): Promise<MeetingType[]> => {
  const response = await api.get('/meeting-types');
  return response.data || [];
};

/**
 * Get meeting type by ID
 */
export const getMeetingTypeById = async (id: string): Promise<MeetingType> => {
  const response = await api.get(`/meeting-types/${id}`);
  return response.data;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sort meetings by various criteria
 */
export const sortMeetings = (
  meetings: Meeting[],
  sortBy: 'title' | 'date' | 'type' | 'status',
  order: 'asc' | 'desc' = 'asc'
): Meeting[] => {
  const sorted = [...meetings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.meetingTitle.localeCompare(b.meetingTitle);
        break;
      case 'date':
        comparison = new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime();
        break;
      case 'type': {
        const typeA = typeof a.meetingTypeId === 'string' ? a.meetingTypeId : a.meetingTypeId?.meetingTypeName || '';
        const typeB = typeof b.meetingTypeId === 'string' ? b.meetingTypeId : b.meetingTypeId?.meetingTypeName || '';
        comparison = typeA.localeCompare(typeB);
        break;
      }
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '');
        break;
      default:
        comparison = 0;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

/**
 * Filter meetings by search term
 */
export const filterMeetings = (meetings: Meeting[], searchTerm: string): Meeting[] => {
  if (!searchTerm.trim()) return meetings;
  
  const term = searchTerm.toLowerCase();
  return meetings.filter(meeting => {
    const typeName = typeof meeting.meetingTypeId === 'string' 
      ? meeting.meetingTypeId 
      : meeting.meetingTypeId?.meetingTypeName || '';
      
    return (
      meeting.meetingTitle.toLowerCase().includes(term) ||
      meeting.meetingDescription?.toLowerCase().includes(term) ||
      typeName.toLowerCase().includes(term) ||
      meeting.location?.toLowerCase().includes(term) ||
      meeting.agenda?.toLowerCase().includes(term)
    );
  });
};

/**
 * Filter meetings by status
 */
export const filterMeetingsByStatus = (meetings: Meeting[], status: string): Meeting[] => {
  if (!status) return meetings;
  return meetings.filter(meeting => meeting.status === status);
};

/**
 * Filter meetings by type
 */
export const filterMeetingsByType = (meetings: Meeting[], typeId: string): Meeting[] => {
  if (!typeId) return meetings;
  return meetings.filter(meeting => {
    const meetingTypeId = typeof meeting.meetingTypeId === 'string' 
      ? meeting.meetingTypeId 
      : meeting.meetingTypeId?._id || '';
    return meetingTypeId === typeId;
  });
};

/**
 * Filter meetings by date range
 */
export const filterMeetingsByDateRange = (
  meetings: Meeting[],
  startDate?: string,
  endDate?: string
): Meeting[] => {
  if (!startDate && !endDate) return meetings;
  
  return meetings.filter(meeting => {
    const meetingDate = new Date(meeting.meetingDate);
    if (startDate && meetingDate < new Date(startDate)) return false;
    if (endDate && meetingDate > new Date(endDate)) return false;
    return true;
  });
};

/**
 * Paginate meetings
 */
export const paginateMeetings = (
  meetings: Meeting[],
  page: number,
  pageSize: number
): Meeting[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return meetings.slice(startIndex, endIndex);
};

/**
 * Calculate meeting statistics
 */
export const calculateMeetingStats = (meetings: Meeting[]): MeetingStats => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let upcomingMeetings = 0;
  let todayMeetings = 0;
  let thisWeekMeetings = 0;
  let completedMeetings = 0;
  
  meetings.forEach(meeting => {
    const meetingDate = new Date(meeting.meetingDate);
    
    // Count by status
    const status = meeting.status || 'Scheduled';
    byStatus[status] = (byStatus[status] || 0) + 1;
    
    // Count by type
    const typeName = typeof meeting.meetingTypeId === 'string'
      ? meeting.meetingTypeId
      : meeting.meetingTypeId?.meetingTypeName || 'Unknown';
    byType[typeName] = (byType[typeName] || 0) + 1;
    
    // Count upcoming meetings
    if (meetingDate >= now && status !== 'Completed' && status !== 'Cancelled') {
      upcomingMeetings++;
    }
    
    // Count today's meetings
    if (meetingDate >= today && meetingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
      todayMeetings++;
    }
    
    // Count this week's meetings
    if (meetingDate >= now && meetingDate <= weekFromNow) {
      thisWeekMeetings++;
    }
    
    // Count completed meetings
    if (status === 'Completed') {
      completedMeetings++;
    }
  });
  
  return {
    totalMeetings: meetings.length,
    byStatus,
    byType,
    upcomingMeetings,
    todayMeetings,
    thisWeekMeetings,
    completedMeetings
  };
};

/**
 * Validate meeting data
 */
export const validateMeetingData = (data: MeetingFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.meetingTitle || !data.meetingTitle.trim()) {
    errors.push('Meeting title is required');
  }
  
  if (data.meetingTitle && data.meetingTitle.length > 200) {
    errors.push('Meeting title must be less than 200 characters');
  }
  
  if (!data.meetingTypeId) {
    errors.push('Meeting type is required');
  }
  
  if (!data.meetingDate) {
    errors.push('Meeting date is required');
  }
  
  if (!data.meetingTime) {
    errors.push('Meeting time is required');
  }
  
  if (data.duration && data.duration < 0) {
    errors.push('Duration must be a positive number');
  }
  
  return errors;
};

/**
 * Export meetings to CSV
 */
export const exportMeetingsToCSV = (meetings: Meeting[]): string => {
  const headers = ['Title', 'Type', 'Date', 'Time', 'Duration', 'Location', 'Status', 'Description'];
  const rows = meetings.map(meeting => {
    const typeName = typeof meeting.meetingTypeId === 'string'
      ? meeting.meetingTypeId
      : meeting.meetingTypeId?.meetingTypeName || '';
      
    return [
      meeting.meetingTitle,
      typeName,
      meeting.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString() : '',
      meeting.meetingTime || '',
      meeting.duration?.toString() || '',
      meeting.location || '',
      meeting.status || 'Scheduled',
      meeting.meetingDescription || ''
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string = 'meetings.csv'): void => {
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
 * Get meeting type name from ID or object
 */
export const getMeetingTypeName = (meetingTypeId: string | MeetingType): string => {
  if (typeof meetingTypeId === 'string') {
    return meetingTypeId;
  }
  return meetingTypeId?.meetingTypeName || 'Unknown';
};

/**
 * Format meeting date and time
 */
export const formatMeetingDateTime = (date: string, time: string): string => {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  return `${formattedDate} at ${time}`;
};

/**
 * Check if meeting is upcoming
 */
export const isUpcoming = (meeting: Meeting): boolean => {
  const now = new Date();
  const meetingDate = new Date(meeting.meetingDate);
  return meetingDate >= now && meeting.status !== 'Completed' && meeting.status !== 'Cancelled';
};

/**
 * Check if meeting is today
 */
export const isToday = (meeting: Meeting): boolean => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const meetingDate = new Date(meeting.meetingDate);
  return meetingDate >= today && meetingDate < tomorrow;
};

/**
 * Get meeting status color
 */
export const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'Scheduled':
      return 'blue';
    case 'InProgress':
      return 'yellow';
    case 'Completed':
      return 'green';
    case 'Cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

export default {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  bulkDeleteMeetings,
  getAllMeetingTypes,
  getMeetingTypeById,
  sortMeetings,
  filterMeetings,
  filterMeetingsByStatus,
  filterMeetingsByType,
  filterMeetingsByDateRange,
  paginateMeetings,
  calculateMeetingStats,
  validateMeetingData,
  exportMeetingsToCSV,
  downloadCSV,
  getMeetingTypeName,
  formatMeetingDateTime,
  isUpcoming,
  isToday,
  getStatusColor
};
