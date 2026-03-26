// @ts-nocheck
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ResolutionPathChart({ data }: { data: any[] }) {
    const aggregated = data.reduce((acc, row) => {
        if (!row.conversation_created_at) return acc;
        const date = new Date(row.conversation_created_at).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { date, ai_resolved: 0, escalated: 0, unresolved: 0 };
        }
        const status = row.resolution_status || 'unresolved';
        if (status === 'ai_resolved') acc[date].ai_resolved += 1;
        else if (status === 'escalated_to_support') acc[date].escalated += 1;
        else acc[date].unresolved += 1;

        return acc;
    }, {});

    const chartData = Object.values(aggregated).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    ).slice(-14);

    return (
        <Card className="col-span-full h-full">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Resolution Path Funnel</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Bar name="AI Resolved" dataKey="ai_resolved" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                            <Bar name="Escalated" dataKey="escalated" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                            <Bar name="Unresolved" dataKey="unresolved" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
