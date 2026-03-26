// @ts-nocheck
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FrictionSignalsChart({ data }: { data: any[] }) {
    const aggregated = data.reduce((acc, row) => {
        // Only track if there's a specific leaky bucket reason or tags indicate friction
        const reason = row.leaky_bucket_reason;
        if (!reason) return acc;

        // abbreviate long reasons for chart
        const label = reason.length > 25 ? reason.substring(0, 25) + '...' : reason;

        if (!acc[label]) {
            acc[label] = { reason: label, volume: 0, full_reason: reason };
        }
        acc[label].volume += 1;
        return acc;
    }, {});

    const chartData = Object.values(aggregated)
        .sort((a: any, b: any) => b.volume - a.volume)
        .slice(0, 5); // Top 5

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Root Causes (Friction Signals)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                            <YAxis type="category" dataKey="reason" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#374151', width: 140 }} />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(label, payload) => payload[0]?.payload?.full_reason || label}
                            />
                            <Bar name="Occurrences" dataKey="volume" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
