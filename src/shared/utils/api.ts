import { getApiUrl, getAuthHeaders } from '../constants/constants';

interface FetchOptions {
  headers?: Record<string, string>;
}

interface ApiError extends Error {
  status?: number;
  response?: {
    data: any;
    status: number;
  };
}

const fetchData = async <T = any>(
  endpoint: string, 
  method: string = 'GET', 
  body: any = null, 
  options: FetchOptions = {}
): Promise<T> => {
    const url = getApiUrl(endpoint);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
    };
    
    const config: RequestInit = {
        method,
        headers,
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);
        
        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        if (!response.ok) {
            const errorMessage = data?.message || data || `HTTP error! status: ${response.status}`;
            const error = new Error(errorMessage) as ApiError;
            error.status = response.status;
            error.response = { data, status: response.status };
            throw error;
        }
        
        return data;
    } catch (error: any) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
};

export const api = {
    get: <T = any>(endpoint: string, options: FetchOptions = {}) => 
        fetchData<T>(endpoint, 'GET', null, options),
    post: <T = any>(endpoint: string, body: any, options: FetchOptions = {}) => 
        fetchData<T>(endpoint, 'POST', body, options),
    put: <T = any>(endpoint: string, body: any, options: FetchOptions = {}) => 
        fetchData<T>(endpoint, 'PUT', body, options),
    delete: <T = any>(endpoint: string, options: FetchOptions = {}) => 
        fetchData<T>(endpoint, 'DELETE', null, options),
};

export const authAPI = {
    login: (credentials: { email: string; password: string }) => 
        api.post('/auth/login', credentials),
    register: (userData: any) => 
        api.post('/auth/register', userData),
    updateProfile: (profileData: any) => 
        api.put('/auth/profile', profileData),
    changePassword: (passwordData: { oldPassword: string; newPassword: string }) => 
        api.put('/auth/change-password', passwordData),
    logout: () => 
        api.post('/auth/logout', {}),
    refreshToken: () => 
        api.post('/auth/refresh', {}),
    verifyToken: () => 
        api.get('/auth/verify'),
};
