import { getApiUrl, getAuthHeaders, getFileUploadUrl } from '../shared/constants/constants';
import type { ApiResponse } from '../types';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiUrl('');
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T> | Response> {
    const url = getApiUrl(endpoint);
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T> | Response> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data: any, options: RequestOptions = {}): Promise<ApiResponse<T> | Response> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data: any, options: RequestOptions = {}): Promise<ApiResponse<T> | Response> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T> | Response> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadFile(documentId: string, file: File): Promise<Response> {
    const url = getFileUploadUrl(documentId);
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return response;
  }

  async downloadFile(documentId: string): Promise<Response> {
    const url = getFileUploadUrl(documentId);
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('File download failed');
    }

    return response;
  }

  async viewFile(documentId: string): Promise<Response> {
    const url = getFileUploadUrl(documentId);
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('File view failed');
    }

    return response;
  }
}

const apiService = new ApiService();

export default apiService;
