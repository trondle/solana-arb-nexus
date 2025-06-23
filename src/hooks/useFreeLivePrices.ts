
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

export const useFreeLivePrices = (tokens: string[] = ['SOL', 'USDC', 'USDT', 'ETH']) => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string>('');
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Initialize API key
  useEffect(() => {
    FreeMevApi.initialize();
    const defaultKey = InternalApiService.getDefaultApiKey();
    setApiKey(defaultKey);
    console.log('🔑 Using API key for free price service:', defaultKey?.substring(0, 20) + '...');
  }, []);

  const fetchPrices = useCallback(async () => {
    if (!apiKey) return;

    try {
      setError('');
      
      const response = await FreeMevApi.getMevOpportunities(tokens, apiKey);
      
      if (response.success) {
        const newPrices: Record<string, LivePrice> = {};
        
        // Process price data
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
        setLastUpdate(new Date(response.data.timestamp));
        setIsConnected(true);
        
        console.log(`✅ Free API: Updated ${Object.keys(newPrices).length} prices, ${response.data.arbitrageOpportunities?.length || 0} opportunities`);
      } else {
        throw new Error('API request failed');
      }
      
    } catch (err) {
      console.error('Error fetching free live prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setIsConnected(false);
    }
  }, [tokens, apiKey]);

  useEffect(() => {
    if (!apiKey) return;
    
    // Initial fetch
    fetchPrices();
    
    // Set up regular updates
    const interval = setInterval(fetchPrices, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [fetchPrices, apiKey]);

  const refreshPrices = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  const getBestArbitrageOpportunities = useCallback(() => {
    return arbitrageOpportunities
      .filter(opp => opp.profitPercent > 0.1)
      .sort((a, b) => b.profitPercent - a.profitPercent)
      .slice(0, 5);
  }, [arbitrageOpportunities]);

  return {
    prices,
    arbitrageOpportunities,
    bestOpportunities: getBestArbitrageOpportunities(),
    isConnected,
    lastUpdate,
    error,
    refreshPrices,
    apiKey: apiKey ? apiKey.substring(0, 20) + '...' : null
  };
};
