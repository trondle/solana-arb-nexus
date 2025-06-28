
import { LivePriceService } from './livePriceService';
import { ConfigurationService } from './configurationService';

interface PriceSource {
  name: string;
  url: string;
  active: boolean;
}

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: number;
  source: string;
}

interface DEXPrice {
  dex: string;
  pair: string;
  price: number;
  liquidity: number;
  volume24h: number;
  spread: number;
}

export class PriceAggregator {
  private static sources: PriceSource[] = [
    { name: 'Jupiter', url: 'https://price.jup.ag/v4', active: true },
    { name: '1inch', url: 'https://api.1inch.dev/price/v1.1', active: true },
    { name: 'CoinGecko', url: 'https://api.coingecko.com/api/v3', active: true }
  ];

  private static priceCache = new Map<string, TokenPrice>();
  private static dexPriceCache = new Map<string, DEXPrice[]>();
  private static listeners = new Set<(prices: Map<string, TokenPrice>) => void>();
  private static isLiveMode = true; // Always live mode

  static async initialize() {
    const config = await ConfigurationService.loadConfiguration();
    this.isLiveMode = true; // Force live mode
    
    if (ConfigurationService.hasApiKeys()) {
      LivePriceService.setConfig(config);
      console.log('🚀 PriceAggregator: LIVE MODE ONLY - Mock data removed');
    } else {
      throw new Error('API keys required for live trading. Mock data has been removed.');
    }
  }

  static async getTokenPrice(symbol: string, chainId?: string): Promise<TokenPrice | null> {
    const cacheKey = `${symbol}-${chainId || 'all'}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < 5000) { // 5 second cache for live trading
      return cached;
    }

    try {
      // ONLY use live price service - no fallbacks to mock data
      const livePrice = await LivePriceService.getAggregatedPrice(symbol, chainId ? parseInt(chainId) : undefined);
      
      if (!livePrice) {
        throw new Error(`Failed to get live price for ${symbol}. Live trading requires real data.`);
      }

      this.priceCache.set(cacheKey, livePrice);
      this.notifyListeners();
      
      console.log(`🔴 LIVE: ${symbol} = $${livePrice.price} from ${livePrice.source}`);
      return livePrice;
    } catch (error) {
      console.error(`🚫 LIVE TRADING ERROR - Failed to get price for ${symbol}:`, error);
      throw error; // Don't return mock data - throw error for live trading
    }
  }

  static async getDEXPrices(pair: string, chainId: string): Promise<DEXPrice[]> {
    const cacheKey = `${pair}-${chainId}`;
    const cached = this.dexPriceCache.get(cacheKey);
    
    if (cached && Date.now() - 5000 < Date.now()) { // 5 second cache
      return cached;
    }

    try {
      // ONLY fetch from live DEX APIs - no mock data
      const prices = await this.fetchLiveDEXPrices(pair, chainId);
      
      if (prices.length === 0) {
        throw new Error(`No live DEX prices available for ${pair} on chain ${chainId}`);
      }

      this.dexPriceCache.set(cacheKey, prices);
      return prices;
    } catch (error) {
      console.error(`🚫 LIVE DEX ERROR for ${pair}:`, error);
      throw error; // No fallback to mock data
    }
  }

  private static async fetchLiveDEXPrices(pair: string, chainId: string): Promise<DEXPrice[]> {
    // Real DEX integration - remove all mock data
    const config = await ConfigurationService.loadConfiguration();
    
    try {
      if (chainId === '101') { // Solana
        return await this.fetchSolanaDEXPrices(pair);
      } else if (chainId === '8453') { // Base
        return await this.fetchBaseDEXPrices(pair);
      } else if (chainId === '250') { // Fantom
        return await this.fetchFantomDEXPrices(pair);
      }
      
      throw new Error(`Unsupported chain ${chainId} for live DEX prices`);
    } catch (error) {
      console.error('Live DEX fetch failed:', error);
      throw error;
    }
  }

  private static async fetchSolanaDEXPrices(pair: string): Promise<DEXPrice[]> {
    try {
      // Jupiter aggregator API for real Solana DEX prices
      const response = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${pair.split('/')[0]}&outputMint=${pair.split('/')[1]}&amount=1000000`);
      const data = await response.json();
      
      if (data.routePlan) {
        return data.routePlan.map((route: any) => ({
          dex: route.swapInfo.label,
          pair,
          price: parseFloat(route.swapInfo.outAmount) / 1000000,
          liquidity: route.swapInfo.feeAmount || 0,
          volume24h: 0, // Would need additional API call
          spread: parseFloat(route.swapInfo.priceImpactPct || '0')
        }));
      }
      
      throw new Error('No Solana DEX data available');
    } catch (error) {
      console.error('Solana DEX fetch failed:', error);
      throw error;
    }
  }

  private static async fetchBaseDEXPrices(pair: string): Promise<DEXPrice[]> {
    // Real Base chain DEX integration would go here
    throw new Error('Base DEX integration not yet implemented - live data required');
  }

  private static async fetchFantomDEXPrices(pair: string): Promise<DEXPrice[]> {
    // Real Fantom DEX integration would go here
    throw new Error('Fantom DEX integration not yet implemented - live data required');
  }

  static subscribe(callback: (prices: Map<string, TokenPrice>) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.priceCache));
  }

  static startRealTimeUpdates(): void {
    console.log('🔴 LIVE MODE: Starting real-time price updates');
    setInterval(async () => {
      const popularTokens = ['SOL', 'ETH', 'USDC', 'USDT'];
      await Promise.all(popularTokens.map(token => 
        this.getTokenPrice(token).catch(err => 
          console.error(`Failed to update ${token}:`, err)
        )
      ));
    }, 2000); // 2 second updates for live trading
  }

  static getLiveModeStatus(): { isLive: boolean; hasApiKeys: boolean } {
    return {
      isLive: true, // Always live
      hasApiKeys: ConfigurationService.hasApiKeys()
    };
  }
}
