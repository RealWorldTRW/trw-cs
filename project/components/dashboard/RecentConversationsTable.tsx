'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, Star } from 'lucide-react';
import { conversationsData } from '@/data/mockData';

export default function RecentConversationsTable() {
  // Get the 8 most recent conversations
  const recentConversations = conversationsData
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'escalated':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSatisfactionStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Conversations
          </CardTitle>
          <p className="text-sm text-gray-600">
            Latest customer service interactions
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Subject</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Response Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rating</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Agent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentConversations.map((conversation, index) => (
                <tr 
                  key={conversation.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                    #{conversation.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {conversation.customerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {conversation.customerEmail}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={conversation.subject}>
                      {conversation.subject}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {conversation.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant="secondary"
                      className={getStatusColor(conversation.status)}
                    >
                      {conversation.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {conversation.responseTime}m
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      {getSatisfactionStars(conversation.satisfaction)}
                      <span className="text-xs text-gray-500 ml-2">
                        ({conversation.satisfaction}/5)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {conversation.agent}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatDate(conversation.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}