import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import * as userService from '@/services/userService';
import { Eye, EyeOff } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  role: 'admin' | 'pharmacist' | 'cashier' | 'user';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<User & { password?: string }>>({});
  const [newUser, setNewUser] = useState<{ email: string; password: string; role: User['role'] }>({ email: '', password: '', role: 'cashier' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user._id);
    setEditData({ ...user });
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    try {
      await userService.updateUser(editingId, editData);
      setEditingId(null);
      setEditData({});
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) return;
    try {
      await userService.createUser(newUser);
      setNewUser({ email: '', password: '', role: 'cashier' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <h2 className="font-semibold mb-2">All Users</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full mb-4 border text-left">
              <thead>
                <tr>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="p-2 border">{editingId === user._id ? (
                      <Input
                        value={editData.email || ''}
                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                      />
                    ) : user.email}</td>
                    <td className="p-2 border">{editingId === user._id ? (
                      <Select value={editData.role as string} onValueChange={val => setEditData({ ...editData, role: val as User['role'] })}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="pharmacist">Pharmacist</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : user.role}</td>
                    <td className="p-2 border">
                      {editingId === user._id ? (
                        <>
                          <Button size="sm" onClick={handleEditSave}>Save</Button>
                          <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                          <div className="relative mt-1">
                            <Input
                              placeholder="New Password (optional)"
                              type={showEditPassword ? "text" : "password"}
                              value={editData.password || ''}
                              onChange={e => setEditData({ ...editData, password: e.target.value })}
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                              onClick={() => setShowEditPassword(v => !v)}
                              tabIndex={-1}
                            >
                              {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Button size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(user._id)}>Delete</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h2 className="font-semibold mb-2">Add New User</h2>
          <div className="flex flex-col gap-2 mb-4">
            <Input
              placeholder="Email"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Select value={newUser.role} onValueChange={val => setNewUser({ ...newUser, role: val as User['role'] })}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Input
                placeholder="Password"
                type={showNewUserPassword ? "text" : "password"}
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowNewUserPassword(v => !v)}
                tabIndex={-1}
              >
                {showNewUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
