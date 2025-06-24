
import { useState, useEffect, useMemo } from 'react';
import { useFreeLivePrices } from './useFreeLivePrices';
import { useMultiChainManager } from './useMultiChainManager';
import { calculateOptimizedFees } from '../utils/flashLoanOptimizer';

interface FlashLoanArbitrageData {
  opportunities: any[];
  isScanning: boolean;
  totalProfit: number;
  isStreamActive: boolean;
  lastUpdate: Date;
  error: string | null;
}

export const useFlashLoanArbitrage = () => {
  const [isStreamActive, setIsStreamActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get live prices and opportunities from free service
  const { 
    flashLoanOpportunities, 
    isConnected, 
    lastUpdate, 
    error: priceError,
    refreshPrices 
  } = useFreeLivePrices(['SOL', 'ETH', 'USDC', 'USDT', 'FTM']);

  // Get chain management
  const { 
    enabledChains, 
    flashLoanMode,
    isScanning,
    setFlashLoanMode 
  } = useMultiChainManager();

  // Enable flash loan mode by default
  useEffect(() => {
    if (!flashLoanMode) {
      setFlashLoanMode(true);
    }
  }, [flashLoanMode, setFlashLoanMode]);

  // Enhanced opportunities with optimization data
  const enhancedOpportunities = useMemo(() => {
    if (!flashLoanOpportunities || flashLoanOpportunities.length === 0) return [];

    return flashLoanOpportunities.map(opportunity => {
      const actualAmount = opportunity.requiredCapital || 5000;
      const optimizedFees = calculateOptimizedFees(opportunity, actualAmount);
      
      // Add chain information
      const fromChain = enabledChains.find(chain => 
        chain.name.toLowerCase().includes(opportunity.buyDex?.toLowerCase() || '') ||
        chain.id === 'solana' && opportunity.buyDex?.includes('Raydium') ||
        chain.id === 'base' && opportunity.buyDex?.includes('Uniswap') ||
        chain.id === 'fantom' && opportunity.buyDex?.includes('SpookySwap')
      ) || enabledChains[0];

      const toChain = enabledChains.find(chain => 
        chain.name.toLowerCase().includes(opportunity.sellDex?.toLowerCase() || '') ||
        chain.id === 'solana' && opportunity.sellDex?.includes('Orca') ||
        chain.id === 'base' && opportunity.sellDex?.includes('SushiSwap') ||
        chain.id === 'fantom' && opportunity.sellDex?.includes('SpiritSwap')
      ) || enabledChains[1] || enabledChains[0];

      return {
        ...opportunity,
        actualAmount,
        optimizedFees,
        netOptimizedProfit: opportunity.estimatedProfit - optimizedFees.total,
        fromChain: fromChain?.name || 'Solana',
        toChain: toChain?.name || 'Base',
        flashLoanProvider: fromChain?.flashLoanProviders[0]?.name || 'Solend',
        executionTime: 3000 + Math.random() * 2000, // 3-5 seconds
        confidence: Math.min(95, 80 + Math.random() * 15),
        isLive: true,
        lastUpdated: lastUpdate
      };
    });
  }, [flashLoanOpportunities, enabledChains, lastUpdate]);

  // Calculate total profit
  const totalProfit = useMemo(() => {
    return enhancedOpportunities.reduce((sum, opp) => sum + (opp.netOptimizedProfit || 0), 0);
  }, [enhancedOpportunities]);

  // Update error state
  useEffect(() => {
    setError(priceError);
  }, [priceError]);

  // Toggle stream function
  const toggleStream = () => {
    setIsStreamActive(!isStreamActive);
    if (!isStreamActive) {
      refreshPrices();
    }
  };

  // Manual refresh
  const refreshOpportunities = () => {
    refreshPrices();
  };

  return {
    opportunities: isStreamActive ? enhancedOpportunities : [],
    isScanning: isScanning || !isConnected,
    totalProfit,
    isStreamActive,
    lastUpdate,
    error,
    enabledChains,
    flashLoanMode,
    toggleStream,
    refreshOpportunities,
    setFlashLoanMode,
    isConnected
  };
};
