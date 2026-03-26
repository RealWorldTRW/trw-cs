// @ts-nocheck
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function EffortByDayChart({ data }: { data: any[] }) {
    // data comes in as array of raw report rows
    const aggregated = data.reduce((acc, row) => {
        if (!row.conversation_created_at) return acc;
        const date = new Date(row.conversation_created_at).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { date, volume: 0, effort: 0 };
        }
        acc[date].volume += 1;
        acc[date].effort += (row.count_conversation_parts || 0);
        return acc;
    }, {});

    // Convert to array and sort by date
    const chartData = Object.values(aggregated).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    ).slice(-14);

    return (
        <Card className="col-span-full h-full">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Ticket Volume vs Support Effort (Last 14 Days)</CardTitle>
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
                            <Bar name="Raw Ticket Volume" dataKey="volume" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                            <Bar name="Human Support Effort (Replies)" dataKey="effort" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
