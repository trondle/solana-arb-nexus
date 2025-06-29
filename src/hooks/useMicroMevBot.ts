
import { useState, useEffect, useCallback } from 'react';
import { MicroMevDetector, MicroMevOpportunity } from '../utils/microMevDetector';
import { UltraSpeedExecutor } from '../utils/ultraSpeedExecutor';

interface MicroMevBotState {
  opportunities: MicroMevOpportunity[];
  isScanning: boolean;
  totalProfit: number;
  executionStats: {
    totalExecutions: number;
    successfulExecutions: number;
    averageLatency: number;
    totalProfit: number;
  };
  speedMetrics: any;
  detectionStats: any;
}

export const useMicroMevBot = (enabled: boolean = false) => {
  const [state, setState] = useState<MicroMevBotState>({
    opportunities: [],
    isScanning: false,
    totalProfit: 0,
    executionStats: {
      totalExecutions: 0,
      successfulExecutions: 0,
      averageLatency: 0,
      totalProfit: 0
    },
    speedMetrics: {},
    detectionStats: {}
  });

  // Initialize ultra-speed executor
  useEffect(() => {
    if (enabled) {
      UltraSpeedExecutor.initialize();
    }
  }, [enabled]);

  // Continuous micro-MEV scanning
  const scanForOpportunities = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isScanning: true }));

    try {
      const opportunities = await MicroMevDetector.detectMicroOpportunities(0.01); // 0.01% threshold
      const detectionStats = MicroMevDetector.getDetectionStats();
      const speedMetrics = UltraSpeedExecutor.getSpeedAnalytics();

      setState(prev => ({
        ...prev,
        opportunities,
        detectionStats,
        speedMetrics,
        isScanning: false
      }));

      console.log(`🔍 Micro-MEV scan complete: ${opportunities.length} opportunities found`);
    } catch (error) {
      console.error('Micro-MEV scanning failed:', error);
      setState(prev => ({ ...prev, isScanning: false }));
    }
  }, [enabled]);

  // Execute opportunity with ultra-speed
  const executeOpportunity = useCallback(async (opportunity: MicroMevOpportunity) => {
    console.log(`⚡ Executing micro-MEV opportunity: ${opportunity.type} - ${opportunity.token}`);

    try {
      const result = await UltraSpeedExecutor.executeUltraFast(opportunity);
      
      setState(prev => {
        const newStats = {
          totalExecutions: prev.executionStats.totalExecutions + 1,
          successfulExecutions: prev.executionStats.successfulExecutions + (result.success ? 1 : 0),
          averageLatency: (prev.executionStats.averageLatency + result.latency) / 2,
          totalProfit: prev.executionStats.totalProfit + (result.success ? opportunity.profitAmount : 0)
        };

        return {
          ...prev,
          executionStats: newStats,
          totalProfit: prev.totalProfit + (result.success ? opportunity.profitAmount : 0)
        };
      });

      console.log(`${result.success ? '✅' : '❌'} Execution ${result.success ? 'successful' : 'failed'} in ${result.latency.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      console.error('Execution failed:', error);
      return { success: false, latency: 0 };
    }
  }, []);

  // Auto-scanning loop
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(scanForOpportunities, 2000); // Scan every 2 seconds
    return () => clearInterval(interval);
  }, [scanForOpportunities, enabled]);

  // Execute best opportunities automatically
  const executeTopOpportunities = useCallback(async () => {
    const topOpps = state.opportunities
      .filter(opp => opp.confidence > 85 && opp.executionWindow > 200)
      .slice(0, 3); // Top 3 opportunities

    for (const opp of topOpps) {
      await executeOpportunity(opp);
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms between executions
    }
  }, [state.opportunities, executeOpportunity]);

  return {
    ...state,
    scanForOpportunities,
    executeOpportunity,
    executeTopOpportunities,
    clearCache: MicroMevDetector.clearCache
  };
};
