import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportData {
  id: string;
  date: string;
  category: string;
  customerName: string;
  subject: string;
  status: string;
  responseTime: number;
  satisfaction: number;
  agent: string;
}

export const exportToPDF = (data: ExportData[], title: string = 'CS Report') => {
  const pdf = new jsPDF();
  
  // Add title
  pdf.setFontSize(18);
  pdf.text(title, 14, 22);
  
  // Add generation date
  pdf.setFontSize(11);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Create table
  const tableColumn = [
    'ID', 'Date', 'Category', 'Customer', 'Subject', 'Status', 'Response Time', 'Rating', 'Agent'
  ];
  
  const tableRows = data.map(item => [
    item.id,
    new Date(item.date).toLocaleDateString(),
    item.category,
    item.customerName,
    item.subject.substring(0, 30) + (item.subject.length > 30 ? '...' : ''),
    item.status,
    `${item.responseTime}m`,
    `${item.satisfaction}/5`,
    item.agent
  ]);

  (pdf as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  });
  
  pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToCSV = (data: ExportData[], filename: string = 'cs_report') => {
  const headers = [
    'ID', 'Date', 'Category', 'Customer Name', 'Customer Email', 'Subject', 
    'Status', 'Response Time (min)', 'Satisfaction Rating', 'Agent'
  ];
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.id,
      new Date(item.date).toLocaleDateString(),
      `"${item.category}"`,
      `"${item.customerName}"`,
      item.subject ? `"${item.subject.replace(/"/g, '""')}"` : '',
      item.status,
      item.responseTime,
      item.satisfaction,
      `"${item.agent}"`
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};