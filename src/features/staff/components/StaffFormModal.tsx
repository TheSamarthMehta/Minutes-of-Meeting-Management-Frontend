import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Building2, Briefcase, FileText, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { Staff, StaffFormData } from '../../../api/staffService';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData) => Promise<void>;
  staff?: Staff | null;
  title: string;
}

// Professional Departments
const DEPARTMENTS = [
  'Executive',
  'Human Resources',
  'Finance',
  'Sales',
  'Marketing',
  'IT / Technology',
  'Operations',
  'Product',
  'Design',
  'Engineering',
  'Customer Support',
  'Legal',
  'Administration',
  'Research & Development',
  'Quality Assurance',
  'Other'
];

// Professional Roles
const ROLES = [
  { value: 'Admin', label: 'Admin', description: 'Full system access' },
  { value: 'Convener', label: 'Convener', description: 'Meeting organizer' },
  { value: 'Staff', label: 'Staff', description: 'Regular staff member' }
];

// Designation suggestions by department
const DESIGNATION_SUGGESTIONS: Record<string, string[]> = {
  'Executive': ['CEO', 'CTO', 'CFO', 'COO', 'VP', 'Director', 'President'],
  'Human Resources': ['HR Manager', 'HR Executive', 'Recruiter', 'HR Business Partner', 'Talent Acquisition'],
  'Finance': ['Finance Manager', 'Accountant', 'Financial Analyst', 'Controller', 'Treasurer'],
  'Sales': ['Sales Manager', 'Sales Executive', 'Account Manager', 'Business Development', 'Sales Director'],
  'Marketing': ['Marketing Manager', 'Marketing Executive', 'Content Manager', 'Digital Marketing', 'Brand Manager'],
  'IT / Technology': ['Software Engineer', 'Senior Developer', 'Tech Lead', 'DevOps Engineer', 'System Admin'],
  'Operations': ['Operations Manager', 'Operations Executive', 'Process Manager', 'Operations Analyst'],
  'Product': ['Product Manager', 'Product Owner', 'Product Analyst', 'Associate Product Manager'],
  'Design': ['UI/UX Designer', 'Graphic Designer', 'Design Lead', 'Senior Designer', 'Visual Designer'],
  'Engineering': ['Software Engineer', 'Senior Engineer', 'Lead Engineer', 'Engineering Manager', 'Architect'],
  'Customer Support': ['Support Manager', 'Support Executive', 'Customer Success', 'Support Engineer'],
  'Legal': ['Legal Counsel', 'Legal Manager', 'Compliance Officer', 'Legal Executive'],
  'Administration': ['Admin Manager', 'Admin Executive', 'Office Manager', 'Administrative Assistant'],
  'Research & Development': ['Research Scientist', 'R&D Engineer', 'Research Manager', 'Innovation Lead'],
  'Quality Assurance': ['QA Engineer', 'QA Manager', 'Test Engineer', 'QA Lead', 'Automation Engineer'],
  'Other': []
};

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staff,
  title
}) => {
  const [formData, setFormData] = useState<StaffFormData>({
    staffName: '',
    emailAddress: '',
    mobileNo: '',
    role: 'Staff',
    department: '',
    designation: '',
    remarks: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showDesignationSuggestions, setShowDesignationSuggestions] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (staff) {
      setFormData({
        staffName: staff.staffName || '',
        emailAddress: staff.emailAddress || '',
        mobileNo: staff.mobileNo || '',
        role: staff.role || 'Staff',
        department: staff.department || '',
        designation: staff.designation || '',
        remarks: staff.remarks || ''
      });
    } else {
      setFormData({
        staffName: '',
        emailAddress: '',
        mobileNo: '',
        role: 'Staff',
        department: '',
        designation: '',
        remarks: ''
      });
    }
    setErrors({});
    setWarnings([]);
    setEmailValid(null);
    setPhoneValid(null);
    setShowDesignationSuggestions(false);
  }, [staff, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Real-time validation and smart features
    if (name === 'emailAddress') {
      if (value) {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        setEmailValid(isValid);
      } else {
        setEmailValid(null);
      }
    }

    if (name === 'mobileNo') {
      // Auto-format phone number
      const cleaned = value.replace(/[^0-9]/g, '');
      if (cleaned.length <= 10) {
        setFormData(prev => ({ ...prev, mobileNo: cleaned }));
        if (cleaned.length === 10) {
          setPhoneValid(true);
        } else if (cleaned.length > 0) {
          setPhoneValid(false);
        } else {
          setPhoneValid(null);
        }
      }
      return; // Don't update again
    }

    if (name === 'department') {
      setShowDesignationSuggestions(value !== '' && DESIGNATION_SUGGESTIONS[value]?.length > 0);
    }

    if (name === 'staffName') {
      // Auto-capitalize names
      const capitalized = value.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      if (capitalized !== value && value.length > 0) {
        setFormData(prev => ({ ...prev, staffName: capitalized }));
        return;
      }
    }
  };

  const applyDesignation = (designation: string) => {
    setFormData(prev => ({ ...prev, designation }));
    setShowDesignationSuggestions(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newWarnings: string[] = [];

    // Required field validation
    if (!formData.staffName.trim()) {
      newErrors.staffName = 'Staff name is required';
    } else if (formData.staffName.length < 2) {
      newErrors.staffName = 'Name must be at least 2 characters';
    } else if (formData.staffName.length > 250) {
      newErrors.staffName = 'Name cannot exceed 250 characters';
    }

    // Email validation
    if (formData.emailAddress) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
        newErrors.emailAddress = 'Invalid email format (e.g., user@example.com)';
      } else if (formData.emailAddress.length > 100) {
        newErrors.emailAddress = 'Email cannot exceed 100 characters';
      }
    } else {
      newWarnings.push('📧 Email address not provided - recommended for communication');
    }

    // Phone validation
    if (formData.mobileNo) {
      const cleaned = formData.mobileNo.replace(/[^0-9]/g, '');
      if (cleaned.length !== 10) {
        newErrors.mobileNo = 'Mobile number must be exactly 10 digits';
      } else if (!/^[6-9]/.test(cleaned)) {
        newWarnings.push('📱 Mobile number should start with 6, 7, 8, or 9');
      }
    } else {
      newWarnings.push('📞 Mobile number not provided - recommended for contact');
    }

    // Role validation
    if (!formData.role) {
      newWarnings.push('👤 Role not specified - defaulting to Staff');
    }

    // Department validation
    if (!formData.department) {
      newWarnings.push('🏢 Department not specified');
    }

    // Designation validation
    if (!formData.designation) {
      newWarnings.push('💼 Designation not specified');
    }

    // Remarks length check
    if (formData.remarks && formData.remarks.length > 500) {
      newErrors.remarks = 'Remarks cannot exceed 500 characters';
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
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
      console.error('Error saving staff:', error);
      setErrors({ submit: error.message || 'Failed to save staff member' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
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
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Staff Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  Staff Name <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                name="staffName"
                value={formData.staffName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                  errors.staffName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter staff name"
                disabled={loading}
              />
              {errors.staffName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.staffName}</p>
              )}
            </div>

            {/* Email & Mobile Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                      errors.emailAddress 
                        ? 'border-red-500' 
                        : emailValid === true 
                        ? 'border-green-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="email@example.com"
                    disabled={loading}
                  />
                  {emailValid === true && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                  )}
                </div>
                {errors.emailAddress && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.emailAddress}</p>
                )}
                {emailValid === true && !errors.emailAddress && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Valid email format
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    Mobile Number
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                      errors.mobileNo 
                        ? 'border-red-500' 
                        : phoneValid === true 
                        ? 'border-green-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="1234567890"
                    maxLength={10}
                    disabled={loading}
                  />
                  {phoneValid === true && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                  )}
                </div>
                {errors.mobileNo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mobileNo}</p>
                )}
                {phoneValid === true && !errors.mobileNo && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Valid mobile number
                  </p>
                )}
                {formData.mobileNo && formData.mobileNo.length < 10 && (
                  <p className="mt-1 text-xs text-gray-500">{formData.mobileNo.length}/10 digits</p>
                )}
              </div>
            </div>

            {/* Role & Department Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} />
                    Role <span className="text-red-500">*</span>
                  </div>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none cursor-pointer shadow-sm hover:border-teal-400 dark:hover:border-teal-500"
                  disabled={loading}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2314b8a6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25em 1.25em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">System access level</p>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    Department
                  </div>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none cursor-pointer shadow-sm hover:border-teal-400 dark:hover:border-teal-500"
                  disabled={loading}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2314b8a6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25em 1.25em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Organizational unit</p>
              </div>
            </div>

            {/* Smart Designation Suggestions */}
            {showDesignationSuggestions && formData.department && DESIGNATION_SUGGESTIONS[formData.department]?.length > 0 && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-200 mb-2">
                      Popular {formData.department} Designations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {DESIGNATION_SUGGESTIONS[formData.department].map(designation => (
                        <button
                          key={designation}
                          type="button"
                          onClick={() => applyDesignation(designation)}
                          className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-400 dark:hover:border-teal-500 text-sm font-medium transition-all"
                        >
                          {designation}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  Designation
                </div>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                placeholder="e.g., Senior Developer, Team Lead"
                disabled={loading}
              />
              {!formData.designation && formData.department && (
                <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                  Select a department to see designation suggestions
                </p>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  Remarks
                </div>
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                placeholder="Additional notes or comments"
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
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
            {loading ? 'Saving...' : 'Save Staff'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffFormModal;
