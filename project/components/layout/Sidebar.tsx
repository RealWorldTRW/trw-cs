'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChartBar as BarChart3, Users, Settings, FileText, Bell, Chrome as Home, TrendingUp, MessageSquare } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, current: true },
  { name: 'Reports', href: '/reports', icon: BarChart3, current: false },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare, current: false },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, current: false },
  { name: 'Users', href: '/users', icon: Users, current: false },
  { name: 'Documents', href: '/documents', icon: FileText, current: false },
  { name: 'Notifications', href: '/notifications', icon: Bell, current: false },
  { name: 'Settings', href: '/settings', icon: Settings, current: false },
];

export default function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("flex flex-col w-64 bg-white border-r border-gray-200", className)}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">TRW CS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                item.current
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mr-3",
                item.current ? "text-blue-700" : "text-gray-400"
              )} />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}