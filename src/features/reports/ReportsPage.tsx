import React, { useState } from "react";
import { 
  FileText, TrendingUp, XCircle, Download, Calendar, ChevronLeft, ChevronRight,
  BarChart3, Users, Clock, CheckCircle, AlertCircle, Filter, Search,
  FileSpreadsheet, FileDown, Eye, RefreshCw
} from "lucide-react";
import { useReports } from './hooks/useReports';

const ReportsPage = () => {
  const {
    reportType,
    dateRange,
    weekOffset,
    loading,
    error,
    summaryData,
    selectedMeetingId,
    selectedMeetingMembers,
    attendanceData,
    cancelledMeetings,
    setReportType,
    setSelectedMeetingId,
    navigateWeek,
    goToCurrentWeek,
    handleDateRangeChange,
    generateReport,
    loadSelectedMeetingAttendance,
    handleExportExcel,
    handleExportPdf,
  } = useReports();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const reportCards = [
    { title: "Meeting Summary Report", icon: FileText, description: "Overview of all meetings with key metrics", type: "summary", color: "blue" },
    { title: "Attendance Report", icon: TrendingUp, description: "Meeting-wise attendance analysis", type: "attendance", color: "green" },
    { title: "Cancelled Meeting Report", icon: XCircle, description: "List of all cancelled meetings", type: "cancelled", color: "red" },
    { title: "Export Reports", icon: Download, description: "Export data to Excel or PDF", type: "export", color: "purple" },
  ];

  // Filter summary data
  const filteredSummaryData = summaryData.filter((item: any) => {
    const matchesSearch = item.meeting?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Generate comprehensive meeting reports and export data</p>
            </div>
          </div>
        </div>

        {/* Report Type Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCards.map((card) => {
            const colorClasses = {
              blue: {
                active: 'from-blue-500 to-blue-600',
                inactive: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20',
                icon: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-200 dark:border-blue-800'
              },
              green: {
                active: 'from-green-500 to-green-600',
                inactive: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20',
                icon: 'text-green-600 dark:text-green-400',
                border: 'border-green-200 dark:border-green-800'
              },
              red: {
                active: 'from-red-500 to-red-600',
                inactive: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20',
                icon: 'text-red-600 dark:text-red-400',
                border: 'border-red-200 dark:border-red-800'
              },
              purple: {
                active: 'from-purple-500 to-purple-600',
                inactive: 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20',
                icon: 'text-purple-600 dark:text-purple-400',
                border: 'border-purple-200 dark:border-purple-800'
              }
            };
            const colors = colorClasses[card.color] || colorClasses.blue;
            
            return (
              <button
                key={card.type}
                onClick={() => setReportType(card.type)}
                className={`p-6 rounded-xl text-left transition-all border-2 ${
                  reportType === card.type
                    ? `bg-gradient-to-br ${colors.active} text-white shadow-lg scale-105`
                    : `bg-gradient-to-br ${colors.inactive} ${colors.border} hover:shadow-md hover:scale-102`
                }`}
              >
                <card.icon size={32} className={reportType === card.type ? "text-white" : colors.icon} />
                <h3 className={`font-bold mt-4 text-lg ${reportType === card.type ? "text-white" : "text-gray-800 dark:text-white"}`}>
                  {card.title}
                </h3>
                <p className={`text-sm mt-2 ${reportType === card.type ? "text-white/90" : "text-gray-600 dark:text-gray-400"}`}>
                  {card.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col gap-4">
            {/* Week Navigation */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Week Navigation:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Previous Week"
                >
                  <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={goToCurrentWeek}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    weekOffset === 0
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Current Week
                </button>
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Next Week"
                >
                  <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  {weekOffset === 0 ? 'This Week' : weekOffset < 0 ? `${Math.abs(weekOffset)} Week${Math.abs(weekOffset) > 1 ? 's' : ''} Ago` : `Next ${weekOffset} Week${weekOffset > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            {/* Date Range Display */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">From:</label>
                </div>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateRangeChange(e.target.value, null)}
                  className="px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer shadow-sm"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <label className="text-sm font-semibold text-purple-700 dark:text-purple-300">To:</label>
                </div>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateRangeChange(null, e.target.value)}
                  className="px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer shadow-sm"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
              <button 
                onClick={generateReport}
                disabled={loading || !dateRange.from || !dateRange.to}
                className={`px-6 py-2 rounded-lg font-semibold ml-auto flex items-center gap-2 transition-all ${
                  loading || !dateRange.from || !dateRange.to
                    ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Meeting Summary Report */}
        {reportType === "summary" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Meeting Summary Report
                </h2>
                {/* Search and Filter */}
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search meetings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="All">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 dark:border-blue-400 mb-4"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading summary data...</span>
              </div>
            ) : (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase w-12">Select</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Meeting</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Participants</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredSummaryData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                              {searchQuery || statusFilter !== "All" 
                                ? "No meetings match your filters"
                                : "No meetings found for the selected date range"}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredSummaryData.map((row: any, idx: number) => (
                          <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedMeetingId === row._id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                            <td className="px-6 py-4">
                              <input 
                                type="radio" 
                                name="selectedMeeting" 
                                checked={selectedMeetingId === row._id} 
                                onChange={() => setSelectedMeetingId(row._id)} 
                                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.meeting}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {row.date}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {row.participants}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {row.duration}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                row.status === "Completed" 
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                                  : row.status === "Cancelled" 
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" 
                                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                              }`}>
                                {row.status === "Completed" && <CheckCircle className="h-3 w-3" />}
                                {row.status === "Cancelled" && <XCircle className="h-3 w-3" />}
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {filteredSummaryData.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredSummaryData.length} of {summaryData.length} meeting(s)
                      </p>
                      <button 
                        onClick={loadSelectedMeetingAttendance} 
                        disabled={!selectedMeetingId || loading} 
                        className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                          !selectedMeetingId || loading 
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                        }`}
                      >
                        <Eye className="h-4 w-4" />
                        {loading ? 'Loading...' : 'View Attendance Details'}
                      </button>
                    </div>
                  )}
                </div>

                {selectedMeetingId && (
                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      Attendance Details
                    </h3>
                    {selectedMeetingMembers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No members found for this meeting or not loaded yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Email</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Role</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Attendance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {selectedMeetingMembers.map((m: any) => (
                              <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{m.staffId?.staffName || 'N/A'}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{m.staffId?.emailAddress || 'N/A'}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{m.role || m.staffId?.role || 'N/A'}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                    m.isPresent 
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  }`}>
                                    {m.isPresent ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    {m.isPresent ? 'Present' : 'Absent'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      )}

        {/* Attendance Report */}
        {reportType === "attendance" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                Attendance Report Meeting Wise
              </h2>
            </div>
            {loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 dark:border-green-400 mb-4"></div>
                <span className="text-gray-600 dark:text-gray-400">Calculating attendance data...</span>
              </div>
            ) : (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Participant</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Total Meetings</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Attended</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Absent</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {attendanceData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                              No attendance data found for the selected date range
                            </p>
                          </td>
                        </tr>
                      ) : (
                        attendanceData.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.name}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.totalMeetings}</td>
                            <td className="px-6 py-4 text-green-600 dark:text-green-400 font-semibold">{row.attended}</td>
                            <td className="px-6 py-4 text-red-600 dark:text-red-400 font-semibold">{row.absent}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all"
                                    style={{ width: row.percentage }}
                                  ></div>
                                </div>
                                <span className="text-gray-800 dark:text-gray-200 font-bold min-w-[60px] text-right">{row.percentage}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancelled Meetings Report */}
        {reportType === "cancelled" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                Cancelled Meeting Report
              </h2>
            </div>
            {loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 dark:border-red-400 mb-4"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading cancelled meetings...</span>
              </div>
            ) : (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Meeting</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Scheduled Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Cancelled By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {cancelledMeetings.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <XCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                              No cancelled meetings found for the selected date range
                            </p>
                          </td>
                        </tr>
                      ) : (
                        cancelledMeetings.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.meeting}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {row.scheduledDate}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.reason || 'No reason provided'}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.cancelledBy || 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Section */}
        {reportType === "export" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                Export Reports
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Download your reports in your preferred format</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Export to Excel</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Download report data in Excel format (.xlsx)</p>
                <button 
                  onClick={handleExportExcel}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 shadow-lg transition-all flex items-center gap-2 mx-auto"
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  Download Excel
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileDown size={32} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Export to PDF</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Download report data in PDF format</p>
                <button 
                  onClick={handleExportPdf}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 shadow-lg transition-all flex items-center gap-2 mx-auto"
                >
                  <FileDown className="h-5 w-5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;