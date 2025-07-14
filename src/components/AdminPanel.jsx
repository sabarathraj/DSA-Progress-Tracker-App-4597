import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../hooks/useAuth';

const { FiUsers, FiUserPlus, FiTrash2, FiEdit2, FiCheck, FiX } = FiIcons;

const AdminPanel = () => {
  const { supabase } = useDatabase();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <SafeIcon icon={FiUsers} className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Management
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">User</th>
              <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Role</th>
              <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Joined</th>
              <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUser} className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.full_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  {editingUser === user.user_id ? (
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.user_id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    {editingUser === user.user_id ? (
                      <>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="p-1 text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20 rounded"
                        >
                          <SafeIcon icon={FiCheck} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="p-1 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded"
                        >
                          <SafeIcon icon={FiX} className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingUser(user.user_id)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;