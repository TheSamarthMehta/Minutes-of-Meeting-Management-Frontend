import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Activity,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useDashboard } from "./hooks/useDashboard";
import StatCard from "./components/StatCard";
import { HealthCard } from "./components/HealthCard";
import { AlertsPanel } from "./components/AlertsPanel";
import { TopPerformers } from "./components/TopPerformers";
import { MeetingTypeChart } from "./components/MeetingTypeChart";
import { RecentMeetingsList } from "./components/RecentMeetingsList";

const DashboardPage = () => {
  const {
    overview,
    recentMeetings,
    metrics,
    healthStatus,
    alerts,
    topPerformers,
    meetingTypeUsage,
    attendanceStats,
    loading,
    initialLoading,
    error,
    refetch,
    clearError,
    selectedPeriod,
    changePeriod
  } = useDashboard();

  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Load dismissed alerts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dismissedAlerts');
    if (stored) {
      try {
        setDismissedAlerts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse dismissed alerts:', e);
      }
    }
  }, []);

  const handleDismissAlert = (index: number) => {
    const alert = alerts[index];
    if (alert) {
      const alertId = `${alert.type}-${alert.title}`;
      const newDismissed = [...dismissedAlerts, alertId];
      setDismissedAlerts(newDismissed);
      localStorage.setItem('dismissedAlerts', JSON.stringify(newDismissed));
    }
  };

  const visibleAlerts = alerts.filter((alert) => {
    const alertId = `${alert.type}-${alert.title}`;
    return !dismissedAlerts.includes(alertId);
  });

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Loading Progress Bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-progress"></div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 ml-15">
                Welcome back! Here's your meeting overview and performance insights
              </p>
            </div>
            {/* Period Selector */}
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => changePeriod(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium shadow-sm hover:border-teal-400 dark:hover:border-teal-500 transition-all cursor-pointer"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Alerts Panel */}
        {visibleAlerts.length > 0 && (
          <AlertsPanel alerts={visibleAlerts} onDismiss={handleDismissAlert} />
        )}

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Meetings"
            value={overview?.totalMeetings || 0}
            icon={Calendar}
            subtitle={`${overview?.meetingsThisMonth || 0} this month`}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={overview?.completedMeetings || 0}
            icon={CheckCircle}
            subtitle={`${metrics?.completionRate || 0}% completion rate`}
            color="green"
          />
          <StatCard
            title="Upcoming"
            value={overview?.upcomingMeetings || 0}
            icon={Clock}
            subtitle={`${overview?.scheduledMeetings || 0} scheduled`}
            color="teal"
          />
          <StatCard
            title="Cancelled"
            value={overview?.cancelledMeetings || 0}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Staff"
            value={overview?.totalStaff || 0}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Meeting Types"
            value={overview?.totalMeetingTypes || 0}
            icon={BarChart3}
            color="teal"
          />
          <StatCard
            title="Documents"
            value={overview?.totalDocuments || 0}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Attendance Rate"
            value={`${metrics?.attendanceRate || 0}%`}
            icon={TrendingUp}
            subtitle={`${attendanceStats?.presentMembers || 0}/${attendanceStats?.totalMembers || 0} present`}
            color="green"
          />
        </div>

        {/* Health Status */}
        {healthStatus && metrics && (
          <HealthCard
            status={healthStatus.status}
            score={metrics.activityScore}
            message={healthStatus.message}
          />
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <TopPerformers performers={topPerformers} />

          {/* Meeting Types Distribution */}
          <MeetingTypeChart data={meetingTypeUsage} />
        </div>

        {/* Recent Meetings */}
        <RecentMeetingsList
          meetings={recentMeetings}
          onMeetingClick={(meeting) => {
            console.log('Meeting clicked:', meeting);
            // Navigate to meeting details
          }}
        />

        {/* Quick Stats Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview?.meetingsThisWeek || 0} meetings
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview?.meetingsThisMonth || 0} meetings
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics?.completionRate || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-teal-100 text-sm mb-1">Activity Score</p>
              <p className="text-3xl font-bold">{metrics?.activityScore || 0}/100</p>
            </div>
            <div>
              <p className="text-teal-100 text-sm mb-1">Attendance Rate</p>
              <p className="text-3xl font-bold">{metrics?.attendanceRate || 0}%</p>
            </div>
            <div>
              <p className="text-teal-100 text-sm mb-1">Completion Rate</p>
              <p className="text-3xl font-bold">{metrics?.completionRate || 0}%</p>
            </div>
            <div>
              <p className="text-teal-100 text-sm mb-1">Growth Rate</p>
              <p className="text-3xl font-bold">
                {metrics?.growthRate ? `${metrics.growthRate > 0 ? '+' : ''}${metrics.growthRate}%` : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
