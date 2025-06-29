
import React, { useState } from 'react';
import { useMultiChainManager } from '../../hooks/useMultiChainManager';
import { useFlashLoanArbitrage } from '../../hooks/useFlashLoanArbitrage';
import MultiChainOverview from './MultiChainOverview';
import LiveFlashLoanOpportunities from './LiveFlashLoanOpportunities';
import ArbitrageOpportunities from './ArbitrageOpportunities';
// import PriceTracker from './PriceTracker'; // DISABLED - Live Price Tracker
import ExecutionProgress from './ExecutionProgress';
import ConfigurationPanel from './ConfigurationPanel';
import TestModePanel from './TestModePanel';
import EnhancedArbitrageDashboard from './EnhancedArbitrageDashboard';

const DashboardContent = () => {
  // Multi-chain management
  const {
    chains,
    enabledChains,
    crossChainOpportunities,
    flashLoanMode,
    setFlashLoanMode,
    toggleChain
  } = useMultiChainManager();

  // Flash loan arbitrage data
  const {
    opportunities: flashLoanOpportunities,
    totalProfit: totalFlashLoanProfit
  } = useFlashLoanArbitrage();

  // Test mode and execution state
  const [isTestMode, setIsTestMode] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [executionProgress, setExecutionProgress] = useState(0);

  // Test statistics
  const [testStats, setTestStats] = useState({
    totalTests: 0,
    successfulTests: 0,
    totalProfit: 0,
    liveModeUnlocked: false
  });

  // Calculate total regular profit from cross-chain opportunities
  const totalRegularProfit = crossChainOpportunities.reduce((sum, opp) => sum + (opp.estimatedProfit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Multi-Chain Overview */}
      <MultiChainOverview 
        enabledChains={enabledChains}
        crossChainOpportunities={crossChainOpportunities}
        flashLoanOpportunities={flashLoanOpportunities}
        totalFlashLoanProfit={totalFlashLoanProfit}
        totalRegularProfit={totalRegularProfit}
        chains={chains}
        flashLoanMode={flashLoanMode}
        setFlashLoanMode={setFlashLoanMode}
        toggleChain={toggleChain}
      />
      
      {/* NEW: Enhanced Arbitrage Dashboard - This is the main attraction now */}
      <EnhancedArbitrageDashboard />
      
      {/* Live Flash Loan Opportunities */}
      <LiveFlashLoanOpportunities />
      
      {/* Regular Arbitrage Opportunities */}
      <ArbitrageOpportunities />
      
      {/* DISABLED - Price Tracking */}
      {/* 
      <PriceTracker />
      */}
      
      {/* Execution Progress */}
      <ExecutionProgress 
        isExecuting={isExecuting}
        isTestMode={isTestMode}
        currentStep={currentStep}
        executionProgress={executionProgress}
      />
      
      {/* Configuration and Test Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigurationPanel />
        <TestModePanel 
          isTestMode={isTestMode}
          setIsTestMode={setIsTestMode}
          testStats={testStats}
          flashLoanOpportunities={flashLoanOpportunities}
        />
      </div>
    </div>
  );
};

export default DashboardContent;
