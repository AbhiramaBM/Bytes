import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, Building2, BarChart3, AlertCircle, TrendingUp, Search, Filter, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, LoadingSpinner, Button } from '../components/UI';
import apiClient from '../utils/apiClient';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalClinics: 0
  });
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchDashboardData();
  }, [page, roleFilter]); // Refetch on page or filter change

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const statsRes = await apiClient.get('/admin/dashboard');
      setStats(statsRes.data.data || {
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalClinics: 0
      });

      const usersRes = await apiClient.get('/admin/users', {
        params: {
          search: search.trim() || undefined,
          role: roleFilter || undefined,
          page,
          limit: 10
        }
      });

      setUsers(usersRes.data.data.users || []);
      setPagination(usersRes.data.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('❌ Error fetching admin dashboard:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDashboardData();
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user? They will no longer be able to log in.')) return;

    try {
      await apiClient.delete(`/admin/users/${userId}`);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to deactivate user');
    }
  };

  if (loading && page === 1 && !search && !roleFilter) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-10">System Overview & Management</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded mb-10 flex items-center gap-2">
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        {[
          { icon: Users, label: 'Total Patients', value: stats.totalPatients, color: 'blue' },
          { icon: Stethoscope, label: 'Total Doctors', value: stats.totalDoctors, color: 'green' },
          { icon: Building2, label: 'Total Clinics', value: stats.totalClinics, color: 'purple' },
          { icon: BarChart3, label: 'Total Appointments', value: stats.totalAppointments, color: 'orange' }
        ].map((stat, idx) => (
          <Card key={idx} className="border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <stat.icon size={32} className={`text-blue-500`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Link to="/admin/users" className="block">
          <Card className="hover:shadow-md transition bg-blue-600 text-white">
            <Users size={32} className="mb-2" />
            <p className="font-bold text-lg">Detailed User List</p>
            <p className="text-blue-100 text-sm">Full management view</p>
          </Card>
        </Link>
        <Link to="/admin/clinics" className="block">
          <Card className="hover:shadow-md transition bg-green-600 text-white">
            <Building2 size={32} className="mb-2" />
            <p className="font-bold text-lg">Manage Clinics</p>
            <p className="text-green-100 text-sm">Add or edit clinics</p>
          </Card>
        </Link>
        <Link to="/admin/analytics" className="block">
          <Card className="hover:shadow-md transition bg-purple-600 text-white">
            <TrendingUp size={32} className="mb-2" />
            <p className="font-bold text-lg">Analytics</p>
            <p className="text-purple-100 text-sm">View system reports</p>
          </Card>
        </Link>
      </div>

      {/* Users List with Real Search & Filter */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold">User Management</h2>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search name or email..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary">Search</Button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-gray-400" />
            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-10"><LoadingSpinner /></div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">User</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'patient' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'doctor' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Deactivate User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-gray-500">
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={16} /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <Users size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium">No users found matching your criteria</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setRoleFilter(''); setPage(1); }}>
              Clear All Filters
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
