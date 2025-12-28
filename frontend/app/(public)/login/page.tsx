'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSession } from '@/lib/api';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  UserX, 
  KeyRound,
  Shield,
  Loader2,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getUsernameError, USERNAME_MAX_LENGTH } from '@/lib/validation';

interface LoginForm {
  username: string;
  password: string;
}

interface ErrorResponse {
  message: string;
  code?: string;
  remainingAttempts?: number;
  remainingTime?: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createSession(data);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      router.push('/dashboard');
    } catch (err: any) {
      const errorData = err.response?.data;
      setError({
        message: errorData?.message || 'Đăng nhập thất bại',
        code: errorData?.code,
        remainingAttempts: errorData?.remainingAttempts,
        remainingTime: errorData?.remainingTime
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorIcon = () => {
    if (!error?.code) return AlertCircle;
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return KeyRound;
      case 'USER_NOT_FOUND':
        return UserX;
      case 'INVALID_PASSWORD':
        return KeyRound;
      case 'IP_BLOCKED':
        return ShieldAlert;
      default:
        return AlertCircle;
    }
  };

  const getErrorVariant = () => {
    if (!error?.code) return 'destructive';
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return 'destructive';
      case 'USER_NOT_FOUND':
        return 'warning';
      case 'INVALID_PASSWORD':
        return 'destructive';
      case 'IP_BLOCKED':
        return 'destructive';
      default:
        return 'destructive';
    }
  };

  const ErrorIcon = getErrorIcon();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại</h1>
          <p className="text-muted-foreground mt-2">Đăng nhập vào hệ thống Koola</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>Nhập thông tin đăng nhập của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {error && (
              <Alert variant={getErrorVariant() as any} className="mb-6">
                <ErrorIcon className="h-4 w-4" />
                <AlertTitle>{error.message}</AlertTitle>
                {error.code === 'IP_BLOCKED' && error.remainingTime && (
                  <AlertDescription>
                    Vui lòng đợi {error.remainingTime} giây trước khi thử lại
                  </AlertDescription>
                )}
                {error.code !== 'IP_BLOCKED' && error.remainingAttempts !== undefined && error.remainingAttempts > 0 && (
                  <AlertDescription>
                    Còn lại {error.remainingAttempts} lần thử
                  </AlertDescription>
                )}
                {error.code !== 'IP_BLOCKED' && error.remainingAttempts === 0 && (
                  <AlertDescription>
                    Tài khoản sẽ bị khóa tạm thời sau lần thử tiếp theo
                  </AlertDescription>
                )}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    {...register('username', { 
                      required: 'Vui lòng nhập tên đăng nhập',
                      validate: (value) => {
                        const errorMessage = getUsernameError(value);
                        return errorMessage || true;
                      }
                    })}
                    className="pl-10"
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={USERNAME_MAX_LENGTH}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    {...register('password', { 
                      required: 'Vui lòng nhập mật khẩu',
                      minLength: {
                        value: 6,
                        message: 'Mật khẩu phải có ít nhất 6 ký tự'
                      }
                    })}
                    className="pl-10 pr-10"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Đăng nhập
                  </>
                )}
              </Button>
            </form>

            {/* Test Accounts */}
            <details className="mt-6 pt-4 border-t">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center justify-between">
                <span>Tài khoản test</span>
                <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-green-600" />
                    <span>Admin (lv3)</span>
                  </div>
                  <code className="font-mono">admin / admin123</code>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-blue-600" />
                    <span>User lv2</span>
                  </div>
                  <code className="font-mono">user_lv2 / user123</code>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-slate-600" />
                    <span>User lv1</span>
                  </div>
                  <code className="font-mono">user_lv1 / user123</code>
                </div>
              </div>
            </details>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          © 2025 Koola System. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}
