
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

  static async getTokenPrice(symbol: string, chainId?: string): Promise<TokenPrice | null> {
    const cacheKey = `${symbol}-${chainId || 'all'}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < 30000) { // 30 second cache
      return cached;
    }

    try {
      const price = await this.fetchFromMultipleSources(symbol, chainId);
      if (price) {
        this.priceCache.set(cacheKey, price);
        this.notifyListeners();
      }
      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return cached || null;
    }
  }

  static async getDEXPrices(pair: string, chainId: string): Promise<DEXPrice[]> {
    const cacheKey = `${pair}-${chainId}`;
    const cached = this.dexPriceCache.get(cacheKey);
    
    if (cached && Date.now() - 30000 < Date.now()) {
      return cached;
    }

    try {
      const prices = await this.fetchDEXPrices(pair, chainId);
      this.dexPriceCache.set(cacheKey, prices);
      return prices;
    } catch (error) {
      console.error(`Error fetching DEX prices for ${pair}:`, error);
      return cached || [];
    }
  }

  private static async fetchFromMultipleSources(symbol: string, chainId?: string): Promise<TokenPrice | null> {
    const promises = this.sources
      .filter(source => source.active)
      .map(source => this.fetchFromSource(source, symbol, chainId));

    const results = await Promise.allSettled(promises);
    const successful = results
      .filter((result): result is PromiseFulfilledResult<TokenPrice | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value!);

    if (successful.length === 0) return null;

    // Use weighted average based on source reliability
    const weights = { 'Jupiter': 0.4, '1inch': 0.35, 'CoinGecko': 0.25 };
    let totalWeight = 0;
    let weightedPrice = 0;
    let weightedVolume = 0;

    successful.forEach(price => {
      const weight = weights[price.source as keyof typeof weights] || 0.1;
      totalWeight += weight;
      weightedPrice += price.price * weight;
      weightedVolume += price.volume24h * weight;
    });

    return {
      symbol,
      price: weightedPrice / totalWeight,
      change24h: successful[0].change24h, // Use first source for change
      volume24h: weightedVolume / totalWeight,
      lastUpdated: Date.now(),
      source: 'aggregated'
    };
  }

  private static async fetchFromSource(source: PriceSource, symbol: string, chainId?: string): Promise<TokenPrice | null> {
    try {
      switch (source.name) {
        case 'Jupiter':
          return await this.fetchFromJupiter(symbol);
        case '1inch':
          return await this.fetchFrom1inch(symbol, chainId);
        case 'CoinGecko':
          return await this.fetchFromCoinGecko(symbol);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
      return null;
    }
  }

  private static async fetchFromJupiter(symbol: string): Promise<TokenPrice | null> {
    // Mock implementation - in production, use actual Jupiter API
    const mockPrice = 23.45 + (Math.random() - 0.5) * 2;
    return {
      symbol,
      price: mockPrice,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: 1000000 + Math.random() * 5000000,
      lastUpdated: Date.now(),
      source: 'Jupiter'
    };
  }

  private static async fetchFrom1inch(symbol: string, chainId?: string): Promise<TokenPrice | null> {
    // Mock implementation - in production, use actual 1inch API
    const mockPrice = 23.47 + (Math.random() - 0.5) * 2;
    return {
      symbol,
      price: mockPrice,
      change24h: (Math.random() - 0.5) * 8,
      volume24h: 800000 + Math.random() * 3000000,
      lastUpdated: Date.now(),
      source: '1inch'
    };
  }

  private static async fetchFromCoinGecko(symbol: string): Promise<TokenPrice | null> {
    // Mock implementation - in production, use actual CoinGecko API
    const mockPrice = 23.43 + (Math.random() - 0.5) * 1.5;
    return {
      symbol,
      price: mockPrice,
      change24h: (Math.random() - 0.5) * 6,
      volume24h: 1200000 + Math.random() * 4000000,
      lastUpdated: Date.now(),
      source: 'CoinGecko'
    };
  }

  private static async fetchDEXPrices(pair: string, chainId: string): Promise<DEXPrice[]> {
    // Mock implementation - in production, fetch from multiple DEXs
    const dexes = ['Uniswap V3', 'SushiSwap', 'Curve', 'Balancer', '1inch', 'Paraswap'];
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
}
