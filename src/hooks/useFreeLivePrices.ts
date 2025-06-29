
import { useState, useEffect, useCallback } from 'react';
import { FreeMevApi } from '@/services/freeMevApi';
import { InternalApiService } from '@/services/internalApiService';

interface LivePrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: number;
  source: string;
  chain?: string;
  chainId?: number;
}

interface ArbitrageOpportunity {
  token: string;
  buyChain: number | string;
  sellChain: number | string;
  buyPrice: number;
  sellPrice: number;
  profitPercent: number;
  estimatedProfit: number;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface FlashLoanArbitrageOpportunity {
  id: string;
  pair: string;
  buyDex: string;
  sellDex: string;
  spread: number;
  estimatedProfit: number;
  requiredCapital: number;
  flashLoanFee: number;
  totalFees: number;
  netProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export const useFreeLivePrices = (tokens: string[] = ['SOL', 'USDC', 'USDT', 'ETH']) => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [flashLoanOpportunities, setFlashLoanOpportunities] = useState<FlashLoanArbitrageOpportunity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string>('');
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Initialize API key
  useEffect(() => {
    FreeMevApi.initialize();
    const defaultKey = InternalApiService.getDefaultApiKey();
    setApiKey(defaultKey);
    console.log('🔑 Using optimized API key for price service');
  }, []);

  const fetchPrices = useCallback(async () => {
    if (!apiKey) return;

    try {
      setError('');
      
      const response = await FreeMevApi.getMevOpportunities(tokens, apiKey);
      
      if (response.success) {
        const newPrices: Record<string, LivePrice> = {};
        
        // Process price data efficiently
        response.data.prices.forEach((tokenData: any) => {
          if (tokenData.solana) {
            newPrices[`${tokenData.token}-SOL`] = {
              symbol: tokenData.token,
              price: tokenData.solana.price,
              change24h: tokenData.solana.change24h,
              volume24h: tokenData.solana.volume24h,
              lastUpdated: response.data.timestamp,
              source: tokenData.solana.source,
              chain: 'solana'
            };
          }
          
          if (tokenData.base) {
            newPrices[`${tokenData.token}-BASE`] = {
              symbol: tokenData.token,
              price: tokenData.base.price,
              change24h: tokenData.base.change24h,
              volume24h: tokenData.base.volume24h,
              lastUpdated: response.data.timestamp,
              source: tokenData.base.source,
              chain: 'base',
              chainId: 8453
            };
          }
          
          if (tokenData.fantom) {
            newPrices[`${tokenData.token}-FTM`] = {
              symbol: tokenData.token,
              price: tokenData.fantom.price,
              change24h: tokenData.fantom.change24h,
              volume24h: tokenData.fantom.volume24h,
              lastUpdated: response.data.timestamp,
              source: tokenData.fantom.source,
              chain: 'fantom',
              chainId: 250
            };
          }
        });
        
        setPrices(newPrices);
        setArbitrageOpportunities(response.data.arbitrageOpportunities || []);
        
        // Generate fewer flash loan opportunities to reduce resource usage
        const flashOpportunities = generateOptimizedFlashLoanOpportunities(response.data.arbitrageOpportunities || []);
        setFlashLoanOpportunities(flashOpportunities);
        
        setLastUpdate(new Date(response.data.timestamp));
        setIsConnected(true);
        
        if (!response.data.cached) {
          console.log(`✅ Optimized API: Updated ${Object.keys(newPrices).length} prices, ${flashOpportunities.length} flash loan opportunities`);
        }
      } else {
        throw new Error('API request failed');
      }
      
    } catch (err) {
      console.error('Error fetching optimized live prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setIsConnected(false);
    }
  }, [tokens, apiKey]);

  const generateOptimizedFlashLoanOpportunities = (opportunities: ArbitrageOpportunity[]): FlashLoanArbitrageOpportunity[] => {
    const dexMappings = {
      'solana': ['Raydium', 'Orca', 'Jupiter'],
      'base': ['Uniswap V3', 'SushiSwap'],
      'fantom': ['SpookySwap', 'SpiritSwap']
    };

    return opportunities
      .filter(opp => opp.profitPercent > 0.8) // Higher threshold
      .slice(0, 4) // Limit to 4 opportunities max
      .map((opp, index) => {
        const buyChainName = typeof opp.buyChain === 'string' ? opp.buyChain : 
                           opp.buyChain === 8453 ? 'base' : 
                           opp.buyChain === 250 ? 'fantom' : 'solana';
        const sellChainName = typeof opp.sellChain === 'string' ? opp.sellChain : 
                            opp.sellChain === 8453 ? 'base' : 
                            opp.sellChain === 250 ? 'fantom' : 'solana';

        const buyDexes = dexMappings[buyChainName as keyof typeof dexMappings] || dexMappings.solana;
        const sellDexes = dexMappings[sellChainName as keyof typeof dexMappings] || dexMappings.solana;
        
        const buyDex = buyDexes[Math.floor(Math.random() * buyDexes.length)];
        const sellDex = sellDexes[Math.floor(Math.random() * sellDexes.length)];

        const requiredCapital = 3000 + Math.random() * 12000; // Reduced range
        const flashLoanFee = requiredCapital * 0.05 / 100;
        const tradingFees = requiredCapital * 0.006;
        const totalFees = flashLoanFee + tradingFees;
        const estimatedProfit = requiredCapital * opp.profitPercent / 100;
        const netProfit = estimatedProfit - totalFees;

        return {
          id: `flash-optimized-${index}-${Date.now()}`,
          pair: `${opp.token}/USDC`,
          buyDex,
          sellDex,
          spread: opp.profitPercent,
          estimatedProfit,
          requiredCapital,
          flashLoanFee,
          totalFees,
          netProfit,
          riskLevel: opp.riskLevel.toLowerCase() as 'low' | 'medium' | 'high',
          confidence: opp.confidence
        };
      });
  };

  useEffect(() => {
    if (!apiKey) return;
    
    // Initial fetch
    fetchPrices();
    
    // Reduced update frequency: every 15 seconds instead of 5 seconds
    const interval = setInterval(fetchPrices, 15000);
    
    return () => clearInterval(interval);
  }, [fetchPrices, apiKey]);

  const refreshPrices = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  const getBestArbitrageOpportunities = useCallback(() => {
    return arbitrageOpportunities
      .filter(opp => opp.profitPercent > 0.2)
      .sort((a, b) => b.profitPercent - a.profitPercent)
      .slice(0, 3); // Reduced from 5 to 3
  }, [arbitrageOpportunities]);

  const getBestFlashLoanOpportunities = useCallback(() => {
    return flashLoanOpportunities
      .filter(opp => opp.netProfit > 0)
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 4); // Reduced from 6 to 4
  }, [flashLoanOpportunities]);

  return {
    prices,
    arbitrageOpportunities,
    flashLoanOpportunities: getBestFlashLoanOpportunities(),
    bestOpportunities: getBestArbitrageOpportunities(),
    isConnected,
    lastUpdate,
    error,
    refreshPrices,
    apiKey: apiKey ? apiKey.substring(0, 20) + '...' : null
  };
};
