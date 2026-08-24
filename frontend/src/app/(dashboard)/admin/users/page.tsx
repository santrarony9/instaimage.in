"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isWhatsappVerified?: boolean;
  role: 'ADMIN' | 'CUSTOMER' | 'SELLER';
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchUsers = async (query: string = '') => {
    try {
      setLoading(true);
      const data = await fetchApi(`/users${query ? `?search=${encodeURIComponent(query)}` : ''}`, { method: 'GET' });
      setUsers(data || []);
    } catch (error: any) {
      addToast(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      // User cancelled, refetch to reset UI state
      fetchUsers(search);
      return;
    }
    try {
      await fetchApi(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      addToast('Role updated successfully', 'success');
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
    } catch (error: any) {
      addToast(error.message || 'Failed to update role', 'error');
      // Refetch to reset the select to original value if error
      fetchUsers(search);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await fetchApi('/auth/admin-register', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      addToast('User created successfully', 'success');
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'CUSTOMER' });
      fetchUsers(search);
    } catch (error: any) {
      addToast(error.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'CUSTOMER':
        return 'bg-blue-100 text-blue-800';
      case 'SELLER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition shadow-sm font-medium text-sm whitespace-nowrap"
          >
            + Add User
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone / WhatsApp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.phone ? (
                      <span className="flex items-center gap-2">
                        {user.phone}
                        {user.isWhatsappVerified && (
                          <span className="text-green-600" title="WhatsApp Verified">✓</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-300 italic">Not provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="SELLER">SELLER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-black focus:border-black"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="SELLER">Photographer / Seller</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
