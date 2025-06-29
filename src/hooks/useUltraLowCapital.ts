
import { useState, useEffect, useCallback } from 'react';
import { UltraLowCapitalOptimizer, MicroOpportunity } from '../utils/ultraLowCapitalOptimizer';

interface UltraLowCapitalState {
  opportunities: MicroOpportunity[];
  currentCapital: number;
  totalProfit: number;
  activePositions: number;
  isScanning: boolean;
  emergencyMode: boolean;
  stats: {
    successRate: number;
    avgProfitPerTrade: number;
    totalTrades: number;
    profitToday: number;
  };
}

export const useUltraLowCapital = (initialCapital: number = 20) => {
  const [state, setState] = useState<UltraLowCapitalState>({
    opportunities: [],
    currentCapital: initialCapital,
    totalProfit: 0,
    activePositions: 0,
    isScanning: false,
    emergencyMode: false,
    stats: {
      successRate: 0,
      avgProfitPerTrade: 0,
      totalTrades: 0,
      profitToday: 0
    }
  });

  const [tradeHistory, setTradeHistory] = useState<Array<{
    timestamp: number;
    profit: number;
    success: boolean;
    type: string;
  }>>([]);

  // Scan for micro-MEV opportunities
  const scanMicroOpportunities = useCallback(() => {
    setState(prev => ({ ...prev, isScanning: true }));
    
    // Simulate market data
    const mockMarketData = Array.from({ length: 20 }, (_, i) => ({
      pair: `TOKEN${i}/USDC`,
      price: 1 + Math.random() * 0.1,
      volume: 1000 + Math.random() * 10000,
      spread: 0.01 + Math.random() * 0.5
    }));

    const opportunities = UltraLowCapitalOptimizer.findMicroMEVOpportunities(mockMarketData);
    
    // Add flash loan opportunities
    const flashOpportunities = mockMarketData
      .map(data => UltraLowCapitalOptimizer.calculateFlashLoanOpportunity(5, data.spread))
      .filter(Boolean) as MicroOpportunity[];

    const allOpportunities = [...opportunities, ...flashOpportunities]
      .sort((a, b) => UltraLowCapitalOptimizer.scoreOpportunity(b) - UltraLowCapitalOptimizer.scoreOpportunity(a))
      .slice(0, 15); // Top 15 opportunities

    setState(prev => ({
      ...prev,
      opportunities: allOpportunities,
      isScanning: false
    }));
  }, []);

  // Execute micro-trade
  const executeMicroTrade = useCallback(async (opportunity: MicroOpportunity) => {
    console.log(`🚀 Executing micro-trade: ${opportunity.type} - $${opportunity.estimatedProfit.toFixed(4)} profit`);
    
    setState(prev => ({ ...prev, activePositions: prev.activePositions + 1 }));

    try {
      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, opportunity.executionTimeMs));
      
      // Simulate success/failure based on probability
      const success = Math.random() < opportunity.successProbability;
      const actualProfit = success ? opportunity.estimatedProfit * (0.8 + Math.random() * 0.4) : -opportunity.requiredCapital * 0.1;
      
      // Update state
      setState(prev => {
        const newCapital = prev.currentCapital + actualProfit;
        const newTotalProfit = prev.totalProfit + actualProfit;
        const newTotalTrades = prev.stats.totalTrades + 1;
        const successfulTrades = tradeHistory.filter(t => t.success).length + (success ? 1 : 0);
        
        return {
          ...prev,
          currentCapital: newCapital,
          totalProfit: newTotalProfit,
          activePositions: prev.activePositions - 1,
          stats: {
            successRate: (successfulTrades / newTotalTrades) * 100,
            avgProfitPerTrade: newTotalProfit / newTotalTrades,
            totalTrades: newTotalTrades,
            profitToday: prev.stats.profitToday + actualProfit
          }
        };
      });

      // Update trade history
      setTradeHistory(prev => [...prev, {
        timestamp: Date.now(),
        profit: actualProfit,
        success,
        type: opportunity.type
      }].slice(-100)); // Keep last 100 trades

      // Auto-reinvestment
      if (success && actualProfit > 0) {
        const reinvestment = UltraLowCapitalOptimizer.calculateReinvestment(actualProfit, state.currentCapital);
        console.log(`💰 Reinvesting: $${reinvestment.reinvestAmount.toFixed(2)}, Withdrawing: $${reinvestment.withdrawAmount.toFixed(2)}`);
      }

      console.log(`${success ? '✅' : '❌'} Trade completed: ${success ? 'SUCCESS' : 'FAILED'} - Profit: $${actualProfit.toFixed(4)}`);
      
    } catch (error) {
      console.error('❌ Trade execution failed:', error);
      setState(prev => ({ ...prev, activePositions: prev.activePositions - 1 }));
    }
  }, [state.currentCapital, tradeHistory]);

  // Emergency shutdown check
  useEffect(() => {
    const isSafe = UltraLowCapitalOptimizer.isCapitalSafe(state.currentCapital, initialCapital);
    if (!isSafe && !state.emergencyMode) {
      setState(prev => ({ ...prev, emergencyMode: true }));
      UltraLowCapitalOptimizer.emergencyShutdown('Capital loss exceeds 20%');
    }
  }, [state.currentCapital, initialCapital, state.emergencyMode]);

  // Auto-scan for opportunities
  useEffect(() => {
    if (!state.emergencyMode) {
      const interval = setInterval(scanMicroOpportunities, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [scanMicroOpportunities, state.emergencyMode]);

  // Bundle execution
  const executeBundledTrades = useCallback(async (opportunities: MicroOpportunity[]) => {
    const bundles = UltraLowCapitalOptimizer.bundleTransactions(opportunities);
    
    for (const bundle of bundles) {
      console.log(`📦 Executing bundle of ${bundle.length} trades`);
      await Promise.all(bundle.map(opp => executeMicroTrade(opp)));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between bundles
    }
  }, [executeMicroTrade]);

  return {
    ...state,
    scanMicroOpportunities,
    executeMicroTrade,
    executeBundledTrades,
    tradeHistory: tradeHistory.slice(-20), // Return last 20 trades
    capitalEfficiency: state.currentCapital > 0 ? (state.totalProfit / initialCapital) * 100 : 0,
    dailyROI: state.stats.profitToday > 0 ? (state.stats.profitToday / state.currentCapital) * 100 : 0
  };
};
