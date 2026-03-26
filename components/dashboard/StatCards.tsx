'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, AlertTriangle, Activity } from 'lucide-react';

interface StatCardsProps {
  stats: {
    total: number;
    effort: number;
    escalations: number;
  } | null;
}

export default function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: 'Total Volume (30d)',
      value: stats?.total?.toString() || '0',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      title: 'Human Support Effort',
      value: stats?.effort?.toString() || '0',
      icon: Activity,
      color: 'amber'
    },
    {
      title: 'Escalation Rate',
      value: `${stats?.escalations || 0}%`,
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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