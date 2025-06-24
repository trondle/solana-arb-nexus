
import { useState, useEffect, useMemo } from 'react';
import { ChainConfig } from '../config/types';
import { scanCrossChainOpportunities, CrossChainOpportunity } from '../services/opportunityScanner';
import { getBestFlashLoanProvider, getBestDexRoute } from '../utils/flashLoanOptimizer';
import { useFreeLivePrices } from './useFreeLivePrices';

export type { ChainConfig } from '../config/types';
export type { CrossChainOpportunity } from '../services/opportunityScanner';

// Focus on your 3 target chains only
const TARGET_CHAINS: ChainConfig[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    chainId: 0,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    enabled: true,
    color: '#9945FF',
    gasCost: 0.000005,
    blockTime: 400,
    networkFee: 0.000005,
    flashLoanProviders: [
      { name: 'Solend', fee: 0.09, maxAmount: 1000000, minAmount: 1000, available: true, reliability: 95 },
      { name: 'Mango', fee: 0.05, maxAmount: 500000, minAmount: 500, available: true, reliability: 90 }
    ],
    dexes: [
      { name: 'Raydium', fee: 0.25, liquidity: 50000000, slippage: 0.1 },
      { name: 'Orca', fee: 0.3, liquidity: 30000000, slippage: 0.15 },
      { name: 'Jupiter', fee: 0.2, liquidity: 80000000, slippage: 0.1 }
    ]
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    enabled: true,
    color: '#0052FF',
    gasCost: 0.001,
    blockTime: 2000,
    networkFee: 0.0005,
    flashLoanProviders: [
      { name: 'Aave V3', fee: 0.09, maxAmount: 2000000, minAmount: 1000, available: true, reliability: 98 }
    ],
    dexes: [
      { name: 'Uniswap V3', fee: 0.3, liquidity: 100000000, slippage: 0.1 },
      { name: 'SushiSwap', fee: 0.25, liquidity: 20000000, slippage: 0.2 }
    ]
  },
  {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    chainId: 250,
    rpcUrl: 'https://rpc.ftm.tools',
    enabled: true,
    color: '#1969FF',
    gasCost: 0.0001,
    blockTime: 1000,
    networkFee: 0.00005,
    flashLoanProviders: [
      { name: 'Geist', fee: 0.09, maxAmount: 1000000, minAmount: 500, available: true, reliability: 88 }
    ],
    dexes: [
      { name: 'SpookySwap', fee: 0.2, liquidity: 15000000, slippage: 0.15 },
      { name: 'SpiritSwap', fee: 0.25, liquidity: 8000000, slippage: 0.2 }
    ]
  }
];

export function useMultiChainManager() {
  const [chains, setChains] = useState<ChainConfig[]>(TARGET_CHAINS);
  const [crossChainOpportunities, setCrossChainOpportunities] = useState<CrossChainOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [flashLoanMode, setFlashLoanMode] = useState(false);

  // Get live data from free prices service
  const { arbitrageOpportunities, isConnected } = useFreeLivePrices(['SOL', 'ETH', 'USDC', 'USDT', 'FTM']);

  const enabledChains = useMemo(() => chains.filter(chain => chain.enabled), [chains]);

  const toggleChain = (chainId: string) => {
    setChains(prev => prev.map(chain => 
      chain.id === chainId ? { ...chain, enabled: !chain.enabled } : chain
    ));
  };

  // Convert live arbitrage opportunities to cross-chain opportunities
  useEffect(() => {
    if (flashLoanMode && isConnected && arbitrageOpportunities.length > 0) {
      const liveOpportunities: CrossChainOpportunity[] = arbitrageOpportunities.map((opp, index) => ({
        id: `live-${index}`,
        fromChain: typeof opp.buyChain === 'string' ? opp.buyChain : 
                   opp.buyChain === 8453 ? 'base' : 
                   opp.buyChain === 250 ? 'fantom' : 'solana',
        toChain: typeof opp.sellChain === 'string' ? opp.sellChain : 
                opp.sellChain === 8453 ? 'base' : 
                opp.sellChain === 250 ? 'fantom' : 'solana',
        token: opp.token,
        pair: `${opp.token}/USDC`,
        buyPrice: opp.buyPrice,
        sellPrice: opp.sellPrice,
        spread: opp.profitPercent,
        estimatedProfit: opp.estimatedProfit,
        confidence: opp.confidence,
        riskLevel: opp.riskLevel,
        lastUpdated: Date.now(),
        bridgeFee: 0.1, // Default bridge fee
        gasCost: 0.01, // Default gas cost
        totalFees: 0.11, // bridgeFee + gasCost
        netProfit: Math.max(0, opp.estimatedProfit - 0.11), // profit minus fees
        executionTime: 5000, // 5 seconds default
        liquidityDepth: 1000000, // Default liquidity
        slippageImpact: 0.1 // Default slippage
      }));
      
      setCrossChainOpportunities(liveOpportunities);
      console.log(`🔄 Updated ${liveOpportunities.length} live cross-chain opportunities`);
    } else if (!flashLoanMode) {
      // Only clear opportunities when flash loan mode is disabled
      setCrossChainOpportunities([]);
    }
  }, [arbitrageOpportunities, flashLoanMode, isConnected]);

  // Set scanning state based on connection status
  useEffect(() => {
    setIsScanning(!isConnected && flashLoanMode);
  }, [isConnected, flashLoanMode]);

  return {
    chains,
    enabledChains,
    crossChainOpportunities,
    isScanning,
    flashLoanMode,
    toggleChain,
    setFlashLoanMode,
    scanCrossChainOpportunities: () => {}, // No longer needed with live data
    getBestFlashLoanProvider,
    getBestDexRoute
  };
}
