'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import StatCards from '@/components/dashboard/StatCards';
import CategoryChart from '@/components/dashboard/CategoryChart';
import ReportsTable from '@/components/dashboard/ReportsTable';
import {
  getCurrentUser,
  getUserProfile,
  getConversationReports,
  getReportsByCategory,
  getReportsStats,
} from '@/lib/supabase';
import type { ConversationReport, Profile } from '@/lib/supabase';

type DashboardStats = {
  total: number;
  today: number;
  week: number;
  categories: number;
};

type AuthUser = {
  id: string;
  email?: string | null;
};

export default function Dashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reports, setReports] = useState<ConversationReport[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    today: 0,
    week: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { user, error } = await getCurrentUser();

      if (error || !user) {
        router.push('/sign-in');
        return;
      }

      setUser({ id: user.id, email: user.email });

      const { data: profileData } = await getUserProfile(user.id);
      setProfile(profileData ?? null);

      await loadData();
    };

    checkAuth();
  }, [router]);

  const loadData = async () => {
    try {
      const [reportsResult, categoryResult, statsResult] = await Promise.all([
        getConversationReports(),
        getReportsByCategory(),
        getReportsStats(),
      ]);

      setReports(reportsResult.data ?? []);
      setCategoryData(categoryResult.data ?? {});
      setStats(
        statsResult.data ?? {
          total: 0,
          today: 0,
          week: 0,
          categories: 0,
        }
      );
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav title="TRW CS Reports" user={user} profile={profile} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-full mx-auto space-y-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-80 bg-gray-200 rounded mb-6"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav title="TRW CS Reports" user={user} profile={profile} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-full mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Service Reports</h1>
                <p className="text-gray-600 mt-2">
                  Monitor and analyze conversation reports
                  {profile && (
                    <span className="ml-2 text-sm">
                      • Logged in as <span className="font-medium capitalize">{profile.rank}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            <StatCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryChart data={categoryData} />
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <div className="font-medium text-blue-900">Add New Report</div>
                    <div className="text-sm text-blue-700">Create a new conversation report</div>
                  </button>
                  <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <div className="font-medium text-green-900">Export Data</div>
                    <div className="text-sm text-green-700">Download reports as CSV</div>
                  </button>
                  {profile?.rank === 'admin' && (
                    <button className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <div className="font-medium text-red-900">Admin Panel</div>
                      <div className="text-sm text-red-700">Manage users and system settings</div>
                    </button>
                  )}
                  <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <div className="font-medium text-purple-900">View Analytics</div>
                    <div className="text-sm text-purple-700">Detailed performance metrics</div>
                  </button>
                </div>
              </div>
            </div>

            <ReportsTable reports={reports} />
          </div>
        </main>
      </div>
    </div>
  );
}