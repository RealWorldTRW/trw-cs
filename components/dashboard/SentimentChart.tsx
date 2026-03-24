// @ts-nocheck
'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SentimentChartProps {
    data: Record<string, number> | null;
}

const COLORS: Record<string, string> = {
    positive: '#10B981', // green-500
    negative: '#EF4444', // red-500
    neutral: '#9CA3AF',  // gray-400
    other: '#6366F1'     // indigo-500
};

export default function SentimentChart({ data }: SentimentChartProps) {
    const chartData = data
        ? Object.entries(data)
            .filter(([_, count]) => count > 0)
            .map(([sentiment, count]) => ({
                name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
                value: count,
                rawKey: sentiment.toLowerCase()
            }))
        : [];

    return (
        <Card className="col-span-1 border-border shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Sentiment Analysis
                </CardTitle>
                <CardDescription>
                    Overall satisfaction detected in conversations
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center flex-col items-center">
                <div className="h-[250px] w-full">
                    {/* @ts-ignore */}
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[entry.rawKey] || COLORS.other}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
