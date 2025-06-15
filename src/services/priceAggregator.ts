
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
  private static isLiveMode = false;

  static async initialize() {
    const config = await ConfigurationService.loadConfiguration();
    this.isLiveMode = config.enableRealTimeMode;
    
    if (this.isLiveMode && ConfigurationService.hasApiKeys()) {
      LivePriceService.setConfig(config);
      console.log('PriceAggregator: Live mode enabled');
    } else {
      console.log('PriceAggregator: Demo mode active');
    }
  }

  static async getTokenPrice(symbol: string, chainId?: string): Promise<TokenPrice | null> {
    const cacheKey = `${symbol}-${chainId || 'all'}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < 30000) { // 30 second cache
      return cached;
    }

    try {
      let price: TokenPrice | null = null;

      if (this.isLiveMode) {
        // Use live price service
        const livePrice = await LivePriceService.getAggregatedPrice(symbol, chainId ? parseInt(chainId) : undefined);
        if (livePrice) {
          price = livePrice;
        }
      }

      // Fallback to mock data if live mode fails or is disabled
      if (!price) {
        price = await this.getMockPrice(symbol);
      }

      if (price) {
        this.priceCache.set(cacheKey, price);
        this.notifyListeners();
      }
      
      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return cached || await this.getMockPrice(symbol);
    }
  }

  private static async getMockPrice(symbol: string): Promise<TokenPrice> {
    // Enhanced mock data that's more realistic
    const basePrices: Record<string, number> = {
      'SOL': 23.45,
      'ETH': 2340,
      'USDC': 1.00,
      'USDT': 1.00,
      'BTC': 43500
    };

    const basePrice = basePrices[symbol] || 100;
    const variance = basePrice * 0.02; // 2% variance
    
    return {
      symbol,
      price: basePrice + (Math.random() - 0.5) * variance,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: 1000000 + Math.random() * 5000000,
      lastUpdated: Date.now(),
      source: this.isLiveMode ? 'live-fallback' : 'mock'
    };
  }

  static async getDEXPrices(pair: string, chainId: string): Promise<DEXPrice[]> {
    const cacheKey = `${pair}-${chainId}`;
    const cached = this.dexPriceCache.get(cacheKey);
    
    if (cached && Date.now() - 30000 < Date.now()) {
      return cached;
    }

    try {
      let prices: DEXPrice[] = [];

      if (this.isLiveMode) {
        // In live mode, we would fetch from actual DEX APIs
        prices = await this.fetchLiveDEXPrices(pair, chainId);
      } else {
        prices = await this.getMockDEXPrices(pair, chainId);
      }

      this.dexPriceCache.set(cacheKey, prices);
      return prices;
    } catch (error) {
      console.error(`Error fetching DEX prices for ${pair}:`, error);
      return cached || await this.getMockDEXPrices(pair, chainId);
    }
  }

  private static async fetchLiveDEXPrices(pair: string, chainId: string): Promise<DEXPrice[]> {
    // This would integrate with actual DEX APIs like Jupiter, 1inch aggregators
    // For now, return enhanced mock data
    return this.getMockDEXPrices(pair, chainId);
  }

  private static async getMockDEXPrices(pair: string, chainId: string): Promise<DEXPrice[]> {
    const dexes = chainId === '1' ? 
      ['Uniswap V3', 'SushiSwap', 'Curve', 'Balancer', '1inch', 'Paraswap'] :
      ['Raydium', 'Orca', 'Jupiter', 'Serum'];
    
    const basePrice = 23.45;
    
    return dexes.map(dex => ({
      dex,
      pair,
      price: basePrice + (Math.random() - 0.5) * 0.5,
      liquidity: 1000000 + Math.random() * 5000000,
      volume24h: 500000 + Math.random() * 2000000,
      spread: 0.05 + Math.random() * 0.15
    }));
  }

  static subscribe(callback: (prices: Map<string, TokenPrice>) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.priceCache));
  }

  static startRealTimeUpdates(): void {
    setInterval(async () => {
      // Update popular tokens
      const popularTokens = ['SOL', 'ETH', 'USDC', 'USDT'];
      await Promise.all(popularTokens.map(token => this.getTokenPrice(token)));
    }, 5000);
  }

  static getLiveModeStatus(): { isLive: boolean; hasApiKeys: boolean } {
    return {
      isLive: this.isLiveMode,
      hasApiKeys: ConfigurationService.hasApiKeys()
    };
  }
}
