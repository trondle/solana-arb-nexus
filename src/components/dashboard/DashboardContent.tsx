
import React from 'react';
import MultiChainOverview from './MultiChainOverview';
import LiveFlashLoanOpportunities from './LiveFlashLoanOpportunities';
import ArbitrageOpportunities from './ArbitrageOpportunities';
import PriceTracker from './PriceTracker';
import ExecutionProgress from './ExecutionProgress';
import ConfigurationPanel from './ConfigurationPanel';
import TestModePanel from './TestModePanel';

const DashboardContent = () => {
  return (
    <div className="space-y-6">
      {/* Multi-Chain Overview */}
      <MultiChainOverview />
      
      {/* Live Flash Loan Opportunities - Main Focus */}
      <LiveFlashLoanOpportunities />
      
      {/* Regular Arbitrage Opportunities */}
      <ArbitrageOpportunities />
      
      {/* Price Tracking */}
      <PriceTracker />
      
      {/* Execution Progress */}
      <ExecutionProgress />
      
      {/* Configuration and Test Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigurationPanel />
        <TestModePanel />
      </div>
    </div>
  );
};

export default DashboardContent;
