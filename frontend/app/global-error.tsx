'use client';

import Link from 'next/link';
import { ServerCrash, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <ServerCrash className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Lỗi hệ thống nghiêm trọng</CardTitle>
              <CardDescription className="text-base">
                Hệ thống gặp lỗi nghiêm trọng. Vui lòng thử lại sau.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error.message && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800 font-mono break-all">
                    {error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={reset} className="w-full">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Tải lại trang
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Về trang chủ
                  </Link>
                </Button>
              </div>
              
              <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  Nếu lỗi vẫn tiếp tục, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật.
                </p>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: <code className="font-mono">{error.digest}</code>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
