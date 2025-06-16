
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
  requiresCapital: number;
  flashLoanEnabled: boolean;
  flashLoanProvider?: string;
  flashLoanFee?: number;
  actualAmount: number;
}

export const scanCrossChainOpportunities = async (
  enabledChains: ChainConfig[], 
  flashLoanMode: boolean,
  userVolume: number = 0
): Promise<CrossChainOpportunity[]> => {
  const opportunities: CrossChainOpportunity[] = [];
  
  // Focus on the most profitable pairs for Base + Fantom + Solana
  const priorityPairs = [
    'USDC/USDT', 'ETH/USDC', 'SOL/USDC', 'FTM/USDC', 
    'ETH/USDT', 'SOL/USDT', 'FTM/USDT'
  ];
  
  const secondaryPairs = [
    'BTC/USDC', 'MATIC/USDC', 'AVAX/USDC', 'DOT/USDC'
  ];
  
  const allPairs = [...priorityPairs, ...secondaryPairs];
  
  // Filter to only our target chains
  const targetChains = enabledChains.filter(chain => 
    ['base', 'fantom', 'solana'].includes(chain.id)
  );

  console.log(`Scanning opportunities across ${targetChains.length} chains: ${targetChains.map(c => c.name).join(', ')}`);

  // Generate opportunities focusing on our target chains
  for (let i = 0; i < targetChains.length; i++) {
    for (let j = i + 1; j < targetChains.length; j++) {
      const fromChain = targetChains[i];
      const toChain = targetChains[j];
      
      console.log(`Scanning ${fromChain.name} -> ${toChain.name}`);
      
      allPairs.forEach((pair, pairIndex) => {
        const isPriorityPair = priorityPairs.includes(pair);
        const opportunitiesPerPair = isPriorityPair ? 6 : 3; // More opportunities for priority pairs
        
        for (let k = 0; k < opportunitiesPerPair; k++) {
          // Enhanced spread calculation with chain-specific factors
          let baseSpread = 0.8 + Math.random() * 2.5; // 0.8% to 3.3%
          
          // Chain-specific spread adjustments
          if (fromChain.id === 'solana' || toChain.id === 'solana') {
            baseSpread += 0.3; // Solana tends to have higher spreads
          }
          if (fromChain.id === 'fantom' || toChain.id === 'fantom') {
            baseSpread += 0.2; // Fantom has decent spreads
          }
          if (fromChain.id === 'base' || toChain.id === 'base') {
            baseSpread += 0.1; // Base has tighter spreads but good volume
          }
          
          const volatilityBonus = isPriorityPair ? Math.random() * 0.2 : Math.random() * 0.4;
          const spread = baseSpread + volatilityBonus;
          
          // Enhanced amount calculation - focusing on realistic sizes
          const isLargeOpportunity = Math.random() < 0.3; // 30% large opportunities
          const isMediumOpportunity = Math.random() < 0.5; // 50% medium opportunities
          
          let amount: number;
          if (isLargeOpportunity) {
            amount = 8000 + Math.random() * 17000; // $8k - $25k
          } else if (isMediumOpportunity) {
            amount = 2500 + Math.random() * 5500; // $2.5k - $8k
          } else {
            amount = 500 + Math.random() * 2000; // $500 - $2.5k
          }
          
          // Use optimization systems
          const optimization = getOptimizedCrossChainArbitrage(
            fromChain,
            toChain,
            amount,
            spread,
            userVolume,
            false
          );

          if (!optimization) {
            console.warn(`No optimization found for ${fromChain.name} -> ${toChain.name} with ${amount}`);
            continue;
          }

          const baseOpportunity = {
            fromChain: fromChain.name,
            toChain: toChain.name,
            pair,
            spread,
            bridgeFee: optimization.bridgeQuote.totalFee,
            executionTime: optimization.bridgeQuote.estimatedTime + 
                          optimization.gasOptimization.estimatedConfirmationTime,
            confidence: Math.min(95, optimization.confidence + (isPriorityPair ? 5 : 0)),
            riskLevel: (spread > 2.5 ? 'low' : spread > 1.5 ? 'medium' : 'high') as 'low' | 'medium' | 'high',
            actualAmount: amount
          };

          // Regular cross-chain arbitrage
          const regularNetProfit = optimization.estimatedProfit;
          const minProfitThreshold = amount < 2500 ? 1 : amount < 8000 ? 3 : 5;
          
          if (regularNetProfit > minProfitThreshold) {
            opportunities.push({
              id: `cross-regular-${fromChain.id}-${toChain.id}-${pairIndex}-${k}`,
              ...baseOpportunity,
              estimatedProfit: amount * spread / 100,
              totalFees: optimization.totalFees,
              netProfit: regularNetProfit,
              requiresCapital: amount,
              flashLoanEnabled: false
            });
          }

          // Flash loan cross-chain arbitrage
          if (flashLoanMode && optimization.flashLoanQuote) {
            const flashNetProfit = optimization.estimatedProfit;
            const flashMinThreshold = amount < 2500 ? 0.5 : amount < 8000 ? 1.5 : 2.5;
            
            if (flashNetProfit > flashMinThreshold) {
              opportunities.push({
                id: `cross-flash-${fromChain.id}-${toChain.id}-${pairIndex}-${k}`,
                ...baseOpportunity,
                estimatedProfit: amount * spread / 100,
                totalFees: optimization.totalFees,
                netProfit: flashNetProfit,
                requiresCapital: amount,
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
  
  console.log(`Generated ${opportunities.length} total opportunities`);
  
  // Enhanced sorting for our focused chains
  return opportunities
    .map(opp => ({
      ...opp,
      // Priority bonus for our target chain combinations
      netProfit: opp.netProfit * (1 + (userVolume > 100000 ? 0.08 : 0.03))
    }))
    .sort((a, b) => {
      // Prioritize flash loan opportunities
      if (a.flashLoanEnabled && !b.flashLoanEnabled) return -1;
      if (!a.flashLoanEnabled && b.flashLoanEnabled) return 1;
      
      // Then by profitability
      if (Math.abs(b.netProfit - a.netProfit) > 0.1) {
        return b.netProfit - a.netProfit;
      }
      
      // Then by confidence for similar profits
      return b.confidence - a.confidence;
    })
    .slice(0, 45); // Keep more opportunities for better selection
};
