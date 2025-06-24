
import { useState, useEffect, useMemo } from 'react';
import { ChainConfig } from '../config/types';
import { scanCrossChainOpportunities, CrossChainOpportunity } from '../services/opportunityScanner';
import { getBestFlashLoanProvider, getBestDexRoute } from '../utils/flashLoanOptimizer';

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

  const enabledChains = useMemo(() => chains.filter(chain => chain.enabled), [chains]);

  const toggleChain = (chainId: string) => {
    setChains(prev => prev.map(chain => 
      chain.id === chainId ? { ...chain, enabled: !chain.enabled } : chain
    ));
  };

  const scanOpportunities = async () => {
    if (enabledChains.length <= 1) return;
    
    setIsScanning(true);
    try {
      const opportunities = await scanCrossChainOpportunities(enabledChains, flashLoanMode);
      setCrossChainOpportunities(opportunities);
      console.log(`🔍 Scanned ${opportunities.length} opportunities across ${enabledChains.map(c => c.name).join(', ')}`);
    } catch (error) {
      console.error('Error scanning opportunities:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (enabledChains.length > 1) {
      scanOpportunities();
      const interval = setInterval(scanOpportunities, 12000);
      return () => clearInterval(interval);
    }
  }, [enabledChains.length, flashLoanMode]);

  return {
    chains,
    enabledChains,
    crossChainOpportunities,
    isScanning,
    flashLoanMode,
    toggleChain,
    setFlashLoanMode,
    scanCrossChainOpportunities: scanOpportunities,
    getBestFlashLoanProvider,
    getBestDexRoute
  };
}
