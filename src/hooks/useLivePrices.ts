
import { useState, useEffect, useCallback } from 'react';
import { PersonalApiService } from '@/services/personalApiService';
import { LivePriceService } from '@/services/livePriceService';

interface LivePrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: number;
  source: string;
  chainId?: number;
}

interface ArbitragePrice {
  token: string;
  solanaPrice?: LivePrice;
  basePrice?: LivePrice;
  fantomPrice?: LivePrice;
  bestBuy?: { price: number; chain: string };
  bestSell?: { price: number; chain: string };
  profitOpportunity?: number;
}

export const useLivePrices = (tokens: string[] = ['SOL', 'USDC', 'USDT', 'ETH']) => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [arbitragePrices, setArbitragePrices] = useState<ArbitragePrice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string>('');

  const fetchPrices = useCallback(async () => {
    try {
      const newPrices: Record<string, LivePrice> = {};
      const newArbitragePrices: ArbitragePrice[] = [];

      for (const token of tokens) {
        const arbitrageData: ArbitragePrice = { token };

        // Get Solana price
        if (['SOL', 'USDC', 'USDT'].includes(token)) {
          const solanaPrice = await PersonalApiService.getSolanaPrice(token);
          if (solanaPrice) {
            newPrices[`${token}-SOL`] = {
              symbol: token,
              price: solanaPrice.price,
              change24h: solanaPrice.change24h,
              volume24h: solanaPrice.volume24h,
              lastUpdated: solanaPrice.lastUpdated,
              source: solanaPrice.source
            };
            arbitrageData.solanaPrice = newPrices[`${token}-SOL`];
          }
        }

        // Get Base price
        if (['ETH', 'USDC', 'USDT'].includes(token)) {
          const basePrice = await PersonalApiService.getEVMPrice(8453, token);
          if (basePrice) {
            newPrices[`${token}-BASE`] = {
              symbol: token,
              price: basePrice.price,
              change24h: basePrice.change24h,
              volume24h: basePrice.volume24h,
              lastUpdated: basePrice.lastUpdated,
              source: basePrice.source,
              chainId: 8453
            };
            arbitrageData.basePrice = newPrices[`${token}-BASE`];
          }
        }

        // Get Fantom price
        if (['FTM', 'USDC', 'USDT'].includes(token)) {
          const fantomPrice = await PersonalApiService.getEVMPrice(250, token === 'FTM' ? 'FTM' : token);
          if (fantomPrice) {
            newPrices[`${token}-FTM`] = {
              symbol: token,
              price: fantomPrice.price,
              change24h: fantomPrice.change24h,
              volume24h: fantomPrice.volume24h,
              lastUpdated: fantomPrice.lastUpdated,
              source: fantomPrice.source,
              chainId: 250
            };
            arbitrageData.fantomPrice = newPrices[`${token}-FTM`];
          }
        }

        // Calculate arbitrage opportunities
        const chainPrices = [
          { chain: 'Solana', price: arbitrageData.solanaPrice?.price },
          { chain: 'Base', price: arbitrageData.basePrice?.price },
          { chain: 'Fantom', price: arbitrageData.fantomPrice?.price }
        ].filter(p => p.price) as { chain: string; price: number }[];

        if (chainPrices.length >= 2) {
          const sortedPrices = chainPrices.sort((a, b) => a.price - b.price);
          arbitrageData.bestBuy = { price: sortedPrices[0].price, chain: sortedPrices[0].chain };
          arbitrageData.bestSell = { price: sortedPrices[sortedPrices.length - 1].price, chain: sortedPrices[sortedPrices.length - 1].chain };
          
          const profitPercent = ((arbitrageData.bestSell.price - arbitrageData.bestBuy.price) / arbitrageData.bestBuy.price) * 100;
          if (profitPercent > 0.1) { // Only show opportunities > 0.1%
            arbitrageData.profitOpportunity = profitPercent;
          }
        }

        newArbitragePrices.push(arbitrageData);
      }

      setPrices(newPrices);
      setArbitragePrices(newArbitragePrices);
      setLastUpdate(new Date());
      setIsConnected(true);
      setError('');

    } catch (err) {
      console.error('Error fetching live prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setIsConnected(false);
    }
  }, [tokens]);

  const connectWebSocket = useCallback(() => {
    // Connect to Jupiter WebSocket for real-time Solana prices
    const ws = LivePriceService.connectToJupiterWebSocket((data) => {
      console.log('Jupiter WebSocket data:', data);
      // Update prices when WebSocket data arrives
      fetchPrices();
    });

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [fetchPrices]);

  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Set up polling for regular updates
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds

    // Connect WebSocket for real-time updates
    const disconnect = connectWebSocket();

    return () => {
      clearInterval(interval);
      disconnect();
      LivePriceService.disconnectAll();
    };
  }, [fetchPrices, connectWebSocket]);

  const refreshPrices = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  const getBestArbitrageOpportunities = useCallback(() => {
    return arbitragePrices
      .filter(ap => ap.profitOpportunity && ap.profitOpportunity > 0.1)
      .sort((a, b) => (b.profitOpportunity || 0) - (a.profitOpportunity || 0))
      .slice(0, 5);
  }, [arbitragePrices]);

  return {
    prices,
    arbitragePrices,
    bestOpportunities: getBestArbitrageOpportunities(),
    isConnected,
    lastUpdate,
    error,
    refreshPrices
  };
};
