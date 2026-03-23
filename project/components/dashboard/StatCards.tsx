'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Calendar, ChartBar as BarChart3, Folder } from 'lucide-react';

interface StatCardsProps {
  stats: {
    total: number;
    today: number;
    week: number;
    categories: number;
  } | null;
}

export default function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: 'Total Reports',
      value: stats?.total?.toString() || '0',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      title: 'Today',
      value: stats?.today?.toString() || '0',
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'This Week',
      value: stats?.week?.toString() || '0',
      icon: BarChart3,
      color: 'amber'
    },
    {
      title: 'Categories',
      value: stats?.categories?.toString() || '0',
      icon: Folder,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${getColorClasses(card.color)}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}