'use client';

import React from 'react';
import { Bell, Search, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/lib/supabase';

interface TopNavProps {
  title?: string;
  user?: { email?: string | null } | null;
  profile?: Profile | null;
}

export default function TopNav({ title = 'Dashboard', user, profile }: TopNavProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'admin':
        return 'text-red-600';
      case 'veteran':
        return 'text-purple-600';
      default:
        return 'text-blue-600';
    }
  };

  const getRankIcon = (rank: string) => {
    if (rank === 'admin' || rank === 'veteran') {
      return <Shield className="w-3 h-3" />;
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reports..."
            className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>

          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {user?.email || 'User'}
            </div>

            {profile?.rank && (
              <div className={`flex items-center space-x-1 text-xs ${getRankColor(profile.rank)}`}>
                {getRankIcon(profile.rank)}
                <span className="capitalize">{profile.rank}</span>
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}