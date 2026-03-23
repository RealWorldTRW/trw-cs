'use client';

'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryChartProps {
  data: Record<string, number> | null;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data ? Object.entries(data).map(([category, count]) => ({
    category: category.length > 15 ? category.substring(0, 15) + '...' : category,
    count
  })) : [];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Reports by Category
        </CardTitle>
        <p className="text-sm text-gray-600">
          Distribution of conversation reports across categories
        </p>
      </CardHeader>
      <CardContent>
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
            <Bar 
              dataKey="count" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}