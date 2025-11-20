import { api } from '../shared/utils/api';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface Staff {
  _id: string;
  staffName: string;
  emailAddress?: string;
  mobileNo?: string;
  role?: string;
  department?: string;
  designation?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  created?: string;
  modified?: string;
}

export interface StaffFormData {
  staffName: string;
  emailAddress?: string;
  mobileNo?: string;
  role?: string;
  department?: string;
  designation?: string;
  remarks?: string;
}

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

export interface GetStaffResponse {
  success: boolean;
  data: Staff[];
  totalPages?: number;
  currentPage?: number;
  total: number;
}

export interface StaffResponse {
  success: boolean;
  data: Staff;
  message: string;
}

export interface StaffStats {
  totalStaff: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  recentlyAdded: number;
  activeStaff: number;
}

// ============================================================================
// API Service Functions
// ============================================================================

/**
 * Get all staff members with pagination and search
 */
export const getAllStaff = async (params?: PaginationParams): Promise<PaginatedResponse<Staff>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const endpoint = `/staff${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get<PaginatedResponse<Staff>>(endpoint);
  return response;
};

/**
 * Get a single staff member by ID
 */
export const getStaffById = async (id: string): Promise<Staff> => {
  const response = await api.get<StaffResponse>(`/staff/${id}`);
  return response.data;
};

/**
 * Create a new staff member
 */
export const createStaff = async (data: StaffFormData): Promise<Staff> => {
  const response = await api.post<StaffResponse>('/staff', data);
  return response.data;
};

/**
 * Update an existing staff member
 */
export const updateStaff = async (id: string, data: StaffFormData): Promise<Staff> => {
  const response = await api.put<StaffResponse>(`/staff/${id}`, data);
  return response.data;
};

/**
 * Delete a staff member
 */
export const deleteStaff = async (id: string): Promise<void> => {
  await api.delete(`/staff/${id}`);
};

/**
 * Bulk create staff members
 */
export const bulkCreateStaff = async (staffList: StaffFormData[]): Promise<Staff[]> => {
  const promises = staffList.map(staff => createStaff(staff));
  return Promise.all(promises);
};

/**
 * Bulk delete staff members
 */
export const bulkDeleteStaff = async (ids: string[]): Promise<void> => {
  const promises = ids.map(id => deleteStaff(id));
  await Promise.all(promises);
};

/**
 * Get staff member's meeting history
 */
export const getStaffMeetings = async (id: string): Promise<any[]> => {
  const response = await api.get(`/staff/${id}/meetings`);
  return response.data || [];
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sort staff by various criteria
 */
export const sortStaff = (
  staff: Staff[],
  sortBy: 'name' | 'email' | 'department' | 'role' | 'date',
  order: 'asc' | 'desc' = 'asc'
): Staff[] => {
  const sorted = [...staff].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.staffName.localeCompare(b.staffName);
        break;
      case 'email':
        comparison = (a.emailAddress || '').localeCompare(b.emailAddress || '');
        break;
      case 'department':
        comparison = (a.department || '').localeCompare(b.department || '');
        break;
      case 'role':
        comparison = (a.role || '').localeCompare(b.role || '');
        break;
      case 'date':
        comparison = new Date(a.createdAt || a.created || 0).getTime() - 
                     new Date(b.createdAt || b.created || 0).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

/**
 * Filter staff by search term
 */
export const filterStaff = (staff: Staff[], searchTerm: string): Staff[] => {
  if (!searchTerm.trim()) return staff;
  
  const term = searchTerm.toLowerCase();
  return staff.filter(member =>
    member.staffName.toLowerCase().includes(term) ||
    member.emailAddress?.toLowerCase().includes(term) ||
    member.mobileNo?.includes(term) ||
    member.department?.toLowerCase().includes(term) ||
    member.role?.toLowerCase().includes(term)
  );
};

/**
 * Paginate staff list
 */
export const paginateStaff = (
  staff: Staff[],
  page: number,
  pageSize: number
): Staff[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return staff.slice(startIndex, endIndex);
};

/**
 * Calculate staff statistics
 */
export const calculateStaffStats = (staff: Staff[]): StaffStats => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const byRole: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};
  let recentlyAdded = 0;
  
  staff.forEach(member => {
    // Count by role
    if (member.role) {
      byRole[member.role] = (byRole[member.role] || 0) + 1;
    }
    
    // Count by department
    if (member.department) {
      byDepartment[member.department] = (byDepartment[member.department] || 0) + 1;
    }
    
    // Count recently added
    const createdDate = new Date(member.createdAt || member.created || 0);
    if (createdDate > thirtyDaysAgo) {
      recentlyAdded++;
    }
  });
  
  return {
    totalStaff: staff.length,
    byRole,
    byDepartment,
    recentlyAdded,
    activeStaff: staff.length
  };
};

/**
 * Validate staff data
 */
export const validateStaffData = (data: StaffFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.staffName || !data.staffName.trim()) {
    errors.push('Staff name is required');
  }
  
  if (data.staffName && data.staffName.length > 100) {
    errors.push('Staff name must be less than 100 characters');
  }
  
  if (data.emailAddress) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.emailAddress)) {
      errors.push('Invalid email address format');
    }
  }
  
  if (data.mobileNo) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(data.mobileNo.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Mobile number must be 10 digits');
    }
  }
  
  return errors;
};

/**
 * Export staff to CSV
 */
export const exportStaffToCSV = (staff: Staff[]): string => {
  const headers = ['Name', 'Email', 'Mobile', 'Department', 'Role', 'Designation', 'Created At'];
  const rows = staff.map(member => [
    member.staffName,
    member.emailAddress || '',
    member.mobileNo || '',
    member.department || '',
    member.role || '',
    member.designation || '',
    member.createdAt ? new Date(member.createdAt).toLocaleDateString() : ''
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
export const downloadCSV = (csvContent: string, filename: string = 'staff.csv'): void => {
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
 * Parse staff from CSV
 */
export const parseStaffFromCSV = (csvText: string): StaffFormData[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  // Skip header row
  const dataLines = lines.slice(1);
  
  const staff: StaffFormData[] = dataLines.map(line => {
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    
    if (matches && matches.length >= 1) {
      const staffName = matches[0].replace(/^"(.*)"$/, '$1').trim();
      const emailAddress = matches[1] ? matches[1].replace(/^"(.*)"$/, '$1').trim() : undefined;
      const mobileNo = matches[2] ? matches[2].replace(/^"(.*)"$/, '$1').trim() : undefined;
      const department = matches[3] ? matches[3].replace(/^"(.*)"$/, '$1').trim() : undefined;
      const role = matches[4] ? matches[4].replace(/^"(.*)"$/, '$1').trim() : undefined;
      const designation = matches[5] ? matches[5].replace(/^"(.*)"$/, '$1').trim() : undefined;
      
      return {
        staffName,
        emailAddress,
        mobileNo,
        department,
        role,
        designation
      };
    }
    
    return { staffName: '' };
  }).filter(member => member.staffName);
  
  return staff;
};

/**
 * Get staff initials
 */
export const getStaffInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format staff for display
 */
export const formatStaffDisplay = (staff: Staff): string => {
  let display = staff.staffName;
  if (staff.designation) {
    display += ` - ${staff.designation}`;
  }
  if (staff.department) {
    display += ` (${staff.department})`;
  }
  return display;
};

export default {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  bulkCreateStaff,
  bulkDeleteStaff,
  getStaffMeetings,
  sortStaff,
  filterStaff,
  paginateStaff,
  calculateStaffStats,
  validateStaffData,
  exportStaffToCSV,
  downloadCSV,
  parseStaffFromCSV,
  getStaffInitials,
  formatStaffDisplay
};
