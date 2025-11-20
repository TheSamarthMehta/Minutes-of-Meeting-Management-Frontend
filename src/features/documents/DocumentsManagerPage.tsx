import React, { useMemo, useState } from "react";
import { 
  PlusCircle, Search, FileText, Folder, Calendar, Eye, Download, Trash2,
  Upload, X, CheckCircle, AlertCircle, Filter, ArrowUpDown, MoreVertical,
  FileIcon, File, Image, Video, Archive, Code
} from "lucide-react";
import DocumentService from '../../api/documentService';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import Modal from '../../shared/components/Modal';
import DataTable from '../../shared/components/DataTable';
import { FormSelect, FormButton } from '../../shared/components/FormComponents';
import { formatFileSize, getFileType, getFileIcon, FileUpload, FileActions } from '../../shared/components/FileComponents';
import { useDocuments } from './hooks/useDocuments';

const DocumentsManagerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterMeeting, setFilterMeeting] = useState("All");
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<any>(null);
  
  const {
    documents,
    meetings,
    loading,
    error,
    selectedFile,
    uploadMeeting,
    showUploadModal,
    setSelectedFile,
    setUploadMeeting,
    setShowUploadModal,
    handleDelete,
    handleView,
    handleDownload,
    handleUpload
  } = useDocuments();

  // Enhanced filtering and sorting
  const filteredAndSortedDocs = useMemo(() => {
    let filtered = DocumentService.filterDocuments(documents, searchQuery, filterType);
    
    // Filter by meeting
    if (filterMeeting !== "All") {
      filtered = filtered.filter((d: any) => d.meetingTitle === filterMeeting);
    }
    
    // Sort documents
    filtered.sort((a: any, b: any) => {
      if (sortBy === 'name') {
        return a.documentName.localeCompare(b.documentName);
      } else if (sortBy === 'date') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      } else if (sortBy === 'size') {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      return 0;
    });
    
    return filtered;
  }, [documents, searchQuery, filterType, filterMeeting, sortBy]);

  const stats = useMemo(() => {
    const count = documents.length;
    const size = documents.reduce((sum: number, d: any) => sum + (d.fileSize || 0), 0);
    const meetingsCount = new Set(documents.map((d: any) => d.meetingTitle)).size;
    const recentUploads = documents.filter((d: any) => {
      const uploadDate = new Date(d.uploadDate);
      const daysDiff = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;
    return { count, size, meetingsCount, recentUploads };
  }, [documents]);

  // Handle delete confirmation
  const confirmDelete = (doc: any) => {
    setDocToDelete(doc);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (docToDelete) {
      await handleDelete(docToDelete._id);
      setShowDeleteConfirm(false);
      setDocToDelete(null);
    }
  };

  // Toggle document selection
  const toggleDocSelection = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedDocs.length} document(s)?`)) {
      for (const docId of selectedDocs) {
        await handleDelete(docId);
      }
      setSelectedDocs([]);
    }
  };

  if (loading && documents.length === 0) {
    return <LoadingSpinner text="Loading documents..." fullScreen />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  const tableColumns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedDocs.length === filteredAndSortedDocs.length && filteredAndSortedDocs.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedDocs(filteredAndSortedDocs.map((d: any) => d._id));
            } else {
              setSelectedDocs([]);
            }
          }}
          className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
        />
      ),
      render: (_: any, doc: any) => (
        <input
          type="checkbox"
          checked={selectedDocs.includes(doc._id)}
          onChange={() => toggleDocSelection(doc._id)}
          className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
        />
      )
    },
    {
      key: 'documentName',
      header: 'Document',
      render: (value: string, doc: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            {getFileIcon(doc.documentType, 20)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(doc.fileSize)}</p>
          </div>
        </div>
      )
    },
    {
      key: 'meetingTitle',
      header: 'Meeting',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{value}</span>
        </div>
      )
    },
    {
      key: 'uploadDate',
      header: 'Upload Date',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {value ? new Date(value).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, doc: any) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleView(doc)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDownload(doc)}
            className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => confirmDelete(doc)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                Documents Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Upload and manage meeting documents</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg"
            >
              <Upload className="h-5 w-5" />
              <span className="font-medium">Upload Document</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Total Documents</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.count}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Total Size</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatFileSize(stats.size)}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Folder className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Meetings</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.meetingsCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600 rounded-xl p-6 text-white hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-100 dark:text-teal-200 font-medium mb-2">Recent Uploads</p>
                <h3 className="text-3xl font-bold">{stats.recentUploads}</h3>
                <p className="text-xs text-teal-100 mt-1">Last 7 days</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search documents by name, type, or meeting..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="All">All Types</option>
                <option value="PDF">PDF</option>
                <option value="DOC">DOC</option>
                <option value="XLS">XLS</option>
                <option value="PPT">PPT</option>
                <option value="Image">Image</option>
              </select>

              <select
                value={filterMeeting}
                onChange={(e) => setFilterMeeting(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[150px]"
              >
                <option value="All">All Meetings</option>
                {meetings.map((meeting: any) => (
                  <option key={meeting._id} value={meeting.meetingTitle}>
                    {meeting.meetingTitle}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>
            </div>
          </div>

          {/* Selected documents toolbar */}
          {selectedDocs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedDocs.length} document(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDocs([])}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear selection
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Documents Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {filteredAndSortedDocs.length > 0 ? (
            <DataTable
              columns={tableColumns}
              data={filteredAndSortedDocs}
              emptyMessage="No documents found"
              emptyIcon={<FileText className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
            />
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || filterType !== 'All' || filterMeeting !== 'All'
                  ? 'Try adjusting your filters or search query'
                  : 'Upload your first document to get started'}
              </p>
              {!searchQuery && filterType === 'All' && filterMeeting === 'All' && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg"
                >
                  <Upload className="h-5 w-5" />
                  Upload Document
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Document</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Select a meeting and upload a document</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Meeting *
                  </label>
                  <select
                    value={uploadMeeting}
                    onChange={(e) => setUploadMeeting(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a meeting</option>
                    {meetings.map((meeting: any) => (
                      <option key={meeting._id} value={meeting._id}>
                        {meeting.meetingTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select File *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                  </div>
                  {selectedFile && (
                    <div className="mt-2 p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadMeeting("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadMeeting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && docToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Document</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete <span className="font-semibold">"{docToDelete.documentName}"</span>?
                </p>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDocToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsManagerPage;
