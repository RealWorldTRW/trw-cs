export interface ConversationData {
  id: string;
  date: string;
  category: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: 'resolved' | 'pending' | 'escalated';
  responseTime: number; // in minutes
  satisfaction: number; // 1-5 rating
  agent: string;
}

export interface CategoryStats {
  category: string;
  count: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  resolved: number;
  pending: number;
  escalated: number;
}

export const categories = [
  'Account Management',
  'Billing & Payments',
  'Technical Support',
  'Product Inquiries',
  'Complaints & Issues',
  'Returns & Refunds',
  'Order Status',
  'General Information',
  'Feature Requests'
];

// Mock conversations data
export const conversationsData: ConversationData[] = [
  {
    id: '1001',
    date: '2024-01-15T10:30:00Z',
    category: 'Account Management',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    subject: 'Unable to access account dashboard',
    status: 'resolved',
    responseTime: 45,
    satisfaction: 5,
    agent: 'Sarah Chen'
  },
  {
    id: '1002',
    date: '2024-01-15T14:20:00Z',
    category: 'Billing & Payments',
    customerName: 'Emily Johnson',
    customerEmail: 'emily.j@email.com',
    subject: 'Billing discrepancy on latest invoice',
    status: 'pending',
    responseTime: 120,
    satisfaction: 3,
    agent: 'Mike Rodriguez'
  },
  {
    id: '1003',
    date: '2024-01-14T09:15:00Z',
    category: 'Technical Support',
    customerName: 'David Wilson',
    customerEmail: 'david.wilson@email.com',
    subject: 'API integration issues',
    status: 'escalated',
    responseTime: 180,
    satisfaction: 2,
    agent: 'Alex Thompson'
  },
  {
    id: '1004',
    date: '2024-01-14T16:45:00Z',
    category: 'Product Inquiries',
    customerName: 'Lisa Brown',
    customerEmail: 'lisa.brown@email.com',
    subject: 'Premium features comparison',
    status: 'resolved',
    responseTime: 30,
    satisfaction: 4,
    agent: 'Sarah Chen'
  },
  {
    id: '1005',
    date: '2024-01-13T11:30:00Z',
    category: 'Complaints & Issues',
    customerName: 'Robert Davis',
    customerEmail: 'robert.davis@email.com',
    subject: 'Service interruption complaint',
    status: 'resolved',
    responseTime: 90,
    satisfaction: 4,
    agent: 'Mike Rodriguez'
  },
  {
    id: '1006',
    date: '2024-01-13T13:20:00Z',
    category: 'Returns & Refunds',
    customerName: 'Jennifer Lee',
    customerEmail: 'jennifer.lee@email.com',
    subject: 'Refund request for cancelled service',
    status: 'pending',
    responseTime: 240,
    satisfaction: 3,
    agent: 'Alex Thompson'
  },
  {
    id: '1007',
    date: '2024-01-12T08:45:00Z',
    category: 'Order Status',
    customerName: 'Michael Garcia',
    customerEmail: 'michael.g@email.com',
    subject: 'Order tracking inquiry',
    status: 'resolved',
    responseTime: 20,
    satisfaction: 5,
    agent: 'Sarah Chen'
  },
  {
    id: '1008',
    date: '2024-01-12T15:10:00Z',
    category: 'General Information',
    customerName: 'Amanda White',
    customerEmail: 'amanda.white@email.com',
    subject: 'Business hours inquiry',
    status: 'resolved',
    responseTime: 15,
    satisfaction: 5,
    agent: 'Mike Rodriguez'
  },
  {
    id: '1009',
    date: '2024-01-11T12:00:00Z',
    category: 'Feature Requests',
    customerName: 'Christopher Taylor',
    customerEmail: 'chris.taylor@email.com',
    subject: 'Request for mobile app feature',
    status: 'pending',
    responseTime: 60,
    satisfaction: 4,
    agent: 'Alex Thompson'
  },
  {
    id: '1010',
    date: '2024-01-11T17:30:00Z',
    category: 'Technical Support',
    customerName: 'Rachel Martinez',
    customerEmail: 'rachel.m@email.com',
    subject: 'Database connection error',
    status: 'resolved',
    responseTime: 75,
    satisfaction: 4,
    agent: 'Sarah Chen'
  }
];

// Generate category statistics
export const getCategoryStats = (): CategoryStats[] => {
  return categories.map(category => {
    const categoryData = conversationsData.filter(conv => conv.category === category);
    const resolved = categoryData.filter(conv => conv.status === 'resolved').length;
    const pending = categoryData.filter(conv => conv.status === 'pending').length;
    const escalated = categoryData.filter(conv => conv.status === 'escalated').length;
    
    const avgResponseTime = categoryData.length > 0 
      ? Math.round(categoryData.reduce((sum, conv) => sum + conv.responseTime, 0) / categoryData.length)
      : 0;
    
    const avgSatisfaction = categoryData.length > 0
      ? Math.round((categoryData.reduce((sum, conv) => sum + conv.satisfaction, 0) / categoryData.length) * 10) / 10
      : 0;

    return {
      category,
      count: categoryData.length,
      avgResponseTime,
      avgSatisfaction,
      resolved,
      pending,
      escalated
    };
  });
};

// Generate volume data for line chart
export const getVolumeData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    conversations: Math.floor(Math.random() * 50) + 20,
    resolved: Math.floor(Math.random() * 40) + 15,
    pending: Math.floor(Math.random() * 10) + 3
  }));
};