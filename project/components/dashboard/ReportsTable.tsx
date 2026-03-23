'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { ConversationReport } from '@/lib/supabase';

interface ReportsTableProps {
  reports: ConversationReport[] | null;
}

export default function ReportsTable({ reports }: ReportsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const recentReports = reports?.slice(0, 10) || [];

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Reports
          </CardTitle>
          <p className="text-sm text-gray-600">
            Latest conversation reports
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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Conversation ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Summary</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report, index) => (
                <tr 
                  key={report.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                    {report.id.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {report.conversation_id || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {report.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={report.summary || ''}>
                      {report.summary || 'No summary'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatDate(report.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reports found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}