import { api } from '../shared/utils/api';
import apiService from './apiService';
import { getFileType } from '../shared/components/FileComponents';
import type { Meeting, MeetingDocument } from '../types';

interface DocumentWithMetadata extends MeetingDocument {
  uploadedByName: string;
  meetingTitle: string;
  meetingId: string;
  documentType?: string;
}

export class DocumentService {
  static async fetchAllDocuments(meetings: any[]): Promise<DocumentWithMetadata[]> {
    const allDocuments: DocumentWithMetadata[] = [];
    
    for (const meeting of meetings) {
      try {
        const docsResponse: any = await api.get(`/meetings/${meeting._id}/documents`);
        const docsArray = Array.isArray(docsResponse) ? docsResponse : (docsResponse?.data || []);
        const meetingDocs = docsArray.map((doc: any) => ({
          ...doc,
          uploadedByName: doc.uploadedBy?.staffName || doc.uploadedBy?.name || doc.uploadedBy || 'N/A',
          createdAt: doc.created || doc.createdAt,
          meetingTitle: meeting.meetingTitle || 'Unknown Meeting',
          meetingId: meeting._id
        }));
        allDocuments.push(...meetingDocs);
      } catch (err) {
        console.warn(`Failed to fetch documents for meeting ${meeting._id}:`, err);
      }
    }
    
    return allDocuments;
  }

  static async deleteDocument(doc: DocumentWithMetadata): Promise<boolean> {
    if (window.confirm(`Are you sure you want to delete "${doc.documentName}"?`)) {
      try {
        await api.delete(`/meeting-documents/${doc._id}`);
        return true;
      } catch (err: any) {
        alert(err.message || 'Failed to delete document');
        return false;
      }
    }
    return false;
  }

  static async viewDocument(doc: DocumentWithMetadata): Promise<boolean> {
    try {
      const response = await apiService.viewFile(doc._id);
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to view document');
      return false;
    }
  }

  static async downloadDocument(doc: DocumentWithMetadata): Promise<boolean> {
    try {
      const response = await apiService.downloadFile(doc._id);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to download document');
      return false;
    }
  }

  static async uploadDocument(
    selectedFile: File | null, 
    uploadMeeting: string | null, 
    meetings: any[]
  ): Promise<DocumentWithMetadata | null> {
    if (!selectedFile || !uploadMeeting) {
      alert("Please select a file and meeting.");
      return null;
    }

    try {
      const documentData = {
        documentName: selectedFile.name,
        documentType: getFileType(selectedFile.name),
        documentDescription: `Uploaded file: ${selectedFile.name}`,
        fileSize: selectedFile.size
      };
      
      const response: any = await api.post(`/meetings/${uploadMeeting}/documents`, documentData);
      const createdDoc = response?.data || response;
      const docId = createdDoc?.data?._id || createdDoc?._id;
      if (docId) {
        await apiService.uploadFile(docId, selectedFile);
      }
      const rawDoc = createdDoc?.data || createdDoc;
      const newDoc: DocumentWithMetadata = {
        ...rawDoc,
        uploadedByName: rawDoc?.uploadedBy?.staffName || rawDoc?.uploadedBy?.name || rawDoc?.uploadedBy || 'N/A',
        createdAt: rawDoc?.created || rawDoc?.createdAt,
        meetingTitle: meetings.find(m => m._id === uploadMeeting)?.meetingTitle || 'Unknown Meeting',
        meetingId: uploadMeeting
      };
      
      return newDoc;
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
      return null;
    }
  }

  static filterDocuments(
    documents: DocumentWithMetadata[], 
    searchQuery: string, 
    filterType: string
  ): DocumentWithMetadata[] {
    return documents.filter((doc) => {
      const matchesSearch = doc.documentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.meetingTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === "All" || doc.documentType === filterType;
      return matchesSearch && matchesFilter;
    });
  }
}

export default DocumentService;
