import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Calendar, Clock, MapPin, Users, Timer, Zap, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { Meeting, MeetingFormData, MeetingType } from '../../../api/meetingService';

interface MeetingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MeetingFormData) => Promise<void>;
  meeting?: Meeting | null;
  meetingTypes?: MeetingType[];
  title: string;
}

// Smart suggestion helpers
const DURATION_PRESETS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
];

const COMMON_LOCATIONS = [
  'Conference Room A',
  'Conference Room B',
  'Board Room',
  'Meeting Room 1',
  'Meeting Room 2',
  'Virtual (Zoom)',
  'Virtual (Teams)',
  'Virtual (Google Meet)',
];

const getNextBusinessDay = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  // Skip weekends
  if (date.getDay() === 0) date.setDate(date.getDate() + 1); // Sunday to Monday
  if (date.getDay() === 6) date.setDate(date.getDate() + 2); // Saturday to Monday
  return date.toISOString().split('T')[0];
};

const getNextWeek = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};

const getCommonMeetingTime = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

const getMeetingAgendaTemplate = (typeName: string): string => {
  const templates: Record<string, string> = {
    'Board Meeting': '1. Opening Remarks\n2. Review of Previous Minutes\n3. Financial Report\n4. Committee Reports\n5. New Business\n6. Any Other Business\n7. Adjournment',
    'Team Meeting': '1. Team Updates\n2. Project Progress\n3. Challenges and Solutions\n4. Action Items\n5. Next Steps',
    'Planning Session': '1. Objectives Review\n2. Current Status\n3. Strategy Discussion\n4. Resource Allocation\n5. Timeline and Milestones',
    'Review Meeting': '1. Performance Review\n2. Achievements\n3. Areas for Improvement\n4. Feedback Discussion\n5. Goals Setting',
    'General': '1. Welcome and Introduction\n2. Main Discussion Points\n3. Questions and Answers\n4. Action Items\n5. Closing Remarks'
  };
  return templates[typeName] || templates['General'];
};

export const MeetingFormModal: React.FC<MeetingFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  meeting,
  meetingTypes = [],
  title
}) => {
  const [formData, setFormData] = useState<MeetingFormData>({
    meetingTitle: '',
    meetingDescription: '',
    meetingTypeId: '',
    meetingDate: '',
    meetingTime: '',
    duration: 60,
    location: '',
    agenda: '',
    status: 'Scheduled'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // ESC key to close modal
      if (e.key === 'Escape' && !loading) {
        onClose();
      }

      // Ctrl/Cmd + Enter to submit form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading) {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, loading]);

  useEffect(() => {
    if (meeting) {
      const typeId = typeof meeting.meetingTypeId === 'string' 
        ? meeting.meetingTypeId 
        : meeting.meetingTypeId?._id || '';
        
      setFormData({
        meetingTitle: meeting.meetingTitle || '',
        meetingDescription: meeting.meetingDescription || '',
        meetingTypeId: typeId,
        meetingDate: meeting.meetingDate ? meeting.meetingDate.split('T')[0] : '',
        meetingTime: meeting.meetingTime || '',
        duration: meeting.duration || 60,
        location: meeting.location || '',
        agenda: meeting.agenda || '',
        status: meeting.status || 'Scheduled'
      });
    } else {
      setFormData({
        meetingTitle: '',
        meetingDescription: '',
        meetingTypeId: (meetingTypes && meetingTypes.length > 0) ? meetingTypes[0]._id : '',
        meetingDate: '',
        meetingTime: '',
        duration: 60,
        location: '',
        agenda: '',
        status: 'Scheduled'
      });
    }
    setErrors({});
  }, [meeting, meetingTypes, isOpen]);

  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes < 60) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `(${hours} ${hours === 1 ? 'hour' : 'hours'})`;
    }
    return `(${hours}h ${mins}m)`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Smart validations and warnings
    if (name === 'meetingDate') {
      validateDateWarnings(value);
    }
    if (name === 'meetingTime') {
      validateTimeWarnings(value);
    }
    if (name === 'meetingTypeId') {
      const selectedType = meetingTypes && meetingTypes.find(t => t._id === value);
      if (selectedType && !meeting) {
        // Auto-suggest agenda template
        if (!formData.agenda) {
          setFormData(prev => ({
            ...prev,
            [name]: value,
            agenda: getMeetingAgendaTemplate(selectedType.meetingTypeName)
          }));
        }
      }
    }
  };

  const validateDateWarnings = (dateStr: string) => {
    const newWarnings: string[] = [];
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if past date
    if (selectedDate < today) {
      newWarnings.push('⚠️ Meeting date is in the past');
    }

    // Check if weekend
    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      newWarnings.push('📅 Meeting scheduled on weekend');
    }

    setWarnings(newWarnings);
  };

  const validateTimeWarnings = (timeStr: string) => {
    if (!timeStr) return;
    const [hours] = timeStr.split(':').map(Number);
    const newWarnings: string[] = [...warnings];

    // Check business hours
    if (hours < 8 || hours >= 18) {
      if (!newWarnings.includes('🕐 Meeting scheduled outside business hours (8 AM - 6 PM)')) {
        newWarnings.push('🕐 Meeting scheduled outside business hours (8 AM - 6 PM)');
      }
    }

    setWarnings(newWarnings);
  };

  const applyQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek' | 'nextBusinessDay') => {
    const date = new Date();
    switch (type) {
      case 'today':
        break;
      case 'tomorrow':
        date.setDate(date.getDate() + 1);
        break;
      case 'nextWeek':
        date.setDate(date.getDate() + 7);
        break;
      case 'nextBusinessDay':
        date.setDate(date.getDate() + 1);
        if (date.getDay() === 0) date.setDate(date.getDate() + 1);
        if (date.getDay() === 6) date.setDate(date.getDate() + 2);
        break;
    }
    const dateStr = date.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, meetingDate: dateStr }));
    validateDateWarnings(dateStr);
  };

  const applyQuickTime = (hour: number) => {
    const timeStr = getCommonMeetingTime(hour);
    setFormData(prev => ({ ...prev, meetingTime: timeStr }));
    validateTimeWarnings(timeStr);
  };

  const applyDurationPreset = (minutes: number) => {
    setFormData(prev => ({ ...prev, duration: minutes }));
  };

  const applyLocationSuggestion = (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  const generateSmartTitle = () => {
    const selectedType = meetingTypes && meetingTypes.find(t => t._id === formData.meetingTypeId);
    if (!selectedType) return;

    const date = formData.meetingDate ? new Date(formData.meetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    const suggestedTitle = `${selectedType.meetingTypeName}${date ? ` - ${date}` : ''}`;
    
    setFormData(prev => ({ ...prev, meetingTitle: suggestedTitle }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.meetingTitle.trim()) {
      newErrors.meetingTitle = 'Meeting title is required';
    } else if (formData.meetingTitle.length > 200) {
      newErrors.meetingTitle = 'Meeting title is too long (max 200 characters)';
    }

    if (!formData.meetingTypeId) {
      newErrors.meetingTypeId = 'Meeting type is required';
    }

    if (!formData.meetingDate) {
      newErrors.meetingDate = 'Meeting date is required';
    }

    if (!formData.meetingTime) {
      newErrors.meetingTime = 'Meeting time is required';
    }

    if (formData.duration && formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 minute';
    }

    if (formData.duration && formData.duration > 1440) {
      newErrors.duration = 'Duration cannot exceed 24 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Error saving meeting:', error);
      setErrors({ submit: error.message || 'Failed to save meeting' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {/* Smart Suggestions Banner */}
          {!meeting && (
            <div className="mb-5 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="text-teal-600 dark:text-teal-400 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyQuickDate('today')}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickDate('tomorrow')}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickDate('nextBusinessDay')}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                    >
                      Next Business Day
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickDate('nextWeek')}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                    >
                      Next Week
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mb-5 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">Recommendations</h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                    {warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}\n                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Meeting Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Meeting Title <span className="text-red-500">*</span>
                  </div>
                  {!meeting && formData.meetingTypeId && (
                    <button
                      type="button"
                      onClick={generateSmartTitle}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1"
                    >
                      <Zap size={12} />
                      Auto-generate
                    </button>
                  )}
                </div>
              </label>
              <input
                type="text"
                name="meetingTitle"
                value={formData.meetingTitle}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                  errors.meetingTitle ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter meeting title"
                disabled={loading}
              />
              {errors.meetingTitle && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.meetingTitle}</p>
              )}
            </div>

            {/* Meeting Type & Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    Meeting Type <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <select
                    name="meetingTypeId"
                    value={formData.meetingTypeId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none cursor-pointer shadow-sm hover:border-teal-400 dark:hover:border-teal-500 ${
                      errors.meetingTypeId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={loading}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2314b8a6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.25em 1.25em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" style={{ padding: '8px' }}>Select meeting type...</option>
                    {(() => {
                      const categorized: Record<string, typeof meetingTypes> = {};
                      const uncategorized: typeof meetingTypes = [];
                      
                      meetingTypes && meetingTypes.forEach(type => {
                        const category = (type as any).category;
                        if (category) {
                          if (!categorized[category]) {
                            categorized[category] = [];
                          }
                          categorized[category].push(type);
                        } else {
                          uncategorized.push(type);
                        }
                      });

                      const sortedCategories = Object.keys(categorized).sort();
                      
                      return (
                        <>
                          {sortedCategories.map(category => (
                            <optgroup 
                              key={category} 
                              label={category}
                              style={{
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                padding: '8px 0',
                                color: '#0d9488'
                              }}
                            >
                              {categorized[category].map(type => (
                                <option 
                                  key={type._id} 
                                  value={type._id}
                                  style={{
                                    padding: '10px 16px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {type.meetingTypeName}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                          {uncategorized.length > 0 && (
                            <optgroup 
                              label="Other"
                              style={{
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                padding: '8px 0',
                                color: '#0d9488'
                              }}
                            >
                              {uncategorized.map(type => (
                                <option 
                                  key={type._id} 
                                  value={type._id}
                                  style={{
                                    padding: '10px 16px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {type.meetingTypeName}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </>
                      );
                    })()}
                  </select>
                  <style>{`
                    select:focus {
                      outline: none;
                    }
                    select option {
                      padding: 10px 16px;
                      background-color: white;
                      color: #1f2937;
                      transition: all 0.2s ease;
                    }
                    select option:hover {
                      background-color: #f0fdfa;
                      color: #0d9488;
                    }
                    select option:checked {
                      background-color: #14b8a6;
                      color: white;
                      font-weight: 500;
                    }
                    select optgroup {
                      font-weight: 600;
                      font-size: 0.875rem;
                      background-color: #f0fdfa;
                      padding: 8px 12px;
                      color: #0d9488;
                      margin: 4px 0;
                    }
                    .dark select option {
                      background-color: #374151;
                      color: #e5e7eb;
                    }
                    .dark select option:hover {
                      background-color: #1f2937;
                      color: #5eead4;
                    }
                    .dark select option:checked {
                      background-color: #14b8a6;
                      color: white;
                    }
                    .dark select optgroup {
                      background-color: #1f2937;
                      color: #5eead4;
                    }
                  `}</style>
                </div>
                {errors.meetingTypeId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.meetingTypeId}</p>
                )}
                {formData.meetingTypeId && (
                  <p className="mt-1 text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Meeting type selected
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  disabled={loading}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Date, Time & Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-teal-600 dark:text-teal-400" />
                    Date <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <Calendar size={18} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <input
                    type="date"
                    name="meetingDate"
                    value={formData.meetingDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-11 pr-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-all duration-200 font-medium shadow-sm hover:border-teal-400 dark:hover:border-teal-500 cursor-text ${
                      errors.meetingDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{
                      colorScheme: 'dark'
                    }}
                    disabled={loading}
                  />
                </div>
                {errors.meetingDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.meetingDate}</p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-teal-600 dark:text-teal-400" />
                    Time <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <Clock size={18} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <input
                    type="time"
                    name="meetingTime"
                    value={formData.meetingTime}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-all duration-200 font-medium shadow-sm hover:border-teal-400 dark:hover:border-teal-500 cursor-text ${
                      errors.meetingTime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{
                      colorScheme: 'dark'
                    }}
                    disabled={loading}
                  />
                </div>
                {!meeting && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {[9, 10, 11, 14, 15, 16].map(hour => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => applyQuickTime(hour)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                      </button>
                    ))}
                  </div>
                )}
                {errors.meetingTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.meetingTime}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Timer size={16} />
                    Duration (min)
                    {formData.duration >= 60 && (
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-normal">
                        {formatDuration(formData.duration)}
                      </span>
                    )}
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-all duration-200 font-medium shadow-sm hover:border-teal-400 dark:hover:border-teal-500 cursor-text ${
                      errors.duration ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="60"
                    min="1"
                    max="1440"
                    disabled={loading}
                  />
                  {formData.duration >= 60 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                        {formatDuration(formData.duration)}
                      </span>
                    </div>
                  )}
                </div>
                {!meeting && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {DURATION_PRESETS.map(preset => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => applyDurationPreset(preset.value)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          formData.duration === preset.value
                            ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    Location
                  </div>
                  {!meeting && (
                    <button
                      type="button"
                      onClick={() => setShowLocationSuggestions(!showLocationSuggestions)}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                    >
                      {showLocationSuggestions ? 'Hide' : 'Show'} suggestions
                    </button>
                  )}
                </div>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                placeholder="Meeting location or virtual link"
                disabled={loading}
              />
              {showLocationSuggestions && !meeting && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex flex-wrap gap-1">
                    {COMMON_LOCATIONS.map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => applyLocationSuggestion(loc)}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="meetingDescription"
                value={formData.meetingDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                placeholder="Brief description of the meeting"
                disabled={loading}
              />
            </div>

            {/* Agenda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agenda
              </label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                placeholder="Meeting agenda and discussion points"
                disabled={loading}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm font-mono">ESC</kbd>
              <span>to close</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm font-mono">↵</kbd>
              <span>to save</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Meeting'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingFormModal;
