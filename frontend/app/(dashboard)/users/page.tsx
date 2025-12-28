'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth, hasRole } from '@/utils/auth';
import { deleteUser, getUsers } from '@/lib/api';
import { User } from '@/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  ArrowUpDown,
  Filter,
  X,
  CheckSquare,
  Square
} from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'username' | 'email' | 'dateOfBirth'>('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers({
        page,
        search,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        sortBy,
        sortOrder
      });
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      toast({
        variant: "success",
        title: "Thành công",
        description: "Đã xóa người dùng"
      });
      fetchUsers();
      setSelectedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || 'Xóa user thất bại'
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.size} user đã chọn?`)) return;
    
    try {
      await Promise.all(
        Array.from(selectedUsers).map(id => deleteUser(id))
      );
      toast({
        variant: "success",
        title: "Thành công",
        description: `Đã xóa ${selectedUsers.size} người dùng`
      });
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa một số người dùng"
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Username', 'Email', 'Phone', 'Address', 'Date of Birth', 'Role'];
    const rows = users.map(u => [
      u.username,
      u.email,
      u.phone,
      u.address,
      u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString('vi-VN') : '',
      u.role
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      variant: "success",
      title: "Thành công",
      description: "Đã xuất danh sách người dùng"
    });
  };

  const toggleSort = (column: 'username' | 'email' | 'dateOfBirth') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u._id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'lv3': return 'destructive';
      case 'lv2': return 'default';
      case 'lv1': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'lv3': return 'Admin';
      case 'lv2': return 'Manager';
      case 'lv1': return 'User';
      default: return role;
    }
  };

  const currentUser = checkAuth();
  const canCreate = hasRole(['lv2', 'lv3']);
  const canEdit = hasRole(['lv2', 'lv3']);
  const canDelete = hasRole(['lv3']);
  const canEditUser = (user: User) => !(currentUser?.role === 'lv2' && user.role === 'lv3');

  return (
    <DashboardLayout requireRole={['lv1', 'lv2', 'lv3']}>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">Danh sách người dùng</CardTitle>
              <CardDescription>
                Quản lý tài khoản và phân quyền người dùng {users.length > 0 && `(${users.length} user)`}
              </CardDescription>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Ẩn' : 'Hiện'} bộ lọc
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={users.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Xuất CSV
              </Button>
              
              {canCreate && (
                <Button
                  onClick={() => router.push('/users/create')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tạo User
                </Button>
              )}
            </div>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="mt-4 rounded-lg border bg-gray-50 p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Tìm theo tên, email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Vai trò</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">Tất cả</option>
                    <option value="lv3">Admin (lv3)</option>
                    <option value="lv2">Manager (lv2)</option>
                    <option value="lv1">User (lv1)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Sắp xếp theo</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field as any);
                      setSortOrder(order as any);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="username-asc">Tên (A-Z)</option>
                    <option value="username-desc">Tên (Z-A)</option>
                    <option value="email-asc">Email (A-Z)</option>
                    <option value="email-desc">Email (Z-A)</option>
                    <option value="dateOfBirth-asc">Ngày sinh (Cũ nhất)</option>
                    <option value="dateOfBirth-desc">Ngày sinh (Mới nhất)</option>
                  </select>
                </div>
              </div>

              {(search || roleFilter !== 'all') && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-500">Đang lọc:</span>
                  {search && (
                    <Badge variant="outline" className="gap-1">
                      Tìm kiếm: "{search}"
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch('')} />
                    </Badge>
                  )}
                  {roleFilter !== 'all' && (
                    <Badge variant="outline" className="gap-1">
                      Vai trò: {getRoleLabel(roleFilter)}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setRoleFilter('all')} />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Bulk Actions */}
          {selectedUsers.size > 0 && canDelete && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-900">
                  Đã chọn {selectedUsers.size} user
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUsers(new Set())}
                  >
                    Bỏ chọn
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa {selectedUsers.size} user
                  </Button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <Alert>
              <AlertDescription>
                Không tìm thấy user nào. {canCreate && 'Hãy thêm user mới!'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {canDelete && (
                      <TableHead className="w-[50px]">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center justify-center"
                        >
                          {selectedUsers.size === users.length ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                    )}
                    <TableHead className="w-[200px]">
                      <button
                        onClick={() => toggleSort('username')}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        User
                        {sortBy === 'username' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => toggleSort('email')}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        Email
                        {sortBy === 'email' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Điện thoại</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>
                      <button
                        onClick={() => toggleSort('dateOfBirth')}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        Ngày sinh
                        {sortBy === 'dateOfBirth' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow 
                      key={u._id}
                      className={selectedUsers.has(u._id) ? 'bg-blue-50' : ''}
                    >
                      {canDelete && (
                        <TableCell>
                          <button
                            onClick={() => toggleSelectUser(u._id)}
                            className="flex items-center justify-center"
                          >
                            {selectedUsers.has(u._id) ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              {u.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{u.username}</div>
                            <div className="text-xs text-gray-500">ID: {u._id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-[150px]" title={u.email}>{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {u.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-[150px]" title={u.address}>{u.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(u.role) as any}>
                          <Shield className="mr-1 h-3 w-3" />
                          {getRoleLabel(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canEdit && canEditUser(u) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/users/edit/${u._id}`)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(u._id)}
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Trang {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
