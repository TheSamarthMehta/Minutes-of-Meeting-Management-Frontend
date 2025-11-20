import { api } from '../shared/utils/api';

export interface DashboardOverview {
  totalMeetings: number;
  totalStaff: number;
  totalMeetingTypes: number;
  totalDocuments: number;
  meetingsThisMonth: number;
  meetingsThisWeek: number;
  upcomingMeetings: number;
  completedMeetings?: number;
  cancelledMeetings?: number;
  scheduledMeetings?: number;
}

export interface MeetingStatusStats {
  _id: string;
  count: number;
}

export interface AttendanceStats {
  totalMembers: number;
  presentMembers: number;
  attendanceRate?: number;
}

export interface ActiveStaff {
  _id: string;
  staffName: string;
  emailAddress: string;
  meetingCount: number;
  attendanceCount: number;
  attendanceRate: number;
}

export interface MeetingTypeUsage {
  _id: string;
  meetingTypeName: string;
  count: number;
}

export interface RecentMeeting {
  _id: string;
  meetingTitle: string;
  meetingDate: string;
  meetingTime?: string;
  meetingStatus: string;
  meetingType?: any;
  location?: string;
}

export interface MeetingTrend {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  count: number;
  completed: number;
  cancelled: number;
}

export interface StaffPerformance {
  _id: string;
  staffName: string;
  emailAddress: string;
  mobileNo?: string;
  totalMeetings: number;
  attendedMeetings: number;
  missedMeetings: number;
  attendanceRate: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  meetingStatusStats: MeetingStatusStats[];
  attendanceStats: AttendanceStats;
  activeStaff: ActiveStaff[];
  meetingTypeUsage: MeetingTypeUsage[];
  recentMeetings: RecentMeeting[];
}

export interface AnalyticsData {
  period: string;
  startDate: Date;
  endDate: Date;
  meetingTrends: MeetingTrend[];
  attendanceAnalytics: any[];
  avgAttendanceRate: number;
}

class DashboardService {
  /**
   * Get complete dashboard overview with all statistics
   */
  async getOverview(): Promise<DashboardData> {
    const response = await api.get('/dashboard/overview');
    return response.data;
  }

  /**
   * Get meeting analytics for a specific period
   */
  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    const response = await api.get('/dashboard/analytics', {
      params: { period }
    });
    return response.data;
  }

  /**
   * Get staff performance report
   */
  async getStaffPerformance(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    period: string;
    startDate: Date;
    endDate: Date;
    staffPerformance: StaffPerformance[];
  }> {
    const response = await api.get('/dashboard/staff-performance', {
      params: { period }
    });
    return response.data;
  }

  /**
   * Get meeting type analytics
   */
  async getMeetingTypeAnalytics(): Promise<any[]> {
    const response = await api.get('/dashboard/meeting-types');
    return response.data;
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<{
    recentMeetings: RecentMeeting[];
    recentStaff: any[];
    recentDocuments: any[];
  }> {
    const response = await api.get('/dashboard/recent-activity', {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Calculate dashboard metrics
   */
  calculateMetrics(data: DashboardData) {
    const { overview, attendanceStats, meetingStatusStats } = data;
    
    // Calculate completion rate
    const completedMeeting = meetingStatusStats.find(s => s._id === 'Completed');
    const completionRate = overview.totalMeetings > 0
      ? ((completedMeeting?.count || 0) / overview.totalMeetings) * 100
      : 0;

    // Calculate attendance rate
    const attendanceRate = attendanceStats.totalMembers > 0
      ? (attendanceStats.presentMembers / attendanceStats.totalMembers) * 100
      : 0;

    // Calculate activity score (0-100)
    const activityScore = Math.min(100, 
      (overview.meetingsThisWeek * 10) + 
      (attendanceRate * 0.3) + 
      (completionRate * 0.2)
    );

    return {
      completionRate: parseFloat(completionRate.toFixed(2)),
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      activityScore: parseFloat(activityScore.toFixed(2)),
      growthRate: this.calculateGrowthRate(overview)
    };
  }

  /**
   * Calculate growth rate based on meetings
   */
  private calculateGrowthRate(overview: DashboardOverview): number {
    if (overview.meetingsThisMonth === 0) return 0;
    
    const weeklyAverage = overview.meetingsThisWeek;
    const monthlyProjection = weeklyAverage * 4;
    const currentMonthly = overview.meetingsThisMonth;
    
    if (currentMonthly === 0) return 0;
    
    const growth = ((monthlyProjection - currentMonthly) / currentMonthly) * 100;
    return parseFloat(growth.toFixed(2));
  }

  /**
   * Get health status based on metrics
   */
  getHealthStatus(metrics: ReturnType<typeof this.calculateMetrics>): {
    status: 'excellent' | 'good' | 'fair' | 'poor';
    color: string;
    message: string;
  } {
    const score = metrics.activityScore;
    
    if (score >= 80) {
      return {
        status: 'excellent',
        color: 'green',
        message: 'Your organization is highly active and efficient!'
      };
    } else if (score >= 60) {
      return {
        status: 'good',
        color: 'teal',
        message: 'Good performance with room for improvement.'
      };
    } else if (score >= 40) {
      return {
        status: 'fair',
        color: 'yellow',
        message: 'Consider increasing meeting activity and attendance.'
      };
    } else {
      return {
        status: 'poor',
        color: 'red',
        message: 'Low activity detected. Review your meeting processes.'
      };
    }
  }

  /**
   * Format chart data for meeting trends
   */
  formatTrendChartData(trends: MeetingTrend[]) {
    return trends.map(trend => ({
      date: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`,
      total: trend.count,
      completed: trend.completed,
      cancelled: trend.cancelled,
      scheduled: trend.count - trend.completed - trend.cancelled
    }));
  }

  /**
   * Format pie chart data for meeting status
   */
  formatStatusPieData(statusStats: MeetingStatusStats[]) {
    return statusStats.map(stat => ({
      name: stat._id,
      value: stat.count,
      color: this.getStatusColor(stat._id)
    }));
  }

  /**
   * Get color for meeting status
   */
  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Scheduled': '#14b8a6',
      'Completed': '#22c55e',
      'Cancelled': '#ef4444',
      'In Progress': '#f59e0b'
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Get top performers
   */
  getTopPerformers(staff: ActiveStaff[], limit: number = 5) {
    return staff
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, limit);
  }

  /**
   * Get alerts and notifications based on data
   */
  getAlerts(data: DashboardData, metrics: ReturnType<typeof this.calculateMetrics>) {
    const alerts: Array<{
      type: 'info' | 'warning' | 'error' | 'success';
      title: string;
      message: string;
    }> = [];

    if (data.overview.upcomingMeetings === 0) {
      alerts.push({
        type: 'warning',
        title: 'No Upcoming Meetings',
        message: 'You have no scheduled meetings coming up.'
      });
    }

    if (metrics.attendanceRate < 70) {
      alerts.push({
        type: 'warning',
        title: 'Low Attendance Rate',
        message: `Current attendance rate is ${metrics.attendanceRate}%. Consider sending reminders.`
      });
    }

    if (metrics.completionRate < 60) {
      alerts.push({
        type: 'error',
        title: 'Low Completion Rate',
        message: `Only ${metrics.completionRate}% of meetings are completed. Review meeting outcomes.`
      });
    }

    if (metrics.activityScore >= 80) {
      alerts.push({
        type: 'success',
        title: 'Excellent Performance',
        message: 'Your organization is performing exceptionally well!'
      });
    }

    return alerts;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
