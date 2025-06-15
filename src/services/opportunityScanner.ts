
import { ChainConfig } from '../config/types';
import { getOptimizedCrossChainArbitrage, calculateOptimizedFees } from '../utils/flashLoanOptimizer';
import { BridgeOptimizer } from '../utils/bridgeOptimizer';
import { GasOptimizer } from '../utils/gasOptimizer';
import { DexAggregator } from '../utils/dexAggregator';

export interface CrossChainOpportunity {
  id: string;
  fromChain: string;
  toChain: string;
  pair: string;
  spread: number;
  estimatedProfit: number;
  bridgeFee: number;
  totalFees: number;
  netProfit: number;
  executionTime: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  requiresCapital: number; // 0 for flash loan, actual amount for regular
  flashLoanEnabled: boolean;
  flashLoanProvider?: string;
  flashLoanFee?: number;
}

export const scanCrossChainOpportunities = async (
  enabledChains: ChainConfig[], 
  flashLoanMode: boolean,
  userVolume: number = 0
): Promise<CrossChainOpportunity[]> => {
  const opportunities: CrossChainOpportunity[] = [];
  const pairs = ['USDC/USDT', 'ETH/USDC', 'BTC/USDC', 'SOL/USDC', 'MATIC/USDC', 'ARB/USDC', 'AVAX/USDC', 'DOT/USDC', 'LINK/USDC', 'UNI/USDC', 'AAVE/USDC', 'CRV/USDC'];
  
  // Generate more opportunities for better filtering
  for (let i = 0; i < enabledChains.length; i++) {
    for (let j = i + 1; j < enabledChains.length; j++) {
      const fromChain = enabledChains[i];
      const toChain = enabledChains[j];
      
      pairs.forEach((pair, index) => {
        // Generate multiple opportunities per pair with different spreads
        for (let k = 0; k < 3; k++) {
          // Enhanced spread calculation with better market simulation
          const baseSpread = 0.6 + Math.random() * 2.8; // 0.6% to 3.4%
          const volatilityBonus = Math.random() * 0.4;
          const spread = baseSpread + volatilityBonus;
          
          const amount = 15000 + Math.random() * 85000;
          
          // Use optimized systems for fee calculation
          const optimization = getOptimizedCrossChainArbitrage(
            fromChain,
            toChain,
            amount,
            spread,
            userVolume,
            false // Not prioritizing speed for regular scan
          );

          if (!optimization) return;

          const baseOpportunity = {
            fromChain: fromChain.name,
            toChain: toChain.name,
            pair,
            spread,
            bridgeFee: optimization.bridgeQuote.totalFee,
            executionTime: optimization.bridgeQuote.estimatedTime + 
                          optimization.gasOptimization.estimatedConfirmationTime,
            confidence: optimization.confidence,
            riskLevel: (spread > 2.5 ? 'low' : spread > 1.5 ? 'medium' : 'high') as 'low' | 'medium' | 'high'
          };

          // Regular cross-chain arbitrage (requires capital)
          const regularNetProfit = optimization.estimatedProfit;
          
          if (regularNetProfit > 8) {
            opportunities.push({
              id: `cross-regular-${fromChain.id}-${toChain.id}-${index}-${k}`,
              ...baseOpportunity,
              estimatedProfit: amount * spread / 100,
              totalFees: optimization.totalFees,
              netProfit: regularNetProfit,
              requiresCapital: amount,
              flashLoanEnabled: false
            });
          }

          // Enhanced flash loan cross-chain arbitrage
          if (flashLoanMode && optimization.flashLoanQuote) {
            const flashNetProfit = optimization.estimatedProfit;
            
            // Much lower threshold for optimized flash loans
            if (flashNetProfit > 3) {
              opportunities.push({
                id: `cross-flash-${fromChain.id}-${toChain.id}-${index}-${k}`,
                ...baseOpportunity,
                estimatedProfit: amount * spread / 100,
                totalFees: optimization.totalFees,
                netProfit: flashNetProfit,
                requiresCapital: amount, // Store the actual amount needed for calculations
                flashLoanEnabled: true,
                flashLoanProvider: optimization.flashLoanQuote.provider.name,
                flashLoanFee: amount * optimization.flashLoanQuote.effectiveFee / 100
              });
            }
          }
        }
      });
    }
  }
  
  // Enhanced sorting with optimization metrics
  return opportunities
    .map(opp => ({
      ...opp,
      // Add optimization bonus
      netProfit: opp.netProfit * (1 + (userVolume > 100000 ? 0.05 : 0))
    }))
    .sort((a, b) => {
      // Prioritize flash loan opportunities as they're more capital efficient
      if (a.flashLoanEnabled && !b.flashLoanEnabled) return -1;
      if (!a.flashLoanEnabled && b.flashLoanEnabled) return 1;
      return b.netProfit - a.netProfit;
    })
    .slice(0, 50); // Generate more opportunities for better filtering
};
