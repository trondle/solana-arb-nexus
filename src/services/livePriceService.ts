
import { LocalServiceAdapter } from './localServiceAdapter';

interface LivePriceConfig {
  jupiterApiKey?: string;
  oneInchApiKey?: string;
  coinGeckoApiKey?: string;
  localServiceConfig?: {
    enabled: boolean;
    baseUrl: string;
    port: string;
  };
  enableLocalService?: boolean;
}

interface LiveTokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: number;
  source: string;
}

export class LivePriceService {
  private static config: LivePriceConfig = {};
  private static cache = new Map<string, LiveTokenPrice>();
  private static wsConnections = new Map<string, WebSocket>();

  static setConfig(config: LivePriceConfig) {
    this.config = config;
    
    if (config.localServiceConfig && config.enableLocalService) {
      LocalServiceAdapter.setConfig(config.localServiceConfig);
    }
    
    console.log('🔴 LIVE: LivePriceService configured for real trading');
  }

  static async getJupiterPrice(tokenSymbol: string): Promise<LiveTokenPrice | null> {
    try {
      const tokenMints: Record<string, string> = {
        'SOL': 'So11111111111111111111111111111111111111112',
        'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        'SRM': 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'
      };

      const mintAddress = tokenMints[tokenSymbol];
      if (!mintAddress) {
        throw new Error(`No mint address for ${tokenSymbol}`);
      }

      const response = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`);
      
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data[mintAddress]) {
        const priceData = data.data[mintAddress];
        return {
          symbol: tokenSymbol,
          price: priceData.price,
          change24h: priceData.priceChange24h || 0,
          volume24h: priceData.volume24h || 0,
          lastUpdated: Date.now(),
          source: 'Jupiter-LIVE'
        };
      }
      
      throw new Error(`No price data from Jupiter for ${tokenSymbol}`);
    } catch (error) {
      console.error(`🚫 Jupiter LIVE fetch failed for ${tokenSymbol}:`, error);
      throw error;
    }
  }

  static async get1inchPrice(chainId: number, tokenSymbol: string): Promise<LiveTokenPrice | null> {
    try {
      const tokenAddresses: Record<number, Record<string, string>> = {
        8453: {
          'ETH': '0x0000000000000000000000000000000000000000',
          'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          'USDT': '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
        },
        250: {
          'FTM': '0x0000000000000000000000000000000000000000',
          'USDC': '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
          'USDT': '0x049d68029688eAbF473097a2fC38ef61633A3C7A'
        }
      };

      const tokenAddress = tokenAddresses[chainId]?.[tokenSymbol];
      if (!tokenAddress) {
        throw new Error(`No token address for ${tokenSymbol} on chain ${chainId}`);
      }

      const url = `https://api.1inch.dev/price/v1.1/${chainId}/${tokenAddress}`;
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      if (this.config.oneInchApiKey) {
        headers['Authorization'] = `Bearer ${this.config.oneInchApiKey}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`1inch API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data[tokenAddress]) {
        return {
          symbol: tokenSymbol,
          price: parseFloat(data[tokenAddress]),
          change24h: 0,
          volume24h: 0,
          lastUpdated: Date.now(),
          source: '1inch-LIVE'
        };
      }
      
      throw new Error(`No price data from 1inch for ${tokenSymbol}`);
    } catch (error) {
      console.error(`🚫 1inch LIVE fetch failed for ${tokenSymbol}:`, error);
      throw error;
    }
  }

  static async getCoinGeckoPrice(coinId: string): Promise<LiveTokenPrice | null> {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
      const headers: Record<string, string> = {};
      
      if (this.config.coinGeckoApiKey) {
        headers['x-cg-demo-api-key'] = this.config.coinGeckoApiKey;
      }

      const response = await fetch(url, { headers });
      
      if (response.status === 429) {
        throw new Error('CoinGecko rate limit exceeded');
      }
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data[coinId]) {
        const priceData = data[coinId];
        return {
          symbol: coinId,
          price: priceData.usd,
          change24h: priceData.usd_24h_change || 0,
          volume24h: priceData.usd_24h_vol || 0,
          lastUpdated: Date.now(),
          source: 'CoinGecko-LIVE'
        };
      }
      
      throw new Error(`No price data from CoinGecko for ${coinId}`);
    } catch (error) {
      console.error(`🚫 CoinGecko LIVE fetch failed for ${coinId}:`, error);
      throw error;
    }
  }

  static async getAggregatedPrice(symbol: string, chainId?: number): Promise<LiveTokenPrice | null> {
    const cacheKey = `${symbol}-${chainId || 'all'}`;
    const cached = this.cache.get(cacheKey);
    
    // Shorter cache for live trading
    if (cached && Date.now() - cached.lastUpdated < 3000) {
      return cached;
    }

    // Try local service first if enabled
    if (LocalServiceAdapter.isEnabled()) {
      try {
        const localResult = await this.getLocalServicePrice(symbol, chainId);
        if (localResult) {
          this.cache.set(cacheKey, localResult);
          console.log(`🔴 LIVE LOCAL: ${symbol} = $${localResult.price}`);
          return localResult;
        }
      } catch (error) {
        console.warn('🟡 Local service failed, trying external APIs:', error);
      }
    }

    // External API fallback - NO MOCK DATA
    const promises: Promise<LiveTokenPrice | null>[] = [];

    const tokenMappings: Record<string, any> = {
      'SOL': {
        jupiter: true,
        coinGecko: 'solana'
      },
      'ETH': {
        oneInch: [8453],
        coinGecko: 'ethereum'
      },
      'FTM': {
        oneInch: [250],
        coinGecko: 'fantom'
      },
      'USDC': {
        jupiter: true,
        oneInch: [8453, 250],
        coinGecko: 'usd-coin'
      },
      'USDT': {
        jupiter: true,
        oneInch: [8453, 250],
        coinGecko: 'tether'
      }
    };

    const mapping = tokenMappings[symbol];
    if (!mapping) {
      throw new Error(`🚫 LIVE: No API mapping for ${symbol} - cannot trade without live data`);
    }

    // Add API calls based on mapping
    if (mapping.jupiter) {
      promises.push(this.getJupiterPrice(symbol));
    }
    
    if (mapping.oneInch && Array.isArray(mapping.oneInch)) {
      for (const chain of mapping.oneInch) {
        if (!chainId || chainId === chain) {
          promises.push(this.get1inchPrice(chain, symbol));
        }
      }
    }
    
    if (mapping.coinGecko) {
      promises.push(this.getCoinGeckoPrice(mapping.coinGecko));
    }

    if (promises.length === 0) {
      throw new Error(`🚫 LIVE: No API sources available for ${symbol}`);
    }

    try {
      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<LiveTokenPrice> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      if (successfulResults.length === 0) {
        throw new Error(`🚫 LIVE: All API sources failed for ${symbol}`);
      }

      // Use the first successful result
      const price = successfulResults[0];
      this.cache.set(cacheKey, price);
      console.log(`🔴 LIVE: ${symbol} = $${price.price} from ${price.source}`);
      return price;

    } catch (error) {
      console.error(`🚫 LIVE TRADING ERROR: Failed to get aggregated price for ${symbol}:`, error);
      throw error;
    }
  }

  private static async getLocalServicePrice(symbol: string, chainId?: number): Promise<LiveTokenPrice | null> {
    return await LocalServiceAdapter.getPrice(symbol, chainId);
  }

  static connectToJupiterWebSocket(callback: (data: any) => void): WebSocket | null {
    try {
      const ws = new WebSocket('wss://api.mainnet-beta.solana.com/');
      
      ws.onopen = () => {
        console.log('🔴 LIVE: Jupiter WebSocket connected');
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'accountSubscribe',
          params: ['So11111111111111111111111111111111111111112']
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('🚫 LIVE WebSocket error:', error);
      };

      this.wsConnections.set('jupiter', ws);
      return ws;
    } catch (error) {
      console.error('🚫 LIVE: Failed to connect Jupiter WebSocket:', error);
      throw error;
    }
  }

  static disconnectAll(): void {
    this.wsConnections.forEach((ws, key) => {
      ws.close();
      console.log(`🔴 LIVE: Disconnected ${key} WebSocket`);
    });
    this.wsConnections.clear();
  }
}
