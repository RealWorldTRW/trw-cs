'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { getCurrentUser, getUserProfile } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';
import { FileText, Download, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type AuthUser = {
    id: string;
    email?: string | null;
};

// This represents the structure of the new table
export interface DownloadedReport {
    id: string;
    report_type: 'weekly' | 'monthly' | 'quarterly';
    created_at: string;
    file_url: string;
    file_name: string;
}

export default function ReportsPage() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [reports, setReports] = useState<DownloadedReport[]>([]);
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

            await loadReports();
        };

        checkAuth();
    }, [router]);

    const loadReports = async () => {
        // This is where you would fetch from supabase:
        // const { data } = await supabase.from('downloaded_reports').select('*').order('created_at', { ascending: false });
        // For now, using mock data while the user sets up the table
        setTimeout(() => {
            setReports([
                {
                    id: '1',
                    report_type: 'weekly',
                    created_at: new Date().toISOString(),
                    file_name: 'Weekly_Report_Mar23.pdf',
                    file_url: '#'
                },
                {
                    id: '2',
                    report_type: 'monthly',
                    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    file_name: 'Monthly_Report_Feb.pdf',
                    file_url: '#'
                }
            ]);
            setLoading(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNav title="Reports Hub" user={null} profile={null} />
                    <main className="flex-1 p-6 flex justify-center items-center">
                        <div className="animate-pulse flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-500">Loading reports...</span>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNav title="Reports Hub" user={user} profile={profile} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-full mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-primary" />
                                    Generated Reports
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Access and download your historically generated reports.
                                </p>
                            </div>
                        </div>

                        <Card className="border border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Available Downloads</CardTitle>
                                <CardDescription>All weekly, monthly, and quarterly reports that have been generated.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-white dark:bg-card border border-border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-muted text-gray-600 dark:text-gray-300 font-medium">
                                            <tr>
                                                <th className="py-4 px-6 border-b border-border">Report Type</th>
                                                <th className="py-4 px-6 border-b border-border">File Name</th>
                                                <th className="py-4 px-6 border-b border-border">Date Generated</th>
                                                <th className="py-4 px-6 border-b border-border text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {reports.map((report) => (
                                                <tr key={report.id} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="py-4 px-6 font-medium capitalize flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                                        <Clock className="w-4 h-4 text-primary" />
                                                        {report.report_type}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                                                        {report.file_name}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-500 text-xs">
                                                        {new Date(report.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <a
                                                            href={report.file_url}
                                                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                                                        >
                                                            <Download className="w-4 h-4" /> Download
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                            {reports.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center text-gray-500">
                                                        No reports have been generated yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </main>
            </div>
        </div>
    );
}
