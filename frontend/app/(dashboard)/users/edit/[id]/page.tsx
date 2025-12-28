'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getUserById, updateUser } from '@/lib/api';
import {
  USERNAME_MAX_LENGTH,
  getUsernameError
} from '@/lib/validation';
import { checkAuth, hasRole } from '@/utils/auth';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const currentUser = checkAuth();
  const canEditPassword = hasRole(['lv3']);
  const canEditRole = canEditPassword;
  const isManager = currentUser?.role === 'lv2';
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    role: 'lv1'
  });

  useEffect(() => {
    fetchUser();
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUser = async () => {
    try {
      setFetching(true);
      const user = await getUserById(String(params.id));
      if (isManager && user.role === 'lv3') {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Bạn không có quyền chỉnh sửa tài khoản admin"
        });
        router.push('/users');
        return;
      }

      setFormData({
        username: user.username,
        password: '', // Don't populate password
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        role: user.role
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || 'Không thể tải thông tin user'
      });
      router.push('/users');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'username' ? value.toLowerCase() : value;
    setFormData(prev => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.email) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc"
      });
      return;
    }

    const usernameError = getUsernameError(formData.username);
    if (usernameError) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: usernameError
      });
      return;
    }

    // Validate password only if provided
    if (formData.password && formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Email không hợp lệ"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Only send password if it's been changed
      const updateData: any = {
        ...formData
      };
      if (!canEditPassword || !updateData.password) {
        delete updateData.password;
      }
      if (!canEditRole) {
        delete updateData.role;
      }

      await updateUser(String(params.id), updateData);
      toast({
        variant: "success",
        title: "Thành công",
        description: "Đã cập nhật thông tin người dùng"
      });
      router.push('/users');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || 'Cập nhật user thất bại'
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout requireRole={['lv2', 'lv3']}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requireRole={['lv2', 'lv3']}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/users')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa người dùng</CardTitle>
            <CardDescription>
              Cập nhật thông tin tài khoản người dùng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={USERNAME_MAX_LENGTH}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Chỉ chữ thường, số, dấu chấm hoặc gạch dưới (3-30 ký tự)
                  </p>
                </div>

                {canEditPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Để trống nếu không đổi"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Để trống nếu không muốn thay đổi mật khẩu
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="role">
                    Vai trò <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={!canEditRole}
                    required
                  >
                    <option value="lv1">User (lv1) - Chỉ xem danh sách</option>
                    <option value="lv2">Manager (lv2) - Xem, tạo, sửa</option>
                    <option value="lv3">Admin (lv3) - Toàn quyền</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    lv1: Chỉ xem | lv2: Xem, tạo, sửa | lv3: Toàn quyền + Settings
                  </p>
                  {!canEditRole && (
                    <p className="text-xs text-gray-500">
                      Chỉ admin (lv3) mới được thay đổi vai trò
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/users')}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
