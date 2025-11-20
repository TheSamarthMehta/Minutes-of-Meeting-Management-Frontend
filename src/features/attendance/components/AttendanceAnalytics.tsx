import React from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, Award, AlertTriangle } from 'lucide-react';

interface AttendanceAnalyticsProps {
  stats: {
    total: number;
    present: number;
    absent: number;
    attendancePercentage: number;
  };
  participants: any[];
  meetingTitle?: string;
}

export const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({
  stats,
  participants,
  meetingTitle
}) => {
  // Calculate additional metrics
  const attendanceRate = stats.attendancePercentage;
  const absenteeRate = 100 - attendanceRate;
  
  // Determine attendance health
  const getAttendanceHealth = () => {
    if (attendanceRate >= 90) return { status: 'Excellent', color: 'green', icon: Award };
    if (attendanceRate >= 75) return { status: 'Good', color: 'teal', icon: TrendingUp };
    if (attendanceRate >= 50) return { status: 'Fair', color: 'yellow', icon: AlertTriangle };
    return { status: 'Poor', color: 'red', icon: TrendingDown };
  };

  const health = getAttendanceHealth();
  const HealthIcon = health.icon;

  // Top attendees (for gamification)
  const topAttendees = participants
    .filter(p => p.isPresent)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Attendance Health Card */}
      <div className={`bg-gradient-to-br from-${health.color}-50 to-${health.color}-100 rounded-xl border-2 border-${health.color}-200 p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Attendance Health</p>
            <h3 className="text-3xl font-bold text-gray-900">{health.status}</h3>
            <p className="text-sm text-gray-600 mt-2">
              {attendanceRate >= 90 && 'Outstanding participation! Keep it up.'}
              {attendanceRate >= 75 && attendanceRate < 90 && 'Good attendance rate overall.'}
              {attendanceRate >= 50 && attendanceRate < 75 && 'Room for improvement in attendance.'}
              {attendanceRate < 50 && 'Low attendance detected. Consider follow-ups.'}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-full bg-${health.color}-200 flex items-center justify-center`}>
            <HealthIcon className={`h-8 w-8 text-${health.color}-700`} />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Attendance Rate</p>
              <p className="text-xl font-bold text-gray-900">{attendanceRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Absentee Rate</p>
              <p className="text-xl font-bold text-gray-900">{absenteeRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Attendance Breakdown</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Present</span>
              <span className="font-semibold text-green-600">{stats.present} ({attendanceRate.toFixed(0)}%)</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Absent</span>
              <span className="font-semibold text-red-600">{stats.absent} ({absenteeRate.toFixed(0)}%)</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                style={{ width: `${absenteeRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Present Participants List */}
      {topAttendees.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-teal-600" />
            <h4 className="text-sm font-semibold text-gray-700">Present Participants</h4>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {stats.present}
            </span>
          </div>
          <div className="space-y-2">
            {topAttendees.map((participant: any, index: number) => (
              <div 
                key={participant._id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                  {participant.staffId?.staffName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{participant.staffId?.staffName}</p>
                  <p className="text-xs text-gray-500">{participant.staffId?.designation || 'Staff'}</p>
                </div>
              </div>
            ))}
            {stats.present > 5 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                + {stats.present - 5} more present
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {attendanceRate < 75 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900 mb-1">Recommendations</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Send reminder notifications to absent members</li>
                <li>• Consider rescheduling if attendance is critical</li>
                <li>• Follow up with absent participants for feedback</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceAnalytics;
