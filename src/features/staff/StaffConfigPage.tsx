import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, User, X } from "lucide-react";
import { useStaff } from "./hooks/useStaff";
import { useForm } from "../../shared/hooks/useForm";
import { RoleBadge } from "../../shared/components/StatusBadge";
import { schemas } from "../../shared/utils/validators";
import { USER_ROLES } from "../../shared/constants/enums";
import { notify } from "../../shared/utils/notifications";

const StaffConfigPage = () => {
  const {
    loading: apiLoading,
    error: apiError,
    fetchStaff,
    saveStaff,
    deleteStaff,
    modal,
  } = useStaff();

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const initialFormValues = {
    staffName: "",
    emailAddress: "",
    mobileNo: "",
    role: USER_ROLES.STAFF,
    department: "",
  };

  const form = useForm(
    initialFormValues,
    async (values: any) => {
      try {
        await saveStaff(values, modal.data);
        await loadData();
        modal.close();
        notify.success(modal.data ? 'Staff member updated successfully' : 'Staff member added successfully');
      } catch (err: any) {
        notify.error(err.message || 'Failed to save staff');
      }
    },
    schemas.staff
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedStaff = await fetchStaff();
      setStaff(fetchedStaff || []);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load staff:', err);
      }
      notify.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
        await loadData();
        notify.success('Staff member deleted successfully');
      } catch (err: any) {
        notify.error(err.message || 'Failed to delete staff');
      }
    }
  };

  const handleEdit = (staffMember: any) => {
    form.setValues({
      staffName: staffMember.staffName || "",
      emailAddress: staffMember.emailAddress || "",
      mobileNo: staffMember.mobileNo || "",
      role: staffMember.role || USER_ROLES.STAFF,
      department: staffMember.department || "",
    });
    modal.open(staffMember);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage your organization's staff members</p>
        </div>
        <button
          onClick={() => {
            form.reset();
            modal.open(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg shadow-teal-500/30"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add Staff</span>
        </button>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {staff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {staff.map((member: any) => (
                  <tr key={member._id} className="hover:bg-teal-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                          {member.staffName?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{member.staffName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.emailAddress}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.mobileNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.department}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first staff member</p>
            <button
              onClick={() => {
                form.reset();
                modal.open(null);
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Add Staff Member
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={modal.close}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modal.data ? 'Edit Staff Member' : 'Add Staff Member'}
              </h2>
              <button
                onClick={modal.close}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Staff Name</label>
                <input
                  type="text"
                  name="staffName"
                  value={form.values.staffName}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
                {form.touched.staffName && form.errors.staffName && (
                  <p className="text-sm text-red-600 mt-1">{form.errors.staffName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={form.values.emailAddress}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
                {form.touched.emailAddress && form.errors.emailAddress && (
                  <p className="text-sm text-red-600 mt-1">{form.errors.emailAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={form.values.mobileNo}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="1234567890"
                />
                {form.touched.mobileNo && form.errors.mobileNo && (
                  <p className="text-sm text-red-600 mt-1">{form.errors.mobileNo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={form.values.department}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Engineering"
                />
                {form.touched.department && form.errors.department && (
                  <p className="text-sm text-red-600 mt-1">{form.errors.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={form.values.role}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {Object.values(USER_ROLES).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {form.touched.role && form.errors.role && (
                  <p className="text-sm text-red-600 mt-1">{form.errors.role}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={modal.close}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 font-medium"
                >
                  {form.isSubmitting ? 'Saving...' : modal.data ? 'Update' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffConfigPage;
