'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import StatCards from '@/components/dashboard/StatCards';
import EffortByDayChart from '@/components/dashboard/EffortByDayChart';
import ResolutionPathChart from '@/components/dashboard/ResolutionPathChart';
import EscalationDriversChart from '@/components/dashboard/EscalationDriversChart';
import FrictionSignalsChart from '@/components/dashboard/FrictionSignalsChart';
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
  effort: number;
  escalations: number;
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
    effort: 0,
    escalations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
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
          effort: 0,
          escalations: 0,
        }
      );
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (days: number | null, title: string) => {
    setGenerating(title);
    try {
      let startDateStr = '';
      let endDateStr: string | undefined = undefined;

      if (days !== null) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        startDateStr = date.toISOString();
      } else {
        // Custom dates
        startDateStr = new Date(customStart).toISOString();
        if (customEnd) {
          endDateStr = customEnd; // Supabase func handles the T23:59:59 append
        }
      }

      const { data } = await getConversationReportsByDate(startDateStr, endDateStr);
      const reportData = data || [];

      let aiInsights = "";
      try {
        const aiResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reports: reportData, timeframeTitle: title })
        });
        if (aiResponse.ok) {
          const aiJson = await aiResponse.json();
          aiInsights = aiJson.analysis || "";
        }
      } catch (err) {
        console.warn("Failed to fetch AI insights", err);
      }

      const doc = new jsPDF();
      doc.setFontSize(24);
      doc.setTextColor(6, 78, 59); // emerald-900
      doc.setFont("helvetica", "bold");
      doc.text(`Intelligence Report: ${title}`, 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()} | Covering past ${days || 'custom'} days`, 14, 30);

      // --- CALCULATIONS ---
      const totalTickets = reportData.length;
      let totalEffort = 0;
      let aiResolved = 0;
      let escalatedCount = 0;
      let openPending = 0;
      let humanResolved = 0;

      const categoryEscalations: Record<string, number> = {};
      const dateVolume: Record<string, { vol: number, effort: number }> = {};

      reportData.forEach(r => {
        totalEffort += (r.count_conversation_parts || 0);

        const cat = r.category || 'Undefined';
        const status = r.resolution_status || 'unresolved';

        if (status === 'ai_resolved') aiResolved++;
        else if (status === 'escalated_to_support') {
          escalatedCount++;
          categoryEscalations[cat] = (categoryEscalations[cat] || 0) + 1;
        }
        else if (status === 'human_resolved') humanResolved++;
        else openPending++;

        if (r.conversation_created_at) {
          const d = new Date(r.conversation_created_at).toLocaleDateString();
          if (!dateVolume[d]) dateVolume[d] = { vol: 0, effort: 0 };
          dateVolume[d].vol += 1;
          dateVolume[d].effort += (r.count_conversation_parts || 0);
        }
      });

      const escalationRate = totalTickets > 0 ? Math.round((escalatedCount / totalTickets) * 100) : 0;

      let yPos = 45;

      // === PAGE 1: EXECUTIVE DASHBOARD ===
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", 14, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50);
      doc.text(`Total Conversations: ${totalTickets}`, 14, yPos);
      doc.text(`Total Human Support Effort (Replies): ${totalEffort}`, 85, yPos);
      yPos += 8;

      doc.text(`Resolution Split:`, 14, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.text(`• AI Handled: ${aiResolved} (${totalTickets > 0 ? Math.round((aiResolved / totalTickets) * 100) : 0}%)`, 18, yPos); yPos += 5;
      doc.text(`• Escalated to Human: ${escalatedCount} (${escalationRate}%)`, 18, yPos); yPos += 5;
      doc.text(`• Human Resolved: ${humanResolved}`, 18, yPos); yPos += 5;
      doc.text(`• Open / Pending: ${openPending}`, 18, yPos); yPos += 12;

      // AI STRATEGIC INSIGHTS on PAGE 1
      doc.setFontSize(16);
      doc.setTextColor(6, 78, 59);
      doc.setFont("helvetica", "bold");
      doc.text("Operational Intelligence", 14, yPos);
      yPos += 10;

      if (aiInsights && aiInsights.length > 0) {
        const insightsLines = doc.splitTextToSize(aiInsights, 180);
        insightsLines.forEach((line: string) => {
          if (yPos > 280) { doc.addPage(); yPos = 20; }
          const trimmed = line.trim();

          if (trimmed.startsWith('###') || trimmed.startsWith('**')) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(0);
            yPos += 4;
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(50);
          }

          doc.text(trimmed.replace(/### |\*\*/g, ''), 14, yPos);
          yPos += trimmed.startsWith('###') ? 8 : 6;
        });
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50);
        doc.text("No AI insights generated for this period.", 14, yPos);
      }

      // === PAGE 2: TRAFFIC & EFFORT ANALYTICS ===
      doc.addPage();
      yPos = 22;
      doc.setFontSize(18);
      doc.setTextColor(6, 78, 59);
      doc.setFont("helvetica", "bold");
      doc.text("Traffic & Effort Analytics", 14, yPos);
      yPos += 15;

      const dateArray = Object.entries(dateVolume).map(([date, data]) => ({ date, ...data }));

      const topVolumeDays = [...dateArray].sort((a, b) => b.vol - a.vol).slice(0, 5);
      const maxVol = topVolumeDays.length > 0 ? topVolumeDays[0].vol : 1;

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Busiest Days (By Volume)", 14, yPos);
      yPos += 10;
      doc.setFontSize(11);

      topVolumeDays.forEach((d) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50);
        doc.text(`${d.date}`, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${d.vol} threads`, 170, yPos);
        yPos += 4;

        doc.setFillColor(59, 130, 246); // blue
        doc.rect(14, yPos, (d.vol / maxVol) * 180 || 1, 6, 'F');
        yPos += 12;
      });
      yPos += 10;

      const topEffortDays = [...dateArray].sort((a, b) => b.effort - a.effort).slice(0, 5);
      const maxEffort = topEffortDays.length > 0 ? topEffortDays[0].effort : 1;

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text("Highest Effort Days (By Admin Replies)", 14, yPos);
      yPos += 10;
      doc.setFontSize(11);

      topEffortDays.forEach((d) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50);
        doc.text(`${d.date}`, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${d.effort} parts`, 170, yPos);
        yPos += 4;

        doc.setFillColor(245, 158, 11); // amber
        doc.rect(14, yPos, (d.effort / maxEffort) * 180 || 1, 6, 'F');
        yPos += 12;
      });

      // === PAGE 3: RESOLUTION BREAKDOWN BY CATEGORY ===
      doc.addPage();
      yPos = 22;
      doc.setFontSize(18);
      doc.setTextColor(6, 78, 59);
      doc.setFont("helvetica", "bold");
      doc.text("Top Escalation Drivers", 14, yPos);
      yPos += 15;

      const topEscalations = Object.entries(categoryEscalations).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const maxEsc = topEscalations.length > 0 ? topEscalations[0][1] : 1;

      doc.setFontSize(12);
      doc.setTextColor(0);
      if (topEscalations.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.text("No escalations recorded in this period.", 14, yPos);
      } else {
        topEscalations.forEach(([cat, count]) => {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(50);
          doc.text(`${cat}`, 14, yPos);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(220, 38, 38); // red
          doc.text(`${count} escalations`, 150, yPos);
          yPos += 4;

          doc.setFillColor(239, 68, 68); // red
          doc.rect(14, yPos, (count / maxEsc) * 180 || 1, 6, 'F');
          doc.setTextColor(0);
          yPos += 14;
        });
      }

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
              <EffortByDayChart data={reports} />
              <ResolutionPathChart data={reports} />
              <EscalationDriversChart data={reports} />
              <FrictionSignalsChart data={reports} />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-4">
                  {/* Custom Date Filter */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col gap-3">
                    <div className="text-sm font-semibold text-gray-700">Custom Date Range</div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="date"
                        className="border border-gray-200 p-2 rounded text-sm w-full bg-white text-gray-800 focus:ring-primary focus:border-primary"
                        value={customStart}
                        onChange={e => setCustomStart(e.target.value)}
                      />
                      <input
                        type="date"
                        className="border border-gray-200 p-2 rounded text-sm w-full bg-white text-gray-800 focus:ring-primary focus:border-primary"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => handleGenerateReport(null, `Custom Report (${customStart} to ${customEnd || 'Present'})`)}
                      disabled={generating !== null || !customStart}
                      className="w-full text-center p-2.5 mt-1 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating === `Custom Report (${customStart} to ${customEnd || 'Present'})` ? 'Generating...' : 'Generate Custom Report'}
                    </button>
                  </div>

                  <hr className="border-gray-100" />

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