import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { AvatarUpload } from '../../components/AvatarUpload';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    password: '',
    avatarUrl: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async (query = search) => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/employees', {
        params: { search: query },
      });
      setEmployees(response.data.employees || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees(search);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      password: 'Password123!',
      avatarUrl: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: User) => {
    setModalMode('edit');
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      password: '',
      avatarUrl: emp.avatarUrl || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (modalMode === 'create') {
        await api.post('/admin/employees', formData);
        setActionSuccess('Employee registered successfully.');
      } else if (modalMode === 'edit' && selectedEmployee) {
        const payload: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          avatarUrl: formData.avatarUrl,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await api.put(`/admin/employees/${selectedEmployee.id}`, payload);
        setActionSuccess('Employee updated successfully.');
      }

      setIsModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || 'Error saving employee details.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Employees Directory
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage corporate employee credentials and profiles.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          <span>Add Employee</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-900">
            All Employees ({employees.length})
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            Loading employees...
          </div>
        ) : employees.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No employees found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-xs font-medium text-zinc-600 border-b border-zinc-200">
                <tr>
                  <th className="px-5 py-2.5">Employee</th>
                  <th className="px-5 py-2.5">Position</th>
                  <th className="px-5 py-2.5">Phone</th>
                  <th className="px-5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-3">
                        {emp.avatarUrl ? (
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center font-medium text-xs">
                            {emp.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-zinc-900">{emp.name}</p>
                          <p className="text-3xs text-zinc-500 font-mono">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {emp.position}
                      </span>
                    </td>

                    <td className="px-5 py-3 font-mono text-zinc-600">
                      {emp.phone}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="inline-flex items-center text-xs text-zinc-600 hover:text-zinc-900 font-medium cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 mr-1 text-zinc-400" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                {modalMode === 'create' ? 'Add New Employee' : 'Edit Employee Details'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Backend Engineer"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  {modalMode === 'create' ? 'Initial Password' : 'New Password (Optional)'}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={modalMode === 'create' ? 'Min. 6 chars' : 'Leave empty to keep current'}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Foto Profil (Maksimal 2 MB)
                </label>
                <AvatarUpload
                  value={formData.avatarUrl}
                  onChange={(newUrl) => setFormData({ ...formData, avatarUrl: newUrl })}
                  maxSizeMB={2}
                  initialName={formData.name || 'K'}
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
