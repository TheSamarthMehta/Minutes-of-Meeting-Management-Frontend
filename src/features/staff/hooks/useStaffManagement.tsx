import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Staff,
  StaffFormData,
  StaffStats,
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  bulkDeleteStaff,
  bulkCreateStaff,
  sortStaff,
  filterStaff,
  paginateStaff,
  calculateStaffStats,
  validateStaffData,
  exportStaffToCSV,
  downloadCSV,
  parseStaffFromCSV,
  getStaffMeetings
} from '../../../api/staffService';

// ============================================================================
// Types
// ============================================================================

type SortField = 'name' | 'email' | 'department' | 'role' | 'date';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'card';

export interface UseStaffManagementReturn {
  // State
  staff: Staff[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  currentPage: number;
  pageSize: number;
  selectedIds: string[];
  viewMode: ViewMode;
  stats: StaffStats | null;
  
  // Computed
  filteredStaff: Staff[];
  paginatedStaff: Staff[];
  totalPages: number;
  hasSelection: boolean;
  allSelected: boolean;
  
  // Actions - Search & Filter
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  
  // Actions - Sort
  setSortBy: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  
  // Actions - Pagination
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Actions - Selection
  toggleSelection: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  
  // Actions - View Mode
  setViewMode: (mode: ViewMode) => void;
  
  // Actions - CRUD
  refreshStaff: () => Promise<void>;
  addStaff: (data: StaffFormData) => Promise<Staff>;
  editStaff: (id: string, data: StaffFormData) => Promise<Staff>;
  removeStaff: (id: string) => Promise<void>;
  bulkRemoveStaff: (ids: string[]) => Promise<void>;
  getStaffDetails: (id: string) => Promise<Staff>;
  getStaffMeetingHistory: (id: string) => Promise<any[]>;
  
  // Actions - Import/Export
  exportToCSV: (selectedOnly?: boolean) => void;
  importFromCSV: (file: File) => Promise<void>;
  
  // Actions - Validation
  validateForm: (data: StaffFormData) => string[];
}

// ============================================================================
// Hook
// ============================================================================

export const useStaffManagement = (): UseStaffManagementReturn => {
  // State - Data
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StaffStats | null>(null);
  
  // State - UI Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  // ============================================================================
  // Computed Values
  // ============================================================================
  
  const filteredStaff = useMemo(() => {
    let result = staff;
    
    // Apply search filter
    if (searchTerm.trim()) {
      result = filterStaff(result, searchTerm);
    }
    
    // Apply sorting
    result = sortStaff(result, sortBy, sortOrder);
    
    return result;
  }, [staff, searchTerm, sortBy, sortOrder]);
  
  const totalPages = useMemo(() => {
    return Math.ceil(filteredStaff.length / pageSize);
  }, [filteredStaff.length, pageSize]);
  
  const paginatedStaff = useMemo(() => {
    return paginateStaff(filteredStaff, currentPage, pageSize);
  }, [filteredStaff, currentPage, pageSize]);
  
  const hasSelection = useMemo(() => {
    return selectedIds.length > 0;
  }, [selectedIds.length]);
  
  const allSelected = useMemo(() => {
    return paginatedStaff.length > 0 && 
           paginatedStaff.every(member => selectedIds.includes(member._id));
  }, [paginatedStaff, selectedIds]);
  
  // ============================================================================
  // Effects
  // ============================================================================
  
  // Initial load
  useEffect(() => {
    refreshStaff();
  }, []);
  
  // Calculate stats when staff changes
  useEffect(() => {
    if (staff.length > 0) {
      const newStats = calculateStaffStats(staff);
      setStats(newStats);
    } else {
      setStats(null);
    }
  }, [staff]);
  
  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, pageSize]);
  
  // ============================================================================
  // Actions - Search & Filter
  // ============================================================================
  
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);
  
  // ============================================================================
  // Actions - Sort
  // ============================================================================
  
  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);
  
  // ============================================================================
  // Actions - Pagination
  // ============================================================================
  
  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);
  
  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);
  
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);
  
  // ============================================================================
  // Actions - Selection
  // ============================================================================
  
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);
  
  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      // Deselect all on current page
      const pageIds = paginatedStaff.map(member => member._id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      // Select all on current page
      const pageIds = paginatedStaff.map(member => member._id);
      setSelectedIds(prev => {
        const newIds = [...prev];
        pageIds.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  }, [allSelected, paginatedStaff]);
  
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);
  
  // ============================================================================
  // Actions - CRUD
  // ============================================================================
  
  const refreshStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllStaff({ page: 1, limit: 1000 }); // Get all staff
      setStaff(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const addStaff = useCallback(async (data: StaffFormData): Promise<Staff> => {
    setError(null);
    
    try {
      const newStaff = await createStaff(data);
      setStaff(prev => [...prev, newStaff]);
      return newStaff;
    } catch (err: any) {
      setError(err.message || 'Failed to create staff');
      throw err;
    }
  }, []);
  
  const editStaff = useCallback(async (id: string, data: StaffFormData): Promise<Staff> => {
    setError(null);
    
    try {
      const updatedStaff = await updateStaff(id, data);
      setStaff(prev => prev.map(member => 
        member._id === id ? updatedStaff : member
      ));
      return updatedStaff;
    } catch (err: any) {
      setError(err.message || 'Failed to update staff');
      throw err;
    }
  }, []);
  
  const removeStaff = useCallback(async (id: string): Promise<void> => {
    setError(null);
    
    try {
      await deleteStaff(id);
      setStaff(prev => prev.filter(member => member._id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff');
      throw err;
    }
  }, []);
  
  const bulkRemoveStaff = useCallback(async (ids: string[]): Promise<void> => {
    setError(null);
    
    try {
      await bulkDeleteStaff(ids);
      setStaff(prev => prev.filter(member => !ids.includes(member._id)));
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff members');
      throw err;
    }
  }, []);
  
  const getStaffDetails = useCallback(async (id: string): Promise<Staff> => {
    try {
      return await getStaffById(id);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff details');
      throw err;
    }
  }, []);
  
  const getStaffMeetingHistory = useCallback(async (id: string): Promise<any[]> => {
    try {
      return await getStaffMeetings(id);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meeting history');
      throw err;
    }
  }, []);
  
  // ============================================================================
  // Actions - Import/Export
  // ============================================================================
  
  const exportToCSV = useCallback((selectedOnly: boolean = false) => {
    const dataToExport = selectedOnly && hasSelection
      ? staff.filter(member => selectedIds.includes(member._id))
      : filteredStaff;
    
    const csvContent = exportStaffToCSV(dataToExport);
    const filename = selectedOnly
      ? `staff_selected_${new Date().toISOString().split('T')[0]}.csv`
      : `staff_${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(csvContent, filename);
  }, [staff, filteredStaff, selectedIds, hasSelection]);
  
  const importFromCSV = useCallback(async (file: File): Promise<void> => {
    setError(null);
    
    try {
      const text = await file.text();
      const staffData = parseStaffFromCSV(text);
      
      if (staffData.length === 0) {
        throw new Error('No valid staff data found in CSV');
      }
      
      // Validate all entries
      const validationErrors: string[] = [];
      staffData.forEach((data, index) => {
        const errors = validateStaffData(data);
        if (errors.length > 0) {
          validationErrors.push(`Row ${index + 2}: ${errors.join(', ')}`);
        }
      });
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors:\n${validationErrors.join('\n')}`);
      }
      
      // Import all staff
      const imported = await bulkCreateStaff(staffData);
      setStaff(prev => [...prev, ...imported]);
      
    } catch (err: any) {
      setError(err.message || 'Failed to import staff from CSV');
      throw err;
    }
  }, []);
  
  // ============================================================================
  // Actions - Validation
  // ============================================================================
  
  const validateForm = useCallback((data: StaffFormData): string[] => {
    return validateStaffData(data);
  }, []);
  
  // ============================================================================
  // Return
  // ============================================================================
  
  return {
    // State
    staff,
    loading,
    error,
    searchTerm,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    selectedIds,
    viewMode,
    stats,
    
    // Computed
    filteredStaff,
    paginatedStaff,
    totalPages,
    hasSelection,
    allSelected,
    
    // Actions - Search & Filter
    setSearchTerm,
    clearSearch,
    
    // Actions - Sort
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    
    // Actions - Pagination
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    
    // Actions - Selection
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    
    // Actions - View Mode
    setViewMode,
    
    // Actions - CRUD
    refreshStaff,
    addStaff,
    editStaff,
    removeStaff,
    bulkRemoveStaff,
    getStaffDetails,
    getStaffMeetingHistory,
    
    // Actions - Import/Export
    exportToCSV,
    importFromCSV,
    
    // Actions - Validation
    validateForm
  };
};

export default useStaffManagement;
