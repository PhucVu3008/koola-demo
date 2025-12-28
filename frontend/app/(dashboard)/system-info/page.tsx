'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getSystemInfo } from '@/lib/api';
import { checkAuth, hasRole } from '@/utils/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Code, 
  Database, 
  Shield, 
  Cpu, 
  HardDrive,
  Activity,
  Layers,
  Package,
  CheckCircle,
  Info
} from 'lucide-react';

interface SystemInfo {
  systemStats: any;
  backend: any;
  frontend: any;
  architecture: any;
  features: any;
  generatedAt: string;
}

export default function SystemInfoPage() {
  const router = useRouter();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = checkAuth();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasRole(['lv3'])) {
      router.push('/unauthorized');
      return;
    }

    fetchSystemInfo();
  }, [router]);

  const fetchSystemInfo = async () => {
    try {
      const data = await getSystemInfo();
      setSystemInfo(data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-gray-500">Đang tải thông tin hệ thống...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!systemInfo) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Không thể tải thông tin hệ thống</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thông tin hệ thống</h1>
          <p className="text-muted-foreground mt-1">
            Chi tiết về công nghệ và kiến trúc của ứng dụng
          </p>
        </div>

        {/* System Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              Thông số hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Platform</p>
                <p className="font-semibold">{systemInfo.systemStats.platform} ({systemInfo.systemStats.arch})</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Node.js Version</p>
                <p className="font-semibold">{systemInfo.systemStats.nodeVersion}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Memory</p>
                <p className="font-semibold">{systemInfo.systemStats.freeMemory} / {systemInfo.systemStats.totalMemory}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">CPU Cores</p>
                <p className="font-semibold">{systemInfo.systemStats.cpus} cores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              Kiến trúc hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(systemInfo.architecture).map(([key, value]) => (
                <div key={key} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-sm text-muted-foreground">{value as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backend Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-green-600" />
              Backend Technology Stack
            </CardTitle>
            <CardDescription>
              {systemInfo.backend.name} v{systemInfo.backend.version}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Framework */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Framework & Runtime
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{systemInfo.backend.runtime.name}</span>
                  <Badge variant="secondary">{systemInfo.backend.runtime.version}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{systemInfo.backend.framework.name}</span>
                  <Badge variant="secondary">{systemInfo.backend.framework.version}</Badge>
                </div>
              </div>
            </div>

            {/* Database */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </h3>
              <div className="flex items-center justify-between p-2 rounded border">
                <span className="text-sm">{systemInfo.backend.database.name} ({systemInfo.backend.database.driver})</span>
                <Badge variant="secondary">{systemInfo.backend.database.version}</Badge>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security & Authentication
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <span className="text-sm font-medium">{systemInfo.backend.authentication.library}</span>
                    <p className="text-xs text-muted-foreground">{systemInfo.backend.authentication.name}</p>
                  </div>
                  <Badge variant="secondary">{systemInfo.backend.authentication.version}</Badge>
                </div>
                {systemInfo.backend.security.map((sec: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <span className="text-sm font-medium">{sec.name}</span>
                      <p className="text-xs text-muted-foreground">{sec.purpose}</p>
                    </div>
                    <Badge variant="secondary">{sec.version}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilities */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Utilities
              </h3>
              <div className="space-y-2">
                {systemInfo.backend.utilities.map((util: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <span className="text-sm font-medium">{util.name}</span>
                      <p className="text-xs text-muted-foreground">{util.purpose}</p>
                    </div>
                    <Badge variant="secondary">{util.version}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frontend Tech Stack */}
        {systemInfo.frontend && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-600" />
                Frontend Technology Stack
              </CardTitle>
              <CardDescription>
                {systemInfo.frontend.name} v{systemInfo.frontend.version}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Framework */}
              <div>
                <h3 className="font-semibold mb-2">Framework & Library</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{systemInfo.frontend.framework.name}</span>
                    <Badge variant="secondary">{systemInfo.frontend.framework.version}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{systemInfo.frontend.runtime.name}</span>
                    <Badge variant="secondary">{systemInfo.frontend.runtime.version}</Badge>
                  </div>
                </div>
              </div>

              {/* Styling */}
              <div>
                <h3 className="font-semibold mb-2">Styling & UI</h3>
                <div className="space-y-2">
                  {systemInfo.frontend.styling.map((style: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <span className="text-sm font-medium">{style.name}</span>
                        {style.purpose && <p className="text-xs text-muted-foreground">{style.purpose}</p>}
                      </div>
                      <Badge variant="secondary">{style.version}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Icons */}
              <div>
                <h3 className="font-semibold mb-2">Icons</h3>
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{systemInfo.frontend.icons.name}</span>
                  <Badge variant="secondary">{systemInfo.frontend.icons.version}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Tính năng ứng dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(systemInfo.features).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold capitalize text-sm">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="space-y-1">
                    {(items as string[]).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Thông tin được tạo tự động từ package.json</span>
              <span>Cập nhật: {new Date(systemInfo.generatedAt).toLocaleString('vi-VN')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
