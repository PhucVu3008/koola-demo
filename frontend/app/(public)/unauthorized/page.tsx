'use client';

import Link from 'next/link';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <ShieldAlert className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Không có quyền truy cập</CardTitle>
          <CardDescription className="text-base">
            Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản có quyền phù hợp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
            <h3 className="font-semibold text-sm text-orange-900 mb-2">
              Các nguyên nhân có thể:
            </h3>
            <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
              <li>Phiên đăng nhập đã hết hạn</li>
              <li>Tài khoản không có quyền truy cập</li>
              <li>Trang yêu cầu quyền cao hơn</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/login">
                Đăng nhập lại
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
