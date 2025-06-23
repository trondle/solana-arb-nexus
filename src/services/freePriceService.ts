
interface FreePriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: number;
  source: string;
  chainId?: number;
}

interface PriceStreamSubscription {
  symbol: string;
  chainId?: number;
  callback: (data: FreePriceData) => void;
}

export class FreePriceService {
  private static subscriptions = new Map<string, PriceStreamSubscription[]>();
  private static priceCache = new Map<string, FreePriceData>();
  private static updateInterval: NodeJS.Timeout | null = null;
  private static isStreaming = false;

  // Free public endpoints that don't require API keys
  private static freeEndpoints = {
    binance: 'https://api.binance.com/api/v3',
    coinbase: 'https://api.exchange.coinbase.com',
    kraken: 'https://api.kraken.com/0/public',
    gecko: 'https://api.coingecko.com/api/v3', // Free tier
    dexscreener: 'https://api.dexscreener.com/latest'
  };

  // Token mappings for different chains
  private static tokenMappings = {
    solana: {
      'SOL': { address: 'So11111111111111111111111111111111111111112', symbol: 'SOLUSDT' },
      'USDC': { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDCUSDT' },
      'USDT': { address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDTUSDT' }
    },
    base: {
      'ETH': { address: '0x0000000000000000000000000000000000000000', symbol: 'ETHUSDT' },
      'USDC': { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDCUSDT' }
    },
    fantom: {
      'FTM': { address: '0x0000000000000000000000000000000000000000', symbol: 'FTMUSDT' },
      'USDC': { address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', symbol: 'USDCUSDT' }
    }
  };

  static async getSolanaPrice(symbol: string): Promise<FreePriceData | null> {
    try {
      // Use Binance free API for SOL price
      const response = await fetch(`${this.freeEndpoints.binance}/ticker/24hr?symbol=${symbol}USDT`);
      const data = await response.json();
      
      if (data.symbol) {
        const priceData: FreePriceData = {
          symbol,
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.volume),
          lastUpdated: Date.now(),
          source: 'FreePriceService-Binance'
        };
        
        this.priceCache.set(`SOL-${symbol}`, priceData);
        return priceData;
      }
      
      // Fallback to DexScreener for Solana tokens
      const dexResponse = await fetch(`${this.freeEndpoints.dexscreener}/dex/tokens/${this.tokenMappings.solana[symbol as keyof typeof this.tokenMappings.solana]?.address}`);
      const dexData = await dexResponse.json();
      
      if (dexData.pairs && dexData.pairs.length > 0) {
        const pair = dexData.pairs[0];
        return {
          symbol,
          price: parseFloat(pair.priceUsd),
          change24h: parseFloat(pair.priceChange?.h24 || '0'),
          volume24h: parseFloat(pair.volume?.h24 || '0'),
          lastUpdated: Date.now(),
          source: 'FreePriceService-DexScreener'
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching Solana price for ${symbol}:`, error);
      return this.priceCache.get(`SOL-${symbol}`) || null;
    }
  }

  static async getEVMPrice(chainId: number, symbol: string): Promise<FreePriceData | null> {
    try {
      // Use Binance for major tokens
      if (['ETH', 'FTM', 'USDC', 'USDT'].includes(symbol)) {
        const binanceSymbol = symbol === 'FTM' ? 'FTMUSDT' : `${symbol}USDT`;
        const response = await fetch(`${this.freeEndpoints.binance}/ticker/24hr?symbol=${binanceSymbol}`);
        const data = await response.json();
        
        if (data.symbol) {
          const priceData: FreePriceData = {
            symbol,
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            volume24h: parseFloat(data.volume),
            lastUpdated: Date.now(),
            source: 'FreePriceService-Binance',
            chainId
          };
          
          this.priceCache.set(`${chainId}-${symbol}`, priceData);
          return priceData;
        }
      }
      
      // Fallback to Coinbase for ETH
      if (symbol === 'ETH') {
        const response = await fetch(`${this.freeEndpoints.coinbase}/products/ETH-USD/ticker`);
        const data = await response.json();
        
        if (data.price) {
          return {
            symbol,
            price: parseFloat(data.price),
            change24h: 0, // Coinbase doesn't provide 24h change in this endpoint
            volume24h: parseFloat(data.volume),
            lastUpdated: Date.now(),
            source: 'FreePriceService-Coinbase',
            chainId
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching EVM price for ${symbol} on chain ${chainId}:`, error);
      return this.priceCache.get(`${chainId}-${symbol}`) || null;
    }
  }

  static async getMarketPrice(symbol: string): Promise<FreePriceData | null> {
    try {
      const coinIds = {
        'SOL': 'solana',
        'ETH': 'ethereum',
        'FTM': 'fantom',
        'USDC': 'usd-coin',
        'USDT': 'tether'
      };
      
      const coinId = coinIds[symbol as keyof typeof coinIds];
      if (!coinId) return null;
      
      // Use CoinGecko free tier (no API key required)
      const response = await fetch(
        `${this.freeEndpoints.gecko}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      );
      
      const data = await response.json();
      
      if (data[coinId]) {
        const tokenData = data[coinId];
        return {
          symbol,
          price: tokenData.usd,
          change24h: tokenData.usd_24h_change || 0,
          volume24h: tokenData.usd_24h_vol || 0,
          lastUpdated: Date.now(),
          source: 'FreePriceService-CoinGecko'
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching market price for ${symbol}:`, error);
      return this.priceCache.get(`MARKET-${symbol}`) || null;
    }
  }

  // Subscribe to live price updates
  static subscribe(symbol: string, chainId: number | undefined, callback: (data: FreePriceData) => void): () => void {
    const key = `${chainId || 'all'}-${symbol}`;
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }
    
    this.subscriptions.get(key)!.push({ symbol, chainId, callback });
    
    // Start streaming if not already started
    if (!this.isStreaming) {
      this.startStreaming();
    }
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(key);
      if (subs) {
        const index = subs.findIndex(sub => sub.callback === callback);
        if (index > -1) {
          subs.splice(index, 1);
        }
        if (subs.length === 0) {
          this.subscriptions.delete(key);
        }
      }
      
      // Stop streaming if no subscriptions
      if (this.subscriptions.size === 0) {
        this.stopStreaming();
      }
    };
  }

  private static startStreaming(): void {
    if (this.isStreaming) return;
    
    this.isStreaming = true;
    console.log('🚀 FreePriceService: Starting live price streaming');
    
    this.updateInterval = setInterval(async () => {
      for (const [key, subscriptions] of this.subscriptions.entries()) {
        for (const sub of subscriptions) {
          try {
            let priceData: FreePriceData | null = null;
            
            if (sub.chainId === undefined) {
              // Market price
              priceData = await this.getMarketPrice(sub.symbol);
            } else if (sub.chainId === 1 || sub.chainId === 8453 || sub.chainId === 250) {
              // EVM chains
              priceData = await this.getEVMPrice(sub.chainId, sub.symbol);
            } else {
              // Solana
              priceData = await this.getSolanaPrice(sub.symbol);
            }
            
            if (priceData) {
              sub.callback(priceData);
            }
          } catch (error) {
            console.error(`Error updating price for ${sub.symbol}:`, error);
          }
        }
      }
    }, 3000); // Update every 3 seconds for live feel
  }

  private static stopStreaming(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isStreaming = false;
    console.log('⏹️ FreePriceService: Stopped price streaming');
  }

  static getHealthStatus(): { 
    isActive: boolean; 
    subscriptions: number; 
    cacheSize: number; 
    lastUpdate: number | null;
    sources: string[];
  } {
    const lastUpdate = Math.max(
      ...Array.from(this.priceCache.values()).map(p => p.lastUpdated),
      0
    );
    
    return {
      isActive: this.isStreaming,
      subscriptions: this.subscriptions.size,
      cacheSize: this.priceCache.size,
      lastUpdate: lastUpdate || null,
      sources: ['Binance', 'Coinbase', 'CoinGecko-Free', 'DexScreener']
    };
  }

  static clearCache(): void {
    this.priceCache.clear();
    console.log('FreePriceService: Cache cleared');
  }

  static getAllCachedPrices(): FreePriceData[] {
    return Array.from(this.priceCache.values());
  }
}
