
import { useState, useEffect, useMemo } from 'react';

export interface ChainConfig {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  flashLoanProviders: FlashLoanProvider[];
  dexes: DEXConfig[];
  gasCost: number;
  blockTime: number;
  enabled: boolean;
  networkFee: number;
}

export interface FlashLoanProvider {
  name: string;
  fee: number;
  maxAmount: number;
  minAmount: number;
  available: boolean;
  reliability: number;
}

export interface DEXConfig {
  name: string;
  fee: number;
  liquidity: number;
  slippage: number;
}

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

const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    gasCost: 0.000005,
    blockTime: 400,
    enabled: true,
    networkFee: 0.01,
    flashLoanProviders: [
      { name: 'Solend', fee: 0.09, maxAmount: 1000000, minAmount: 1000, available: true, reliability: 96 },
      { name: 'Mango', fee: 0.05, maxAmount: 500000, minAmount: 500, available: true, reliability: 98 }
    ],
    dexes: [
      { name: 'Raydium', fee: 0.25, liquidity: 50000000, slippage: 0.1 },
      { name: 'Orca', fee: 0.30, liquidity: 40000000, slippage: 0.15 }
    ]
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerUrl: 'https://etherscan.io',
    gasCost: 0.003,
    blockTime: 12000,
    enabled: true,
    networkFee: 0.15,
    flashLoanProviders: [
      { name: 'Aave', fee: 0.09, maxAmount: 10000000, minAmount: 1000, available: true, reliability: 99 },
      { name: 'dYdX', fee: 0.00, maxAmount: 5000000, minAmount: 1000, available: true, reliability: 95 }
    ],
    dexes: [
      { name: 'Uniswap V3', fee: 0.30, liquidity: 500000000, slippage: 0.05 },
      { name: 'SushiSwap', fee: 0.30, liquidity: 200000000, slippage: 0.08 }
    ]
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    gasCost: 0.0003,
    blockTime: 1000,
    enabled: false,
    networkFee: 0.02,
    flashLoanProviders: [
      { name: 'Aave', fee: 0.09, maxAmount: 5000000, minAmount: 500, available: true, reliability: 98 }
    ],
    dexes: [
      { name: 'Camelot', fee: 0.25, liquidity: 100000000, slippage: 0.1 }
    ]
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    gasCost: 0.001,
    blockTime: 2000,
    enabled: false,
    networkFee: 0.005,
    flashLoanProviders: [
      { name: 'Aave', fee: 0.09, maxAmount: 3000000, minAmount: 100, available: true, reliability: 97 }
    ],
    dexes: [
      { name: 'QuickSwap', fee: 0.30, liquidity: 80000000, slippage: 0.12 }
    ]
  }
];

export function useMultiChainManager() {
  const [chains, setChains] = useState<ChainConfig[]>(SUPPORTED_CHAINS);
  const [crossChainOpportunities, setCrossChainOpportunities] = useState<CrossChainOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [flashLoanMode, setFlashLoanMode] = useState(false);

  const enabledChains = useMemo(() => chains.filter(chain => chain.enabled), [chains]);

  const toggleChain = (chainId: string) => {
    setChains(prev => prev.map(chain => 
      chain.id === chainId ? { ...chain, enabled: !chain.enabled } : chain
    ));
  };

  const getBestFlashLoanProvider = (chain: ChainConfig, amount: number) => {
    const availableProviders = chain.flashLoanProviders.filter(
      provider => provider.available && 
                 amount >= provider.minAmount && 
                 amount <= provider.maxAmount
    );
    
    return availableProviders.sort((a, b) => {
      const feeScore = a.fee - b.fee;
      if (Math.abs(feeScore) < 0.001) {
        return b.reliability - a.reliability;
      }
      return feeScore;
    })[0];
  };

  const scanCrossChainOpportunities = async () => {
    setIsScanning(true);
    
    const opportunities: CrossChainOpportunity[] = [];
    const pairs = ['USDC/USDT', 'ETH/USDC', 'BTC/USDC', 'SOL/USDC'];
    
    for (let i = 0; i < enabledChains.length; i++) {
      for (let j = i + 1; j < enabledChains.length; j++) {
        const fromChain = enabledChains[i];
        const toChain = enabledChains[j];
        
        pairs.forEach((pair, index) => {
          const spread = 0.5 + Math.random() * 2.5; // 0.5% to 3%
          const amount = 10000 + Math.random() * 90000;
          const bridgeFee = amount * 0.001; // 0.1% bridge fee
          const gasFeesTotal = fromChain.gasCost + toChain.gasCost;
          const networkFees = fromChain.networkFee + toChain.networkFee;
          
          // Generate both regular and flash loan opportunities
          const baseOpportunity = {
            fromChain: fromChain.name,
            toChain: toChain.name,
            pair,
            spread,
            bridgeFee,
            executionTime: fromChain.blockTime + toChain.blockTime + 5000,
            confidence: 70 + Math.random() * 25,
            riskLevel: (spread > 2 ? 'low' : spread > 1 ? 'medium' : 'high') as 'low' | 'medium' | 'high'
          };

          // Regular cross-chain arbitrage (requires capital)
          const regularTotalFees = bridgeFee + gasFeesTotal + networkFees;
          const regularEstimatedProfit = amount * spread / 100;
          const regularNetProfit = regularEstimatedProfit - regularTotalFees;
          
          if (regularNetProfit > 5) {
            opportunities.push({
              id: `cross-regular-${fromChain.id}-${toChain.id}-${index}`,
              ...baseOpportunity,
              estimatedProfit: regularEstimatedProfit,
              totalFees: regularTotalFees,
              netProfit: regularNetProfit,
              requiresCapital: amount,
              flashLoanEnabled: false
            });
          }

          // Flash loan cross-chain arbitrage (zero capital required)
          const bestFromProvider = getBestFlashLoanProvider(fromChain, amount);
          if (bestFromProvider && flashLoanMode) {
            const flashLoanFee = amount * bestFromProvider.fee / 100;
            const flashTotalFees = bridgeFee + gasFeesTotal + networkFees + flashLoanFee;
            const flashEstimatedProfit = amount * spread / 100;
            const flashNetProfit = flashEstimatedProfit - flashTotalFees;
            
            if (flashNetProfit > 3) { // Lower threshold for flash loans since capital efficiency is higher
              opportunities.push({
                id: `cross-flash-${fromChain.id}-${toChain.id}-${index}`,
                ...baseOpportunity,
                estimatedProfit: flashEstimatedProfit,
                totalFees: flashTotalFees,
                netProfit: flashNetProfit,
                requiresCapital: 0,
                flashLoanEnabled: true,
                flashLoanProvider: bestFromProvider.name,
                flashLoanFee
              });
            }
          }
        });
      }
    }
    
    setCrossChainOpportunities(opportunities.sort((a, b) => b.netProfit - a.netProfit));
    setIsScanning(false);
  };

  useEffect(() => {
    if (enabledChains.length > 1) {
      scanCrossChainOpportunities();
      const interval = setInterval(scanCrossChainOpportunities, 15000);
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
    scanCrossChainOpportunities
  };
}
