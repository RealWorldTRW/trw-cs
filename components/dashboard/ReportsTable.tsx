'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SlidersHorizontal, DownloadCloud } from 'lucide-react';
import { ConversationReport } from '@/lib/supabase';

interface ReportsTableProps {
  reports: ConversationReport[] | null;
}

const CATEGORIES = [
  'All Categories',
  'Membership',
  'Cancel',
  'Basic support query',
  'Refund',
  'Undefined',
  'Frustration',
  'Bug',
  'Usability',
  'Trust'
];

export default function ReportsTable({ reports }: ReportsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [filterCategory, setFilterCategory] = useState<string>('All Categories');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    if (filterCategory === 'All Categories') return reports;
    return reports.filter(r => r.category.toLowerCase().includes(filterCategory.toLowerCase()));
  }, [reports, filterCategory]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className="col-span-full border-border shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-gray-900">
            Categorized Reports
          </CardTitle>
          <CardDescription>
            Filter and sort recent conversation reports by category
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
            <SlidersHorizontal className="w-4 h-4 text-gray-500 ml-2" />
            <select
              className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 py-1 pr-8 cursor-pointer"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <DownloadCloud className="w-4 h-4 mr-2" />
            Export Current View
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-gray-100 mb-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 w-24">ID</th>
                <th className="py-3 px-4">Conversation ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4 w-32">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-primary/5 transition-colors group"
                >
                  <td className="py-3 px-4 text-xs font-mono text-gray-500 group-hover:text-primary transition-colors">
                    {report.id.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {report.conversation_id || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                      {report.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-800 line-clamp-2 max-w-sm" title={report.summary || ''}>
                      {report.summary || 'No summary'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {formatDate(report.created_at)}
                  </td>
                </tr>
              ))}
              {paginatedReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 bg-gray-50/50">
                    No reports match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              className="border border-gray-200 rounded p-1 focus:ring-primary focus:border-primary"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Showing {filteredReports.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}