'use client';

import React from 'react';
import type { JSX } from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

// Type definitions
interface RatioData {
  displayName: string;
  hasPercent: boolean;
}

interface RatiosDataType {
  [key: string]: RatioData;
}

interface Filters {
  [key: string]: string;
}

type TabType = 'Create Screen' | 'Ready-made' | 'My Screens';
type CategoryType = 'Most Used' | 'Annual P&L' | 'Quarter P&L' | 'Balance Sheet' | 'Cash Flow' | 'Ratios' | 'Price';

const ratiosData: RatiosDataType = {
  'CMP Rs.': { displayName: 'CMP Rs.', hasPercent: false },
  'P/E': { displayName: 'P/E', hasPercent: false },
  'Mar Cap Rs.Cr': { displayName: 'Market Cap Rs.Cr', hasPercent: false },
  'Div Yld %': { displayName: 'Div Yld', hasPercent: true },
  'NP Qtr Rs.Cr': { displayName: 'NP Qtr Rs.Cr', hasPercent: false },
  'Qtr Profit Var %': { displayName: 'Qtr Profit Var', hasPercent: true },
  'Sales Qtr Rs.Cr': { displayName: 'Sales Qtr Rs.Cr', hasPercent: false },
  'Qtr Sales Var %': { displayName: 'Qtr Sales Var', hasPercent: true },
  'ROCE %': { displayName: 'ROCE', hasPercent: true },
  'ROE %': { displayName: 'ROE', hasPercent: true },
  'Debt to Equity': { displayName: 'Debt to Equity', hasPercent: false },
  'Current Ratio': { displayName: 'Current Ratio', hasPercent: false },
  'Quick Ratio': { displayName: 'Quick Ratio', hasPercent: false },
  'EPS Rs.': { displayName: 'EPS Rs.', hasPercent: false },
  'Book Value Rs.': { displayName: 'Book Value Rs.', hasPercent: false },
  'Sales Growth %': { displayName: 'Sales Growth', hasPercent: true },
  'Profit Growth %': { displayName: 'Profit Growth', hasPercent: true },
  'EBITDA Margin %': { displayName: 'EBITDA Margin', hasPercent: true }
};

const topRatios: string[] = ['CMP Rs.', 'P/E', 'Mar Cap Rs.Cr', 'Div Yld %'];

const symbols: string[] = ['+', '-', '*', '/', '>', '<', 'AND', 'OR'];

const categories: CategoryType[] = ['Most Used', 'Annual P&L', 'Quarter P&L', 'Balance Sheet', 'Cash Flow', 'Ratios', 'Price'];

const tabs: TabType[] = ['Create Screen', 'Ready-made', 'My Screens'];

export default function StockScreener() {
  const [activeTab, setActiveTab] = useState<TabType>('Create Screen');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Most Used');
  const [showRatios, setShowRatios] = useState<boolean>(false);
  const [showAllRatios, setShowAllRatios] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [searchCompany, setSearchCompany] = useState<string>('');
  const [searchRatio, setSearchRatio] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({});

  const handleRatioClick = (ratioKey: string): void => {
    const ratio: RatioData | undefined = ratiosData[ratioKey];
    if (!ratio) return;
    
    const ratioText: string = ratio.displayName;
    
    // Add to the main search input with a space and cursor positioning for user to add operator and value
    setSearchCompany(prev => prev + (prev ? ' AND ' : '') + ratioText + ' ');
  };

  const handleSymbolClick = (symbol: string): void => {
    setSearchCompany(prev => prev + symbol + ' ');
  };

  const isRatioQuery = (queryString: string): boolean => {
    const ratioNames = Object.values(ratiosData).map(ratio => ratio.displayName);
    return ratioNames.some(ratioName => queryString.includes(ratioName));
  };

  const handleRunQuery = (): void => {
    if (!searchCompany.trim()) {
      alert('Please enter a search query or company name');
      return;
    }

    setLoading(true);
    
    // Create search parameters based on query type
    const searchParams = new URLSearchParams();
    const queryString = searchCompany.trim();
    
    // Check if it's a ratio-based query or just a company name
    if (isRatioQuery(queryString)) {
      searchParams.append('query', queryString);
    } else {
      searchParams.append('Name', queryString);
    }
    
    // Add any additional filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        searchParams.append(key, filters[key]);
      }
    });
    
    // Navigate to results page
    const resultUrl = `/query-result?${searchParams.toString()}`;
    
    // Method 1: Using window.location (works in all environments)
    window.location.href = resultUrl;
    
    // Method 2: For Next.js with App Router - uncomment this and comment above
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // router.push(resultUrl);
    
    // Method 3: For Next.js with Pages Router - uncomment this and comment above
    // import { useRouter } from 'next/router';
    // const router = useRouter();
    // router.push(resultUrl);
  };

  const handleSearch = (): void => {
    if (!searchCompany.trim()) {
      alert('Please enter a company name to search');
      return;
    }

    setLoading(true);
    
    // Create query parameters from search input
    const searchParams = new URLSearchParams();
    const queryString = searchCompany.trim();
    
    // Check if it's a ratio-based query or just a company name
    if (isRatioQuery(queryString)) {
      searchParams.append('query', queryString);
    } else {
      searchParams.append('Name', queryString);
    }
    
    // Navigate to results page with search parameters
    const resultUrl = `/query-result?${searchParams.toString()}`;
    
    // Navigate directly
    window.location.href = resultUrl;
  };

  const handleTabClick = (tab: TabType): void => {
    setActiveTab(tab);
  };

  const handleCategoryClick = (category: CategoryType): void => {
    setActiveCategory(category);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setQuery(e.target.value);
  };

  const handleSearchCompanyChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchCompany(e.target.value);
  };

  const handleSearchRatioChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchRatio(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      if (e.currentTarget === document.querySelector('input[placeholder*="company"]')) {
        handleSearch();
      } else {
        handleRunQuery();
      }
    }
  };

  const toggleRatios = (): void => {
    setShowRatios(!showRatios);
  };

  const toggleAllRatios = (): void => {
    setShowAllRatios(true);
  };

  const renderContent = (): JSX.Element => {
    if (activeTab === 'Create Screen') {
      return (
        <div className="space-y-4">
          {/* Single Query Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Write your query here/ search company"
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bec00] focus:border-transparent"
              value={searchCompany}
              onChange={handleSearchCompanyChange}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#9bec00] hover:bg-[#8bd400] disabled:bg-gray-300 text-black p-2 rounded-lg transition-colors"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Example Text */}
          <div className="text-gray-500 text-sm px-3">
            For example: Market capitalization &gt; 500 AND Price to earning &lt; 15 AND Return on capital employed &gt; 22%
          </div>

          {/* Run Query Button */}
          <button
            onClick={handleRunQuery}
            disabled={loading}
            className="bg-[#9bec00] hover:bg-[#8bd400] disabled:bg-gray-300 text-black font-medium px-6 py-2 rounded-lg transition-colors"
          >
            {loading ? 'Running Query...' : 'Run this query'}
          </button>

          {/* Clear Filters */}
          {(searchCompany || Object.keys(filters).some(key => filters[key])) && (
            <button
              onClick={() => {
                setSearchCompany('');
                setFilters({});
              }}
              className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>Content for {activeTab} - Coming Soon</p>
        </div>
      );
    }
  };

  const filteredRatios = (): string[] => {
    if (!searchRatio) {
      return showAllRatios ? Object.keys(ratiosData) : topRatios;
    }
    
    return Object.keys(ratiosData).filter(ratioKey =>
      ratiosData[ratioKey].displayName.toLowerCase().includes(searchRatio.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between pl-10 pr-30 items-center px-8 py-4 border-b border-gray-200 ml-[10%]">
        <h1 className="text-2xl font-bold text-gray-800">Screener</h1>
        <button className="bg-[#9bec00] hover:bg-[#8bd400] text-black px-4 py-2 rounded-lg font-medium transition-colors">
          Demo Videos
        </button>
      </div>

      {/* Main Content - Increased left margin for more space */}
      <div className="max-w-6xl pl-10 mx-auto p-6 ml-[10%] mr-[5%]">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab: TabType) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[#9bec00] text-black'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          {renderContent()}
        </div>

        {/* View Ratios Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <button
            onClick={toggleRatios}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-700">
              View ratios to get help in writing your query. 
              <span className="text-[#9bec00] ml-2 underline cursor-pointer">Show ratios</span>
            </span>
            <div className="flex items-center space-x-2">
              {showRatios ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {showRatios && (
            <div className="border-t border-gray-200 p-6 space-y-6">
              {/* Symbols */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Symbols</h3>
                <div className="flex flex-wrap gap-2">
                  {symbols.map((symbol: string) => (
                    <button
                      key={symbol}
                      onClick={() => handleSymbolClick(symbol)}
                      className="border border-gray-300 hover:border-[#9bec00] hover:bg-[#9bec00] hover:bg-opacity-10 px-3 py-2 rounded transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Tabs */}
              <div>
                <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
                  {categories.map((category: CategoryType) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        category === activeCategory
                          ? 'bg-[#9bec00] text-black'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search ratio 'sales'"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bec00] focus:border-transparent"
                      value={searchRatio}
                      onChange={handleSearchRatioChange}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Recent</h3>
                <div className="flex flex-wrap gap-2">
                  {filteredRatios().map((ratioKey: string) => (
                    <button
                      key={ratioKey}
                      onClick={() => handleRatioClick(ratioKey)}
                      className="border border-gray-300 hover:border-[#9bec00] hover:bg-[#9bec00] hover:bg-opacity-10 px-3 py-2 rounded text-sm transition-colors"
                    >
                      {ratiosData[ratioKey].displayName}
                    </button>
                  ))}
                  {!showAllRatios && !searchRatio && (
                    <button
                      onClick={toggleAllRatios}
                      className="border border-gray-300 hover:border-[#9bec00] hover:bg-[#9bec00] hover:bg-opacity-10 px-3 py-2 rounded text-sm transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Preceding */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Preceding</h3>
                <div className="flex flex-wrap gap-2">
                  {topRatios.map((ratioKey: string) => (
                    <button
                      key={ratioKey}
                      onClick={() => handleRatioClick(ratioKey)}
                      className="border border-gray-300 hover:border-[#9bec00] hover:bg-[#9bec00] hover:bg-opacity-10 px-3 py-2 rounded text-sm transition-colors"
                    >
                      {ratiosData[ratioKey].displayName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Historical */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Historical</h3>
                <div className="flex flex-wrap gap-2">
                  {topRatios.map((ratioKey: string) => (
                    <button
                      key={ratioKey}
                      onClick={() => handleRatioClick(ratioKey)}
                      className="border border-gray-300 hover:border-[#9bec00] hover:bg-[#9bec00] hover:bg-opacity-10 px-3 py-2 rounded text-sm transition-colors"
                    >
                      {ratiosData[ratioKey].displayName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}