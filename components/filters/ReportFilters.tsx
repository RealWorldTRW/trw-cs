'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { categories } from '@/data/mockData';

interface ReportFiltersProps {
  onFiltersChange?: (filters: {
    timeframe: string;
    category: string;
    status: string;
  }) => void;
}

export default function ReportFilters({ onFiltersChange }: ReportFiltersProps) {
  const [timeframe, setTimeframe] = useState('7d');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const handleFilterChange = () => {
    if (onFiltersChange) {
      onFiltersChange({
        timeframe,
        category,
        status
      });
    }
  };

  const resetFilters = () => {
    setTimeframe('7d');
    setCategory('all');
    setStatus('all');
    if (onFiltersChange) {
      onFiltersChange({
        timeframe: '7d',
        category: 'all',
        status: 'all'
      });
    }
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [timeframe, category, status]);

  const timeframeOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'pending', label: 'Pending' },
    { value: 'escalated', label: 'Escalated' }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        </div>

        {/* Active Filters Display */}
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-xs text-gray-500">Active filters:</span>
          <div className="flex items-center space-x-2">
            {timeframe !== '7d' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {timeframeOptions.find(opt => opt.value === timeframe)?.label}
              </span>
            )}
            {category !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {category}
              </span>
            )}
            {status !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {status}
              </span>
            )}
            {timeframe === '7d' && category === 'all' && status === 'all' && (
              <span className="text-xs text-gray-400">None</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}