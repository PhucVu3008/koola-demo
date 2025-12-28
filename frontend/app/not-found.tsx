'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <span className="text-4xl font-bold text-red-600">404</span>
          </div>
          <CardTitle className="text-2xl">Không tìm thấy trang</CardTitle>
          <CardDescription className="text-base">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
          
          <div className="pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
