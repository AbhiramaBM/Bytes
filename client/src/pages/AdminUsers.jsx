import React, { useState, useEffect } from 'react';
import { Trash2, Edit, AlertCircle, Users, Filter } from 'lucide-react';
import { Card, LoadingSpinner, Button } from '../components/UI';
import apiClient from '../utils/apiClient';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching users list...');
      const response = await apiClient.get('/admin/users');
      console.log('✅ Users fetched:', response.data);
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.delete(`/admin/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
        console.log('✅ User deleted');
      } catch (error) {
        console.error('❌ Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filter === 'all' || u.role === filter;
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-2">User Management</h1>
      <p className="text-gray-600 mb-6">Manage system users and permissions</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <Users size={32} className="text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Patients</p>
            <p className="text-3xl font-bold">{users.filter(u => u.role === 'patient' || u.role === 'user').length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Doctors</p>
            <p className="text-3xl font-bold">{users.filter(u => u.role === 'doctor').length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Admins</p>
            <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user._id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button size="sm" variant="secondary">
                        <Edit size={16} />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsers;
