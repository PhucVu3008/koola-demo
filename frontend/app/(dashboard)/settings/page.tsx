'use client';

import { useEffect, useState } from 'react';
import { Setting } from '@/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DurationSelector } from '@/components/ui/duration-selector';
import { useToast } from '@/hooks/use-toast';
import { changePassword, getSettings, getUsers, updateSetting } from '@/lib/api';
import { 
  Save, 
  Shield,
  Server,
  Database,
  Key,
  Mail,
  Bell,
  Globe,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Download,
  Users,
  Activity,
  HardDrive,
  Clock
} from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeTab, setActiveTab] = useState<'system' | 'security' | 'advanced'>('system');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSettings: 0
  });
  
  // Duration settings
  const [ipBlockDuration, setIpBlockDuration] = useState<number>(300); // 5 minutes default
  const [jwtExpiration, setJwtExpiration] = useState<number>(1800); // 30 minutes default
  
  // Store original values from backend for reset
  const [originalIpBlockDuration, setOriginalIpBlockDuration] = useState<number>(300);
  const [originalJwtExpiration, setOriginalJwtExpiration] = useState<number>(1800);

  useEffect(() => {
    fetchSettings();
    fetchSystemStats();
  }, []);

  useEffect(() => {
    calculatePasswordStrength(newPassword);
  }, [newPassword]);

  const fetchSystemStats = async () => {
    try {
      const response = await getUsers({ page: 1 });
      setSystemStats({
        totalUsers: response.totalUsers || 0,
        activeUsers: response.totalUsers || 0,
        totalSettings: settings.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 30) return { label: 'Yếu', color: 'bg-red-500' };
    if (passwordStrength < 60) return { label: 'Trung bình', color: 'bg-yellow-500' };
    if (passwordStrength < 80) return { label: 'Tốt', color: 'bg-blue-500' };
    return { label: 'Mạnh', color: 'bg-green-500' };
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      setSettings(response);
      setSystemStats(prev => ({ ...prev, totalSettings: response.length }));
      
      // Load duration settings from backend
      const ipBlockSetting = response.find((s: Setting) => s.key === 'BLOCK_IP_DURATION');
      const jwtSetting = response.find((s: Setting) => s.key === 'JWT_EXPIRES_IN');
      
      if (ipBlockSetting) {
        const ipValue = parseInt(ipBlockSetting.value) || 300;
        setIpBlockDuration(ipValue);
        setOriginalIpBlockDuration(ipValue); // Store original value for reset
      }
      
      if (jwtSetting) {
        // Convert JWT_EXPIRES_IN from format like "30m" to seconds
        const match = jwtSetting.value.match(/^(\d+)([smhd])$/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];
          let seconds = value;
          if (unit === 'm') seconds = value * 60;
          else if (unit === 'h') seconds = value * 3600;
          else if (unit === 'd') seconds = value * 86400;
          setJwtExpiration(seconds);
          setOriginalJwtExpiration(seconds); // Store original value for reset
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải cấu hình hệ thống"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      setSaving(key);
      await updateSetting(key, value);
      toast({
        variant: "success",
        title: "Thành công",
        description: `Đã cập nhật ${key}`
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || 'Cập nhật thất bại'
      });
    } finally {
      setSaving(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập mật khẩu hiện tại!"
      });
      return;
    }

    if (!newPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập mật khẩu mới!"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu mới không khớp!"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự!"
      });
      return;
    }

    try {
      const response = await changePassword({
        currentPassword,
        newPassword
      });
      
      console.log('Change password response:', response);
      
      toast({
        variant: "success",
        title: "Thành công",
        description: response?.message || "Đã đổi mật khẩu thành công!"
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      
      const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại';
      
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: errorMessage
      });
    }
  };

  const handleExportSettings = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `settings_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast({
      variant: "success",
      title: "Thành công",
      description: "Đã xuất cấu hình hệ thống"
    });
  };

  const handleClearCache = () => {
    if (confirm('Bạn có chắc muốn xóa cache?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      toast({
        variant: "success",
        title: "Thành công",
        description: "Đã xóa cache hệ thống"
      });
    }
  };

  const getSettingIcon = (key: string) => {
    if (key.toLowerCase().includes('mail')) return Mail;
    if (key.toLowerCase().includes('database')) return Database;
    if (key.toLowerCase().includes('api')) return Key;
    if (key.toLowerCase().includes('notification')) return Bell;
    return Globe;
  };

  const strengthInfo = getPasswordStrengthLabel();

  return (
    <DashboardLayout requireRole={['lv3']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
          <p className="mt-2 text-gray-600">Quản lý cấu hình và bảo mật cho ứng dụng</p>
        </div>

        {/* System Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tổng người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <Badge variant="secondary" className="mt-2">
                <Activity className="mr-1 h-3 w-3" />
                {systemStats.activeUsers} hoạt động
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Cấu hình
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalSettings}</div>
              <Badge variant="secondary" className="mt-2">
                <HardDrive className="mr-1 h-3 w-3" />
                Đang hoạt động
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'system'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Server className="mr-2 inline h-4 w-4" />
            Hệ thống
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'security'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="mr-2 inline h-4 w-4" />
            Bảo mật
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'advanced'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database className="mr-2 inline h-4 w-4" />
            Nâng cao
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'system' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Duration Settings - Moved from Security tab */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <CardTitle>Cấu hình thời gian bảo mật</CardTitle>
                </div>
                <CardDescription>
                  Thiết lập thời gian cho các chức năng bảo mật
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <DurationSelector
                      value={ipBlockDuration}
                      onChange={setIpBlockDuration}
                      label="Thời gian chặn IP sau đăng nhập sai"
                      description="IP sẽ bị chặn tạm thời sau nhiều lần đăng nhập thất bại"
                      min={60}
                      max={3600}
                      step={30}
                      unit="seconds"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <DurationSelector
                      value={jwtExpiration}
                      onChange={setJwtExpiration}
                      label="Thời gian hết hạn JWT Token"
                      description="Token sẽ tự động hết hiệu lực sau khoảng thời gian này"
                      min={60}
                      max={7200}
                      step={30}
                      unit="seconds"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={async () => {
                      try {
                        // Update IP Block Duration
                        await updateSetting('BLOCK_IP_DURATION', ipBlockDuration.toString());
                        
                        // Update JWT Expiration (convert seconds to minutes for env)
                        const jwtMinutes = Math.floor(jwtExpiration / 60);
                        await updateSetting('JWT_EXPIRES_IN', `${jwtMinutes}m`);
                        
                        toast({
                          variant: "success",
                          title: "Đã lưu cấu hình",
                          description: `IP Block: ${ipBlockDuration}s, JWT: ${jwtExpiration}s (${jwtMinutes}m)`
                        });
                      } catch (error: any) {
                        toast({
                          variant: "destructive",
                          title: "Lỗi",
                          description: error.response?.data?.message || 'Lưu cấu hình thất bại'
                        });
                      }
                    }}
                    disabled={saving !== null}
                  >
                    {saving ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Lưu cấu hình bảo mật
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Reset to original values from backend
                      setIpBlockDuration(originalIpBlockDuration);
                      setJwtExpiration(originalJwtExpiration);
                      toast({
                        title: "Đã đặt lại",
                        description: `Đã khôi phục về giá trị từ cấu hình: IP Block ${originalIpBlockDuration}s, JWT ${originalJwtExpiration}s`
                      });
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Đặt lại
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <CardTitle>Đổi mật khẩu</CardTitle>
                </div>
                <CardDescription>
                  Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Nhập mật khẩu hiện tại"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Độ mạnh mật khẩu:</span>
                          <span className="font-medium">{strengthInfo.label}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full transition-all ${strengthInfo.color}`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Nhập lại mật khẩu mới"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    size="lg"
                  >
                    <Shield className="h-4 w-4" />
                    Đổi mật khẩu
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Xuất/Nhập dữ liệu</CardTitle>
                <CardDescription>Sao lưu và khôi phục cấu hình</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleExportSettings}>
                  <Download className="mr-2 h-4 w-4" />
                  Xuất cấu hình (JSON)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Công cụ hệ thống</CardTitle>
                <CardDescription>Bảo trì và tối ưu hóa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-orange-600 hover:text-orange-700"
                  onClick={handleClearCache}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa cache
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
