import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Layers, Lightbulb, Tag, FileText } from 'lucide-react';
import { MeetingType, MeetingTypeFormData } from '../../../api/masterConfigService';

interface ConfigFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MeetingTypeFormData) => Promise<void>;
  type?: MeetingType | null;
  mode: 'add' | 'edit';
  validateForm: (data: MeetingTypeFormData) => string[];
}

// Professional Meeting Categories
const MEETING_CATEGORIES = [
  'Agile / Scrum',
  'Project Management',
  'Client / External',
  'Team',
  'Executive',
  'HR',
  'Sales',
  'Marketing',
  'Design / Product',
  'Product / Engineering',
  'Finance',
  'IT / Ops',
  'IT / Security',
  'Training',
  'Company-wide',
  'Other'
];

// Popular meeting type suggestions by category
const MEETING_SUGGESTIONS: Record<string, string[]> = {
  'Agile / Scrum': ['Daily Standup', 'Sprint Planning', 'Sprint Review', 'Sprint Retrospective', 'Backlog Refinement'],
  'Project Management': ['Project Kickoff', 'Status Update', 'Risk Assessment', 'Stakeholder Meeting', 'Project Review'],
  'Client / External': ['Client Requirement', 'Client Review', 'Client Feedback', 'Client Demo', 'Vendor Management'],
  'Team': ['Team Meeting', 'Cross-Functional Meeting', 'Brainstorming', 'Problem-Solving', 'Collaboration'],
  'Executive': ['Board Meeting', 'Leadership Meeting', 'Strategy Planning', 'QBR', 'AGM'],
  'HR': ['Interview (Technical)', 'Interview (HR)', 'Performance Review', 'Employee Feedback', 'Onboarding'],
  'Sales': ['Sales Pitch', 'Lead Qualification', 'Sales Review', 'Revenue Planning', 'Deal Closure'],
  'Marketing': ['Campaign Planning', 'Content Planning', 'Brand Strategy', 'Market Research', 'Product Launch'],
  'Design / Product': ['UI/UX Review', 'Product Requirements', 'Product Roadmap', 'Feature Finalization'],
  'Product / Engineering': ['Technical Architecture', 'Code Review', 'Release Planning'],
  'Finance': ['Finance Review', 'Budget Approval', 'Cost Optimization', 'Audit Meeting'],
  'IT / Ops': ['IT Support', 'Incident Response', 'System Upgrade', 'Disaster Recovery'],
  'IT / Security': ['Security Compliance', 'Vulnerability Assessment', 'Security Audit'],
  'Training': ['Training Session', 'Knowledge Transfer', 'Workshop', 'Certification'],
  'Company-wide': ['Townhall', 'All-Hands', 'Policy Update', 'Announcement'],
  'Other': []
};

const ConfigFormModal: React.FC<ConfigFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  mode,
  validateForm
}) => {
  const [formData, setFormData] = useState<MeetingTypeFormData>({
    meetingTypeName: '',
    remarks: '',
    category: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && type) {
        const category = (type as any).category || '';
        setFormData({
          meetingTypeName: type.meetingTypeName,
          remarks: type.remarks || '',
          category
        });
        setSelectedCategory(category);
      } else {
        setFormData({
          meetingTypeName: '',
          remarks: '',
          category: ''
        });
        setSelectedCategory('');
      }
      setErrors([]);
      setShowSuggestions(false);
    }
  }, [isOpen, mode, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'category') {
      setSelectedCategory(value);
      setShowSuggestions(value !== '' && MEETING_SUGGESTIONS[value]?.length > 0);
    }
    
    setErrors([]);
  };

  const applySuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, meetingTypeName: suggestion }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        meetingTypeName: formData.meetingTypeName.trim(),
        remarks: formData.remarks?.trim() || undefined,
        category: formData.category || undefined
      };
      await onSave(dataToSave as any);
      onClose();
    } catch (error) {
      console.error('Error saving meeting type:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'add' ? 'Add New Meeting Type' : 'Edit Meeting Type'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
            disabled={saving}
          >
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                    Please fix the following errors:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Category
              </div>
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={saving}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all appearance-none cursor-pointer shadow-sm hover:border-teal-400 dark:hover:border-teal-500"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2314b8a6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Select a category...</option>
                {MEETING_CATEGORIES.map(cat => (
                  <option 
                    key={cat} 
                    value={cat}
                  >
                    {cat}
                  </option>
                ))}
              </select>
              <style>{`
                #category:focus {
                  outline: none;
                }
                #category option {
                  padding: 10px 16px;
                  transition: all 0.2s ease;
                }
                
                /* Light mode styles */
                @media (prefers-color-scheme: light) {
                  #category option {
                    background-color: white;
                    color: #1f2937;
                  }
                  #category option:hover {
                    background-color: #f0fdfa;
                    color: #0d9488;
                  }
                }
                
                /* Dark mode styles */
                @media (prefers-color-scheme: dark) {
                  #category option {
                    background-color: #374151;
                    color: #f3f4f6;
                  }
                  #category option:hover {
                    background-color: #1f2937;
                    color: #5eead4;
                  }
                }
                
                /* Dark mode class-based (Tailwind) */
                .dark #category option {
                  background-color: #374151;
                  color: #f3f4f6;
                }
                .dark #category option:hover {
                  background-color: #1f2937;
                  color: #5eead4;
                }
                
                #category option:checked {
                  background-color: #14b8a6;
                  color: white;
                  font-weight: 500;
                }
              `}</style>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose the category that best fits this meeting type
            </p>
          </div>

          {/* Smart Suggestions */}
          {showSuggestions && selectedCategory && MEETING_SUGGESTIONS[selectedCategory]?.length > 0 && (
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-200 mb-2">
                    Popular {selectedCategory} Meeting Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {MEETING_SUGGESTIONS[selectedCategory].map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => applySuggestion(suggestion)}
                        className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-400 dark:hover:border-teal-500 text-sm font-medium transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Type Name */}
          <div>
            <label htmlFor="meetingTypeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Tag size={16} />
                Meeting Type Name <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="text"
              id="meetingTypeName"
              name="meetingTypeName"
              value={formData.meetingTypeName}
              onChange={handleChange}
              placeholder="e.g., Board Meeting, Team Sync, Review Meeting"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              disabled={saving}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter a descriptive name for this meeting type
            </p>
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Remarks
              </div>
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Add any additional notes or description..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
              disabled={saving}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Add notes or description about this meeting type
            </p>
          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'Saving...' : mode === 'add' ? 'Add Meeting Type' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigFormModal;
