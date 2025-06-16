
interface LivePriceConfig {
  jupiterApiKey?: string;
  oneInchApiKey?: string;
  coinGeckoApiKey?: string;
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
    console.log('LivePriceService: Configuration updated', Object.keys(config));
  }

  // Enhanced Jupiter price fetching for Solana
  static async getJupiterPrice(tokenSymbol: string): Promise<LiveTokenPrice | null> {
    try {
      // Token mint addresses for popular tokens on Solana
      const tokenMints: Record<string, string> = {
        'SOL': 'So11111111111111111111111111111111111111112',
        'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        'SRM': 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'
      };

      const mintAddress = tokenMints[tokenSymbol];
      if (!mintAddress) return null;

      const response = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`);
      const data = await response.json();
      
      if (data.data && data.data[mintAddress]) {
        const priceData = data.data[mintAddress];
        return {
          symbol: tokenSymbol,
          price: priceData.price,
          change24h: priceData.priceChange24h || 0,
          volume24h: priceData.volume24h || 0,
          lastUpdated: Date.now(),
          source: 'Jupiter'
        };
      }
      return null;
    } catch (error) {
      console.error('Jupiter API error:', error);
      return null;
    }
  }

  // Enhanced 1inch API for Base and Fantom
  static async get1inchPrice(chainId: number, tokenSymbol: string): Promise<LiveTokenPrice | null> {
    try {
      // Token addresses for Base (chainId 8453) and Fantom (chainId 250)
      const tokenAddresses: Record<number, Record<string, string>> = {
        8453: { // Base
          'ETH': '0x0000000000000000000000000000000000000000',
          'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          'USDT': '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
        },
        250: { // Fantom
          'FTM': '0x0000000000000000000000000000000000000000',
          'USDC': '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
          'USDT': '0x049d68029688eAbF473097a2fC38ef61633A3C7A'
        }
      };

      const tokenAddress = tokenAddresses[chainId]?.[tokenSymbol];
      if (!tokenAddress) return null;

      const url = `https://api.1inch.dev/price/v1.1/${chainId}/${tokenAddress}`;
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      if (this.config.oneInchApiKey) {
        headers['Authorization'] = `Bearer ${this.config.oneInchApiKey}`;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (data[tokenAddress]) {
        return {
          symbol: tokenSymbol,
          price: parseFloat(data[tokenAddress]),
          change24h: 0, // 1inch doesn't provide 24h change in price endpoint
          volume24h: 0,
          lastUpdated: Date.now(),
          source: '1inch'
        };
      }
      return null;
    } catch (error) {
      console.error('1inch API error:', error);
      return null;
    }
  }

  // Enhanced CoinGecko for backup and additional data
  static async getCoinGeckoPrice(coinId: string): Promise<LiveTokenPrice | null> {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
      const headers: Record<string, string> = {};
      
      if (this.config.coinGeckoApiKey) {
        headers['x-cg-demo-api-key'] = this.config.coinGeckoApiKey;
      }

      const response = await fetch(url, { headers });
      
      if (response.status === 429) {
        console.warn('CoinGecko rate limit hit, using cached data');
        return null;
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
          source: 'CoinGecko'
        };
      }
      return null;
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return null;
    }
  }

  // Main aggregated price function optimized for Base + Fantom + Solana
  static async getAggregatedPrice(symbol: string, chainId?: number): Promise<LiveTokenPrice | null> {
    const cacheKey = `${symbol}-${chainId || 'all'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < 10000) { // 10 second cache
      return cached;
    }

    const promises: Promise<LiveTokenPrice | null>[] = [];

    // Enhanced token mappings for our focused chains
    const tokenMappings: Record<string, any> = {
      'SOL': {
        jupiter: true,
        coinGecko: 'solana'
      },
      'ETH': {
        oneInch: [8453], // Base
        coinGecko: 'ethereum'
      },
      'FTM': {
        oneInch: [250], // Fantom
        coinGecko: 'fantom'
      },
      'USDC': {
        jupiter: true,
        oneInch: [8453, 250], // Base and Fantom
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
      console.warn(`No mapping found for ${symbol}`);
      return null;
    }

    // Try Jupiter for Solana tokens
    if (mapping.jupiter) {
      promises.push(this.getJupiterPrice(symbol));
    }

    // Try 1inch for specific chains
    if (mapping.oneInch && chainId && mapping.oneInch.includes(chainId)) {
      promises.push(this.get1inchPrice(chainId, symbol));
    }

    // Try CoinGecko as reliable backup
    if (mapping.coinGecko) {
      promises.push(this.getCoinGeckoPrice(mapping.coinGecko));
    }

    try {
      const results = await Promise.allSettled(promises);
      const successful = results
        .filter((result): result is PromiseFulfilledResult<LiveTokenPrice> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      if (successful.length === 0) {
        console.warn(`No successful price data for ${symbol}`);
        return cached || null;
      }

      // Use the most recent and reliable result
      const best = successful.reduce((prev, current) => {
        // Prefer Jupiter for SOL, 1inch for ETH/FTM, CoinGecko as backup
        if (symbol === 'SOL' && current.source === 'Jupiter') return current;
        if ((symbol === 'ETH' || symbol === 'FTM') && current.source === '1inch') return current;
        return current.lastUpdated > prev.lastUpdated ? current : prev;
      });

      this.cache.set(cacheKey, best);
      console.log(`Price updated for ${symbol}: $${best.price} from ${best.source}`);
      return best;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return cached || null;
    }
  }

  // WebSocket connections for real-time data
  static connectToJupiterWebSocket(callback: (data: any) => void): WebSocket | null {
    try {
      const ws = new WebSocket('wss://price.jup.ag/v4/stream');
      
      ws.onopen = () => {
        console.log('Connected to Jupiter WebSocket');
        // Subscribe to SOL and USDC prices
        ws.send(JSON.stringify({
          method: 'subscribe',
          params: {
            tokens: [
              'So11111111111111111111111111111111111111112', // SOL
              'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'  // USDC
            ]
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Error parsing Jupiter WebSocket data:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Jupiter WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Jupiter WebSocket disconnected, attempting reconnect...');
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connectToJupiterWebSocket(callback), 5000);
      };

      this.wsConnections.set('jupiter', ws);
      return ws;
    } catch (error) {
      console.error('Failed to connect to Jupiter WebSocket:', error);
      return null;
    }
  }

  static disconnectAll() {
    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.wsConnections.clear();
    console.log('All WebSocket connections closed');
  }

  // Health check for API services
  static async healthCheck(): Promise<{ jupiter: boolean; oneInch: boolean; coinGecko: boolean }> {
    const health = {
      jupiter: false,
      oneInch: false,
      coinGecko: false
    };

    try {
      // Test Jupiter
      const jupiterResult = await this.getJupiterPrice('SOL');
      health.jupiter = jupiterResult !== null;
    } catch (e) {
      console.error('Jupiter health check failed:', e);
    }

    try {
      // Test 1inch (Base)
      const oneInchResult = await this.get1inchPrice(8453, 'ETH');
      health.oneInch = oneInchResult !== null;
    } catch (e) {
      console.error('1inch health check failed:', e);
    }

    try {
      // Test CoinGecko
      const coinGeckoResult = await this.getCoinGeckoPrice('solana');
      health.coinGecko = coinGeckoResult !== null;
    } catch (e) {
      console.error('CoinGecko health check failed:', e);
    }

    console.log('API Health Check:', health);
    return health;
  }
}
