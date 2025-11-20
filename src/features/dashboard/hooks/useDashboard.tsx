import { useState, useCallback, useEffect, useMemo } from 'react';
import { dashboardService, DashboardData, AnalyticsData } from '../../../api/dashboardService';
import { handleApiError } from '../../../shared/utils/errorHandler';

export const useDashboard = () => {
  // State management
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch dashboard overview data
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getOverview();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(handleApiError(err) || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  /**
   * Fetch analytics data for selected period
   */
  const fetchAnalytics = useCallback(async (period: '7d' | '30d' | '90d' | '1y') => {
    try {
      setAnalyticsLoading(true);
      const data = await dashboardService.getAnalytics(period);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  /**
   * Change analytics period
   */
  const changePeriod = useCallback((period: '7d' | '30d' | '90d' | '1y') => {
    setSelectedPeriod(period);
    fetchAnalytics(period);
  }, [fetchAnalytics]);

  /**
   * Refresh all dashboard data
   */
  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchAnalytics(selectedPeriod)
    ]);
  }, [fetchDashboardData, fetchAnalytics, selectedPeriod]);

  /**
   * Calculate dashboard metrics
   */
  const metrics = useMemo(() => {
    if (!dashboardData) return null;
    return dashboardService.calculateMetrics(dashboardData);
  }, [dashboardData]);

  /**
   * Get health status
   */
  const healthStatus = useMemo(() => {
    if (!metrics) return null;
    return dashboardService.getHealthStatus(metrics);
  }, [metrics]);

  /**
   * Get alerts and notifications
   */
  const alerts = useMemo(() => {
    if (!dashboardData || !metrics) return [];
    return dashboardService.getAlerts(dashboardData, metrics);
  }, [dashboardData, metrics]);

  /**
   * Get top performers
   */
  const topPerformers = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardService.getTopPerformers(dashboardData.activeStaff, 5);
  }, [dashboardData]);

  /**
   * Format chart data
   */
  const chartData = useMemo(() => {
    if (!analyticsData) return { trends: [], statusPie: [] };
    
    return {
      trends: dashboardService.formatTrendChartData(analyticsData.meetingTrends),
      statusPie: dashboardData 
        ? dashboardService.formatStatusPieData(dashboardData.meetingStatusStats)
        : []
    };
  }, [analyticsData, dashboardData]);

  // Load initial data
  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics(selectedPeriod);
  }, [fetchDashboardData, fetchAnalytics, selectedPeriod]);

  return {
    // Data
    dashboardData,
    analyticsData,
    metrics,
    healthStatus,
    alerts,
    topPerformers,
    chartData,
    selectedPeriod,
    
    // Computed values
    overview: dashboardData?.overview || null,
    recentMeetings: dashboardData?.recentMeetings || [],
    meetingStatusStats: dashboardData?.meetingStatusStats || [],
    attendanceStats: dashboardData?.attendanceStats || null,
    activeStaff: dashboardData?.activeStaff || [],
    meetingTypeUsage: dashboardData?.meetingTypeUsage || [],
    
    // Loading states
    loading,
    initialLoading,
    analyticsLoading,
    error,
    
    // Actions
    refetch: refreshDashboard,
    changePeriod,
    clearError: () => setError(null),
  };
};

export default useDashboard;

