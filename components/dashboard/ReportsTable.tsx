'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, SlidersHorizontal, DownloadCloud, AlertCircle, MessageSquare } from 'lucide-react';
import { ConversationReport } from '@/lib/supabase';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const getSentimentColor = (sentiment: string | null) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive': return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
    case 'negative': return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
    case 'neutral': return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200';
  }
};

const getStatusColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'ai_resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'escalated': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'unresolved': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const parseJsonData = (data: any) => {
  if (!data) return null;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return null; }
  }
  return data;
};

export default function ReportsTable({ reports }: ReportsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [filterCategory, setFilterCategory] = useState<string>('All Categories');
  const [selectedReport, setSelectedReport] = useState<ConversationReport | null>(null);

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
    (currentPage * itemsPerPage)
  );

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Conversation Reports", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    let yPos = 40;

    const grouped = filteredReports.reduce((acc, report) => {
      const cat = report.category || 'Undefined';
      if (!acc[cat]) acc[cat] = [];
      if (report.summary) acc[cat].push(report.summary);
      return acc;
    }, {} as Record<string, string[]>);

    doc.setTextColor(0);

    Object.entries(grouped).forEach(([category, summaries]) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(`${category}:`, 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      if (summaries.length === 0) {
        doc.text("No summaries available.", 14, yPos);
        yPos += 10;
      } else {
        summaries.forEach(summary => {
          const lines = doc.splitTextToSize(summary, 180);

          if (yPos + (lines.length * 6) > 280) {
            doc.addPage();
            yPos = 20;
          }

          doc.text(lines, 14, yPos);
          yPos += (lines.length * 6) + 6;
        });
      }

      yPos += 4;
    });

    doc.save('grouped-reports.pdf');
  };

  const selectedTags = parseJsonData(selectedReport?.tags);
  const selectedHistory = parseJsonData(selectedReport?.conversation_history);

  return (
    <>
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
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <DownloadCloud className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-100 mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 w-24">ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 w-32">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="py-3 px-4 text-xs font-mono text-gray-500 group-hover:text-primary transition-colors">
                      {report.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                        {report.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {report.resolution_status ? (
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.resolution_status)}`}>
                          {report.resolution_status.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {report.sentiment ? (
                        <Badge variant="outline" className={`capitalize ${getSentimentColor(report.sentiment)}`}>
                          {report.sentiment}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-800 line-clamp-2 max-w-xs" title={report.summary || ''}>
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
                    <td colSpan={6} className="py-12 text-center text-gray-500 bg-gray-50/50">
                      No reports match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-gray-50 p-0 border-0 shadow-2xl">
          <div className="p-6 pb-4 bg-white border-b border-gray-100">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Conversation Details
                </DialogTitle>
                <div className="flex gap-2">
                  {selectedReport?.resolution_status && (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedReport.resolution_status)}`}>
                      {selectedReport.resolution_status.replace('_', ' ')}
                    </span>
                  )}
                  {selectedReport?.sentiment && (
                    <Badge variant="outline" className={`capitalize ${getSentimentColor(selectedReport.sentiment)}`}>
                      {selectedReport.sentiment}
                    </Badge>
                  )}
                </div>
              </div>
              <DialogDescription className="text-sm">
                ID: {selectedReport?.id} {selectedReport?.conversation_id && `• Converation: ${selectedReport.conversation_id}`}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedReport?.quick_insight && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Quick Insight
                  </h4>
                  <p className="text-sm text-gray-700">{selectedReport.quick_insight}</p>
                </div>
              )}

              {selectedTags && (
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attached Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(selectedTags).map(([key, vals]: [string, any]) => {
                      if (!Array.isArray(vals)) return null;
                      return vals.map(val => (
                        <Badge key={`${key}-${val}`} variant="secondary" className="text-xs bg-gray-100 hover:bg-gray-200">
                          {key}: {val}
                        </Badge>
                      ));
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Chat History</h4>
            {selectedHistory && Array.isArray(selectedHistory) ? (
              <div className="space-y-4">
                {selectedHistory.map((msg: any, i: number) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isUser
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                        }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">
                No chat history available.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}