// @ts-nocheck
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryStats } from '@/data/mockData';

export default function CategoryBarChart() {
  const categoryStats = getCategoryStats();

  // Transform data for the chart
  const chartData = categoryStats.map(stat => ({
    category: stat.category.split(' ').join('\n'), // Split long names
    resolved: stat.resolved,
    pending: stat.pending,
    escalated: stat.escalated,
    total: stat.count
  }));

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Conversations by Category
        </CardTitle>
        <p className="text-sm text-gray-600">
          Breakdown of conversation status across all categories
        </p>
      </CardHeader>
      <CardContent>
        {/* @ts-ignore */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="category"
              fontSize={11}
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar
              dataKey="resolved"
              stackId="a"
              fill="#10B981"
              name="Resolved"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="pending"
              stackId="a"
              fill="#F59E0B"
              name="Pending"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="escalated"
              stackId="a"
              fill="#EF4444"
              name="Escalated"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}