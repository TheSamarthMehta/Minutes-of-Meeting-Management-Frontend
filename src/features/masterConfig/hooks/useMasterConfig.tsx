import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MeetingType,
  MeetingTypeFormData,
  MeetingTypeStats,
  getAllMeetingTypes,
  getMeetingTypeById,
  createMeetingType,
  updateMeetingType,
  deleteMeetingType,
  bulkCreateMeetingTypes,
  bulkDeleteMeetingTypes,
  sortMeetingTypes,
  filterMeetingTypes,
  paginateMeetingTypes,
  calculateMeetingTypeStats,
  validateMeetingType,
  exportMeetingTypesToCSV,
  downloadCSV,
  parseMeetingTypesFromCSV
} from '../../../api/masterConfigService';

// ============================================================================
// Types
// ============================================================================

type SortField = 'name' | 'date' | 'remarks';
type SortOrder = 'asc' | 'desc';

interface UseMasterConfigReturn {
  // Data
  meetingTypes: MeetingType[];
  filteredTypes: MeetingType[];
  paginatedTypes: MeetingType[];
  selectedType: MeetingType | null;
  stats: MeetingTypeStats | null;

  // Loading & Error States
  loading: boolean;
  error: string | null;
  submitting: boolean;

  // Search & Filter
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Sorting
  sortBy: SortField;
  sortOrder: SortOrder;
  setSortBy: (field: SortField) => void;
  toggleSortOrder: () => void;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Selection
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;

  // CRUD Operations
  fetchMeetingTypes: () => Promise<void>;
  fetchMeetingTypeById: (id: string) => Promise<void>;
  addMeetingType: (data: MeetingTypeFormData) => Promise<MeetingType | null>;
  editMeetingType: (id: string, data: MeetingTypeFormData) => Promise<MeetingType | null>;
  removeMeetingType: (id: string) => Promise<boolean>;
  bulkAdd: (types: MeetingTypeFormData[]) => Promise<boolean>;
  bulkRemove: (ids: string[]) => Promise<boolean>;

  // Utility Functions
  validateForm: (data: MeetingTypeFormData) => string[];
  exportToCSV: () => void;
  importFromCSV: (file: File) => Promise<boolean>;
  refreshStats: () => void;
  clearError: () => void;
}

// ============================================================================
// Custom Hook
// ============================================================================

export const useMasterConfig = (): UseMasterConfigReturn => {
  // State Management
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [selectedType, setSelectedType] = useState<MeetingType | null>(null);
  const [stats, setStats] = useState<MeetingTypeStats | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  // Backend handles filtering, sorting, and pagination
  // These are now just the data returned from backend
  const filteredTypes = meetingTypes;
  const sortedTypes = meetingTypes;
  const paginatedTypes = meetingTypes;
  
  // Total pages from backend pagination
  const [totalPages, setTotalPages] = useState(1);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchMeetingTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllMeetingTypes({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        sortBy: sortBy === 'name' ? 'meetingTypeName' : sortBy === 'date' ? 'createdAt' : 'remarks',
        sortOrder
      });
      setMeetingTypes(response.data);
      setTotalPages(response.pagination.totalPages);
      refreshStatsFromTypes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meeting types');
      console.error('Error fetching meeting types:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, sortBy, sortOrder]);

  const fetchMeetingTypeById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const type = await getMeetingTypeById(id);
      setSelectedType(type);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meeting type');
      console.error('Error fetching meeting type:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  const addMeetingType = useCallback(async (data: MeetingTypeFormData): Promise<MeetingType | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const newType = await createMeetingType(data);
      setMeetingTypes(prev => [...prev, newType]);
      refreshStatsFromTypes([...meetingTypes, newType]);
      return newType;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create meeting type');
      console.error('Error creating meeting type:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [meetingTypes]);

  const editMeetingType = useCallback(async (
    id: string,
    data: MeetingTypeFormData
  ): Promise<MeetingType | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const updatedType = await updateMeetingType(id, data);
      setMeetingTypes(prev =>
        prev.map(type => (type._id === id ? updatedType : type))
      );
      refreshStatsFromTypes(
        meetingTypes.map(type => (type._id === id ? updatedType : type))
      );
      return updatedType;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update meeting type');
      console.error('Error updating meeting type:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [meetingTypes]);

  const removeMeetingType = useCallback(async (id: string): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await deleteMeetingType(id);
      setMeetingTypes(prev => prev.filter(type => type._id !== id));
      refreshStatsFromTypes(meetingTypes.filter(type => type._id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete meeting type');
      console.error('Error deleting meeting type:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [meetingTypes]);

  const bulkAdd = useCallback(async (types: MeetingTypeFormData[]): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      const newTypes = await bulkCreateMeetingTypes(types);
      setMeetingTypes(prev => [...prev, ...newTypes]);
      refreshStatsFromTypes([...meetingTypes, ...newTypes]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to bulk create meeting types');
      console.error('Error bulk creating meeting types:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [meetingTypes]);

  const bulkRemove = useCallback(async (ids: string[]): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await bulkDeleteMeetingTypes(ids);
      setMeetingTypes(prev => prev.filter(type => !ids.includes(type._id)));
      refreshStatsFromTypes(meetingTypes.filter(type => !ids.includes(type._id)));
      setSelectedIds([]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to bulk delete meeting types');
      console.error('Error bulk deleting meeting types:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [meetingTypes]);

  // ============================================================================
  // Selection Management
  // ============================================================================

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(paginatedTypes.map(type => type._id));
  }, [paginatedTypes]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  // ============================================================================
  // Sorting
  // ============================================================================

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const validateForm = useCallback((data: MeetingTypeFormData): string[] => {
    return validateMeetingType(data);
  }, []);

  const exportToCSV = useCallback(() => {
    const csvContent = exportMeetingTypesToCSV(sortedTypes);
    downloadCSV(csvContent, `meeting-types-${new Date().toISOString().split('T')[0]}.csv`);
  }, [sortedTypes]);

  const importFromCSV = useCallback(async (file: File): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      const text = await file.text();
      const types = parseMeetingTypesFromCSV(text);
      
      if (types.length === 0) {
        setError('No valid meeting types found in CSV');
        return false;
      }

      const success = await bulkAdd(types);
      return success;
    } catch (err: any) {
      setError('Failed to import CSV file');
      console.error('Error importing CSV:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [bulkAdd]);

  const refreshStatsFromTypes = useCallback((types: MeetingType[]) => {
    const newStats = calculateMeetingTypeStats(types);
    setStats(newStats);
  }, []);

  const refreshStats = useCallback(() => {
    refreshStatsFromTypes(meetingTypes);
  }, [meetingTypes, refreshStatsFromTypes]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  // Reset to first page when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  // Fetch data when pagination/search/sort changes
  useEffect(() => {
    fetchMeetingTypes();
  }, [currentPage, pageSize, searchTerm, sortBy, sortOrder]);

  // Clear selection when page changes
  useEffect(() => {
    clearSelection();
  }, [currentPage, clearSelection]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Data
    meetingTypes,
    filteredTypes,
    paginatedTypes,
    selectedType,
    stats,

    // Loading & Error States
    loading,
    error,
    submitting,

    // Search & Filter
    searchTerm,
    setSearchTerm,

    // Sorting
    sortBy,
    sortOrder,
    setSortBy,
    toggleSortOrder,

    // Pagination
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize,

    // Selection
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,

    // CRUD Operations
    fetchMeetingTypes,
    fetchMeetingTypeById,
    addMeetingType,
    editMeetingType,
    removeMeetingType,
    bulkAdd,
    bulkRemove,

    // Utility Functions
    validateForm,
    exportToCSV,
    importFromCSV,
    refreshStats,
    clearError
  };
};

export default useMasterConfig;
