'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkAuth, hasRole } from '@/utils/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { 
  Users, 
  Settings, 
  Shield, 
  Activity,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Sliders,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = checkAuth();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Get permissions based on user role
  const getPermissions = () => {
    if (!user) return [];
    
    const basePermissions = [
      { icon: Eye, label: 'Xem thông tin user', allowed: hasRole(['lv1', 'lv2', 'lv3']) },
    ];

    const managerPermissions = [
      { icon: UserPlus, label: 'Tạo user mới', allowed: hasRole(['lv2', 'lv3']) },
      { icon: Edit, label: 'Chỉnh sửa user', allowed: hasRole(['lv2', 'lv3']) },
    ];

    const adminPermissions = [
      { icon: Trash2, label: 'Xóa user', allowed: hasRole(['lv3']) },
      { icon: Sliders, label: 'Cấu hình hệ thống', allowed: hasRole(['lv3']) }
    ];

    return [...basePermissions, ...managerPermissions, ...adminPermissions];
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'lv3': return 'Admin';
      case 'lv2': return 'Manager';
      case 'lv1': return 'User';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'lv3': return 'destructive';
      case 'lv2': return 'default';
      case 'lv1': return 'secondary';
      default: return 'outline';
    }
  };

  const permissions = getPermissions();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-gray-500">Đang tải...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Chào mừng trở lại, <span className="font-semibold text-foreground">{user?.username || 'User'}</span>! Đây là tổng quan hệ thống của bạn.
          </p>
        </div>

        {/* User Info Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Thông tin tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-semibold">{user?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vai trò</p>
                  <Badge variant={getRoleBadgeVariant(user?.role) as any}>
                    {getRoleLabel(user?.role)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Phone className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Điện thoại</p>
                  <p className="font-semibold text-sm">{user?.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mounted && hasRole(['lv1', 'lv2', 'lv3']) && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/users')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Quản lý User</CardTitle>
                    <CardDescription>
                      {hasRole(['lv1']) && !hasRole(['lv2', 'lv3']) 
                        ? 'Xem danh sách người dùng' 
                        : 'Xem và quản lý người dùng'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  Truy cập
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          )}

          {mounted && hasRole(['lv3']) && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/settings')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Cài đặt</CardTitle>
                    <CardDescription>Cấu hình hệ thống</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  Truy cập
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          )}

          {mounted && hasRole(['lv3']) && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/system-info')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
                    <TrendingUp className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Thông tin hệ thống</CardTitle>
                    <CardDescription>Công nghệ & Kiến trúc</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  Truy cập
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Hoạt động</CardTitle>
                  <CardDescription>Lịch sử đăng nhập</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đăng nhập lần cuối: {new Date().toLocaleString('vi-VN')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Quyền của bạn
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <CardDescription className="mb-0">
                Các quyền hiện tại dựa trên vai trò
              </CardDescription>
              <Badge variant={getRoleBadgeVariant(user?.role) as any}>{getRoleLabel(user?.role)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {permissions.map((permission, index) => {
                const Icon = permission.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                      permission.allowed
                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        permission.allowed ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        permission.allowed ? 'text-green-900 font-medium' : 'text-gray-500'
                      }`}
                    >
                      {permission.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vai trò</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getRoleLabel(user?.role)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cấp độ phân quyền
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User ID</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono truncate" title={user?._id}>
                {user?._id ? `${user._id.substring(0, 8)}...` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mã định danh duy nhất
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Hoạt động</div>
              <p className="text-xs text-muted-foreground mt-1">
                Đã đăng nhập thành công
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
