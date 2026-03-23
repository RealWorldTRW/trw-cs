'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';
import { exportToPDF, exportToCSV } from '@/lib/exportUtils';
import { conversationsData } from '@/data/mockData';

export default function ExportButtons() {
  const handlePDFExport = () => {
    const exportData = conversationsData.map(conv => ({
      id: conv.id,
      date: conv.date,
      category: conv.category,
      customerName: conv.customerName,
      subject: conv.subject,
      status: conv.status,
      responseTime: conv.responseTime,
      satisfaction: conv.satisfaction,
      agent: conv.agent
    }));

    exportToPDF(exportData, 'TRW CS Reports');
  };

  const handleCSVExport = () => {
    const exportData = conversationsData.map(conv => ({
      id: conv.id,
      date: conv.date,
      category: conv.category,
      customerName: conv.customerName,
      subject: conv.subject,
      status: conv.status,
      responseTime: conv.responseTime,
      satisfaction: conv.satisfaction,
      agent: conv.agent
    }));

    exportToCSV(exportData, 'trw_cs_reports');
  };

  return (
    <div className="flex items-center space-x-3">
      <Button 
        onClick={handlePDFExport}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <FileText className="w-4 h-4" />
        <span>Export PDF</span>
      </Button>
      
      <Button 
        onClick={handleCSVExport}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Table className="w-4 h-4" />
        <span>Export CSV</span>
      </Button>
      
      <Button 
        variant="default"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Generate Report</span>
      </Button>
    </div>
  );
}