'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface StockData {
  [key: string]: any;
}

interface Filters {
  [key: string]: string;
}

export default function QueryResult() {
  const [data, setData] = useState<StockData[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get search parameters from URL
    const urlFilters: Filters = {};
    searchParams.forEach((value, key) => {
      urlFilters[key] = value;
    });
    setFilters(urlFilters);
    
    // Fetch data
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const getTextColumns = (): string[] => {
    if (data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => 
      (typeof firstRow[key] === 'string') && key !== 'S.No'
    );
  };

  const applyFilters = (): StockData[] => {
    return data.filter(item => {
      return Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        const itemValue = item[key];
        return itemValue?.toString().toLowerCase().includes(filters[key].toLowerCase());
      });
    });
  };

  const sortData = (data: StockData[]): StockData[] => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = aValue?.toString() || '';
      const bStr = bValue?.toString() || '';
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleTextFilterChange = (column: string, value: string) => {
    const newFilters = {
      ...filters,
      [column]: value
    };
    setFilters(newFilters);
    
    // Update URL parameters
    const searchParams = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        searchParams.append(key, newFilters[key]);
      }
    });
    
    // Update URL without navigation
    window.history.replaceState({}, '', `${window.location.pathname}?${searchParams.toString()}`);
  };

  const formatNumber = (value: any): string => {
    if (typeof value !== 'number') return value?.toString() || '';
    
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(2)}K`;
    }
    
    return value.toLocaleString('en-IN');
  };

  // Export to CSV function
  const exportToCSV = () => {
    const filteredData = sortData(applyFilters());
    
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    const columns = Object.keys(filteredData[0]);
    
    // Create CSV content
    const csvContent = [
      // Header row
      columns.join(','),
      // Data rows
      ...filteredData.map(row => 
        columns.map(col => {
          const value = row[col];
          // Handle commas and quotes in data
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-query-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save query function
  const saveQuery = () => {
    const queryData = {
      filters,
      sortConfig,
      timestamp: new Date().toISOString(),
      resultCount: applyFilters().length,
      totalCount: data.length
    };

    // Navigate to save page with query data
    const encodedData = encodeURIComponent(JSON.stringify(queryData));
    router.push(`/save-query?data=${encodedData}`);
  };

  const handleBackToSearch = () => {
    router.push('/');
  };

  const handleNewSearch = () => {
    router.push('/');
  };

  const handleMyQueries = () => {
    router.push('/my-query');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading stock data...</div>
        </div>
      </div>
    );
  }

  const filteredAndSortedData = sortData(applyFilters());
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const textColumns = getTextColumns();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Export and Save buttons - Top Left */}
              <div className="flex items-center space-x-2 mr-4">
                <button
                  onClick={exportToCSV}
                  className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={saveQuery}
                  className="flex items-center bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save Query
                </button>
                <button
                  onClick={handleMyQueries}
                  className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Queries
                </button>
              </div>
              
              <button
                onClick={handleBackToSearch}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                New Search
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Stock Results</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {filteredAndSortedData.length} of {data.length} stocks
              </div>
              <button
                onClick={handleNewSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                New Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Active Filters Display */}
        {Object.keys(filters).some(key => filters[key]) && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Active Filters:</h3>
              <button
                onClick={() => {
                  setFilters({});
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(filters).map(key => 
                filters[key] && (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {key}: {filters[key]}
                    <button
                      onClick={() => handleTextFilterChange(key, '')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Additional Filters */}
        {textColumns.length > 0 && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Refine Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {textColumns.map(column => (
                <div key={column}>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {column}
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Filter by ${column}`}
                    value={filters[column] || ''}
                    onChange={(e) => handleTextFilterChange(column, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredAndSortedData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No stocks found</div>
              <div className="text-gray-400 text-sm">Try adjusting your search criteria</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map(column => (
                      <th 
                        key={column} 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center">
                          {column}
                          {sortConfig?.key === column && (
                            <span className="ml-1 text-blue-500">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedData.map((row, index) => (
                    <tr key={row['S.No'] || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {columns.map(column => (
                        <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {column === 'Name' ? (
                            <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                              {row[column]}
                            </div>
                          ) : typeof row[column] === 'number' && column !== 'S.No' ? (
                            <div className="text-right">
                              {column.includes('%') ? `${row[column]}%` : formatNumber(row[column])}
                            </div>
                          ) : (
                            row[column]
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}