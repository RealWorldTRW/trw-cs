// @ts-nocheck
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EscalationDriversChart({ data }: { data: any[] }) {
    const aggregated = data.reduce((acc, row) => {
        if (row.resolution_status !== 'escalated_to_support') return acc;
        const cat = row.category || 'Undefined';
        if (!acc[cat]) {
            acc[cat] = { category: cat, escalations: 0, effort: 0 };
        }
        acc[cat].escalations += 1;
        acc[cat].effort += (row.count_conversation_parts || 0);
        return acc;
    }, {});

    const chartData = Object.values(aggregated)
        .sort((a: any, b: any) => b.escalations - a.escalations)
        .slice(0, 5); // Top 5

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Top Escalation Drivers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                            <YAxis type="category" dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#374151' }} />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar name="Escalation Volume" dataKey="escalations" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
