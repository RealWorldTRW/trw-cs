'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import StatCards from '@/components/dashboard/StatCards';
import CategoryChart from '@/components/dashboard/CategoryChart';
import SentimentChart from '@/components/dashboard/SentimentChart';
import ReportsTable from '@/components/dashboard/ReportsTable';
import jsPDF from 'jspdf';
import {
  getCurrentUser,
  getUserProfile,
  getConversationReports,
  getReportsByCategory,
  getReportsStats,
  getConversationReportsByDate,
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
  const [sentimentData, setSentimentData] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    today: 0,
    week: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
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

      const sentiments = (reportsResult.data ?? []).reduce((acc: Record<string, number>, report) => {
        const s = report.sentiment || 'neutral';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
      setSentimentData(sentiments);

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

  const handleGenerateReport = async (days: number, title: string) => {
    setGenerating(title);
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      const startDate = date.toISOString();

      const { data } = await getConversationReportsByDate(startDate);
      const reportData = data || [];

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(0, 100, 0); // dark green
      doc.text(title, 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Reports: ${reportData.length}`, 14, 30);

      const counts = reportData.reduce((acc, report) => {
        const cat = report.category || 'Undefined';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let yPos = 45;

      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text("Category Breakdown", 14, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      (Object.entries(counts) as [string, number][]).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.text(`${cat}: ${count}`, 14, yPos);
        yPos += 8;
      });

      yPos += 10;
      if (yPos > 260) { doc.addPage(); yPos = 20; }

      const grouped = reportData.reduce((acc, report) => {
        const cat = report.category || 'Undefined';
        if (!acc[cat]) acc[cat] = [];
        if (report.summary) acc[cat].push(report.summary);
        return acc;
      }, {} as Record<string, string[]>);

      Object.entries(grouped as Record<string, string[]>).forEach(([category, summaries]: [string, string[]]) => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");

        if (yPos > 270) { doc.addPage(); yPos = 20; }

        doc.text(`${category} Summaries:`, 14, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        if (summaries.length === 0) {
          doc.text("No summaries to display.", 14, yPos);
          yPos += 10;
        } else {
          summaries.forEach(summary => {
            const lines = doc.splitTextToSize(`• ${summary}`, 180);
            if (yPos + (lines.length * 6) > 280) { doc.addPage(); yPos = 20; }
            doc.text(lines, 14, yPos);
            yPos += (lines.length * 6) + 4;
          });
        }
        yPos += 6;
      });

      doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Failed to generate report', error);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-cyan-50 to-emerald-100">
        <Sidebar className="shadow-xl shadow-cyan-900/5 border-none" />
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
    <div className="flex h-screen bg-gradient-to-br from-cyan-50 to-emerald-100">
      <Sidebar className="shadow-xl shadow-cyan-900/5 border-none z-10" />

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
            </div>

            <ReportsTable reports={reports} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <CategoryChart data={categoryData} />
              </div>
              <div className="col-span-1">
                <SentimentChart data={sentimentData} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleGenerateReport(7, 'Weekly Report')}
                    disabled={generating !== null}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${generating === 'Weekly Report' ? 'bg-cyan-100 opacity-50' : 'bg-cyan-50 hover:bg-cyan-100 border border-cyan-100'}`}
                  >
                    <div className="font-medium text-cyan-900">{generating === 'Weekly Report' ? 'Generating...' : 'Generate Weekly Report'}</div>
                    <div className="text-sm text-cyan-700/80">Download automated PDF for the last 7 days</div>
                  </button>
                  <button
                    onClick={() => handleGenerateReport(30, 'Monthly Report')}
                    disabled={generating !== null}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${generating === 'Monthly Report' ? 'bg-emerald-100 opacity-50' : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-100'}`}
                  >
                    <div className="font-medium text-emerald-900">{generating === 'Monthly Report' ? 'Generating...' : 'Generate Monthly Report'}</div>
                    <div className="text-sm text-emerald-700/80">Download automated PDF for the last 30 days</div>
                  </button>
                  <button
                    onClick={() => handleGenerateReport(90, 'Quarterly Report')}
                    disabled={generating !== null}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${generating === 'Quarterly Report' ? 'bg-teal-100 opacity-50' : 'bg-teal-50 hover:bg-teal-100 border border-teal-100'}`}
                  >
                    <div className="font-medium text-teal-900">{generating === 'Quarterly Report' ? 'Generating...' : 'Generate Quarterly Report'}</div>
                    <div className="text-sm text-teal-700/80">Download automated PDF for the last 90 days</div>
                  </button>
                </div>
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  );
}