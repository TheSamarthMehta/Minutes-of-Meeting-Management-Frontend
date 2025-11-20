import { api } from '../shared/utils/api';

export interface AttendanceRecord {
  _id: string;
  meetingId: string;
  staffId: {
    _id: string;
    staffName: string;
    emailAddress?: string;
    mobileNo?: string;
    designation?: string;
  };
  isPresent: boolean;
  remarks?: string;
  created: string;
  modified: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  attendancePercentage: number;
}

export interface BulkAttendanceUpdate {
  memberId: string;
  isPresent: boolean;
  remarks?: string;
}

class AttendanceService {
  /**
   * Get all participants for a specific meeting
   */
  async getMeetingParticipants(meetingId: string): Promise<AttendanceRecord[]> {
    const response = await api.get(`/meetings/${meetingId}/members`);
    return response.data || [];
  }

  /**
   * Get attendance statistics for a meeting
   */
  async getAttendanceStats(meetingId: string): Promise<AttendanceStats> {
    const response = await api.get(`/meetings/${meetingId}/attendance`);
    return response.data;
  }

  /**
   * Add a single participant to a meeting
   */
  async addParticipant(meetingId: string, staffId: string, isPresent: boolean = false): Promise<AttendanceRecord> {
    const response = await api.post(`/meetings/${meetingId}/members`, {
      staffId,
      isPresent,
    });
    return response.data;
  }

  /**
   * Add multiple participants to a meeting (bulk add)
   */
  async addMultipleParticipants(meetingId: string, staffIds: string[]): Promise<AttendanceRecord[]> {
    const response = await api.post(`/meetings/${meetingId}/members/bulk`, {
      staffIds,
    });
    return response.data;
  }

  /**
   * Mark attendance for a single participant
   */
  async markAttendance(memberId: string, isPresent: boolean, remarks?: string): Promise<AttendanceRecord> {
    const response = await api.put(`/meeting-members/${memberId}/attendance`, {
      isPresent,
      remarks,
    });
    return response.data;
  }

  /**
   * Update participant details (attendance and remarks)
   */
  async updateParticipant(memberId: string, data: { isPresent?: boolean; remarks?: string }): Promise<AttendanceRecord> {
    const response = await api.put(`/meeting-members/${memberId}`, data);
    return response.data;
  }

  /**
   * Remove a participant from a meeting
   */
  async removeParticipant(memberId: string): Promise<void> {
    await api.delete(`/meeting-members/${memberId}`);
  }

  /**
   * Toggle attendance status for a participant
   */
  async toggleAttendance(memberId: string, currentStatus: boolean): Promise<AttendanceRecord> {
    return this.markAttendance(memberId, !currentStatus);
  }

  /**
   * Mark all participants as present
   */
  async markAllPresent(meetingId: string, participants: AttendanceRecord[]): Promise<void> {
    const updates = participants
      .filter(p => !p.isPresent)
      .map(p => this.markAttendance(p._id, true));
    
    await Promise.all(updates);
  }

  /**
   * Mark all participants as absent
   */
  async markAllAbsent(meetingId: string, participants: AttendanceRecord[]): Promise<void> {
    const updates = participants
      .filter(p => p.isPresent)
      .map(p => this.markAttendance(p._id, false));
    
    await Promise.all(updates);
  }

  /**
   * Get participant by ID
   */
  async getParticipantById(memberId: string): Promise<AttendanceRecord> {
    const response = await api.get(`/meeting-members/${memberId}`);
    return response.data;
  }

  /**
   * Search participants by name
   */
  searchParticipants(participants: AttendanceRecord[], searchTerm: string): AttendanceRecord[] {
    if (!searchTerm) return participants;
    
    const term = searchTerm.toLowerCase();
    return participants.filter(p => 
      p.staffId.staffName.toLowerCase().includes(term) ||
      p.staffId.emailAddress?.toLowerCase().includes(term) ||
      p.staffId.designation?.toLowerCase().includes(term)
    );
  }

  /**
   * Filter participants by attendance status
   */
  filterByStatus(participants: AttendanceRecord[], status: 'all' | 'present' | 'absent'): AttendanceRecord[] {
    if (status === 'all') return participants;
    return participants.filter(p => status === 'present' ? p.isPresent : !p.isPresent);
  }

  /**
   * Sort participants
   */
  sortParticipants(participants: AttendanceRecord[], sortBy: 'name' | 'status'): AttendanceRecord[] {
    return [...participants].sort((a, b) => {
      if (sortBy === 'name') {
        return a.staffId.staffName.localeCompare(b.staffId.staffName);
      } else {
        // Sort by status (present first)
        if (a.isPresent === b.isPresent) return 0;
        return a.isPresent ? -1 : 1;
      }
    });
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
