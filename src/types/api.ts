// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  mobileNo?: string;
  role: 'user' | 'admin' | 'staff' | 'Admin' | 'Convener' | 'Staff';
  isActive: boolean;
  lastLogin?: Date | null;
  created: Date;
  modified: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  mobileNo?: string;
}

// Meeting Type
export interface MeetingType {
  _id: string;
  meetingTypeName: string;
  remarks?: string;
  created: Date;
  modified: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Staff types
export interface Staff {
  _id: string;
  staffName: string;
  mobileNo?: string;
  emailAddress?: string;
  role: 'Admin' | 'Convener' | 'Staff';
  department?: string;
  remarks?: string;
  created: Date;
  modified: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Meeting types
export interface Meeting {
  _id: string;
  meetingDate: Date | string;
  meetingTime: Date | string;
  meetingTypeId: string | MeetingType;
  meetingTitle: string;
  meetingDescription?: string;
  documentPath?: string;
  remarks?: string;
  cancellationDateTime?: Date | null;
  cancellationReason?: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
  created: Date;
  modified: Date;
  createdAt?: Date;
  updatedAt?: Date;
  members?: MeetingMember[];
  documents?: MeetingDocument[];
}

export interface MeetingFormData {
  meetingDate: string;
  meetingTime: string;
  meetingTypeId: string;
  meetingTitle: string;
  meetingDescription?: string;
  remarks?: string;
}

// Meeting Member types
export interface MeetingMember {
  _id: string;
  meetingId: string | Meeting;
  staffId: string | Staff;
  isPresent: boolean;
  remarks?: string;
  created: Date;
  modified: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceCount {
  total: number;
  present: number;
  absent: number;
}

// Meeting Document types
export interface MeetingDocument {
  _id: string;
  meetingId: string | Meeting;
  documentName: string;
  documentPath?: string;
  sequence: number;
  remarks?: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy?: string | Staff;
  created: Date;
  modified: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Dashboard types
export interface DashboardStats {
  totalMeetings: number;
  upcomingMeetings: number;
  completedMeetings: number;
  cancelledMeetings: number;
  totalStaff: number;
  activeMeetingTypes: number;
  recentMeetings?: Meeting[];
  upcomingMeetingsList?: Meeting[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form state types
export interface FormErrors {
  [key: string]: string;
}

// Select option type (for dropdowns)
export interface SelectOption {
  value: string | number;
  label: string;
}

// File upload types
export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  path: string;
}
