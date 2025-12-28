'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

interface SidebarProps {
  user: any;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ user, collapsed, setCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Navigation is filtered by role so UI matches backend permissions.
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
      roles: ['lv1', 'lv2', 'lv3']
    },
    {
      icon: Users,
      label: 'Quản lý User',
      href: '/users',
      roles: ['lv1', 'lv2', 'lv3']  // ✅ lv1 được xem danh sách user
    },
    {
      icon: Settings,
      label: 'Cài đặt',
      href: '/settings',
      roles: ['lv3']
    },
    {
      icon: Info,
      label: 'Thông tin hệ thống',
      href: '/system-info',
      roles: ['lv3']
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'lv3': return 'Admin';
      case 'lv2': return 'Manager';
      case 'lv1': return 'User';
      default: return role;
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Toggle */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">Koola Admin</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className={cn(collapsed && "mx-auto")}>
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-sm">{user?.username}</p>
                  <p className="truncate text-xs text-gray-500">{getRoleLabel(user?.role)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    collapsed && "justify-center px-2",
                    isActive && "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                  )}
                  onClick={() => {
                    router.push(item.href);
                    setMobileOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700",
                collapsed && "justify-center px-2"
              )}
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={logoutOpen}
        title="Xác nhận đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmLabel="Đăng xuất"
        cancelLabel="Hủy"
        destructive
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          handleLogout();
        }}
      />
    </>
  );
}
