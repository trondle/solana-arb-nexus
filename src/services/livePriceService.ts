
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
  }

  static async getJupiterPrice(tokenMint: string): Promise<LiveTokenPrice | null> {
    try {
      const response = await fetch(`https://price.jup.ag/v4/price?ids=${tokenMint}`);
      const data = await response.json();
      
      if (data.data && data.data[tokenMint]) {
        const priceData = data.data[tokenMint];
        return {
          symbol: tokenMint,
          price: priceData.price,
          change24h: 0, // Jupiter doesn't provide 24h change
          volume24h: 0, // Jupiter doesn't provide volume
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

  static async get1inchPrice(chainId: number, tokenAddress: string): Promise<LiveTokenPrice | null> {
    try {
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
          symbol: tokenAddress,
          price: parseFloat(data[tokenAddress]),
          change24h: 0,
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

  static async getCoinGeckoPrice(coinId: string): Promise<LiveTokenPrice | null> {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
      const headers: Record<string, string> = {};
      
      if (this.config.coinGeckoApiKey) {
        headers['x-cg-demo-api-key'] = this.config.coinGeckoApiKey;
      }

      const response = await fetch(url, { headers });
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

  static connectToJupiterWebSocket(tokenMints: string[], callback: (data: any) => void): WebSocket | null {
    try {
      const ws = new WebSocket('wss://price.jup.ag/v4/stream');
      
      ws.onopen = () => {
        console.log('Connected to Jupiter WebSocket');
        ws.send(JSON.stringify({
          method: 'subscribe',
          params: {
            tokens: tokenMints
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
        console.log('Jupiter WebSocket disconnected');
      };

      this.wsConnections.set('jupiter', ws);
      return ws;
    } catch (error) {
      console.error('Failed to connect to Jupiter WebSocket:', error);
      return null;
    }
  }

  static async getAggregatedPrice(symbol: string, chainId?: number): Promise<LiveTokenPrice | null> {
    const cacheKey = `${symbol}-${chainId || 'all'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < 10000) { // 10 second cache
      return cached;
    }

    const promises: Promise<LiveTokenPrice | null>[] = [];

    // Token address mappings for different chains
    const tokenMappings: Record<string, any> = {
      'SOL': {
        jupiter: 'So11111111111111111111111111111111111111112',
        coinGecko: 'solana'
      },
      'ETH': {
        ethereum: '0x0000000000000000000000000000000000000000',
        coinGecko: 'ethereum'
      },
      'USDC': {
        ethereum: '0xA0b86a33E6441E2bd3aE7dE81eE88e9b24E83f58',
        coinGecko: 'usd-coin'
      }
    };

    const mapping = tokenMappings[symbol];
    if (!mapping) return null;

    // Try Jupiter for Solana tokens
    if (mapping.jupiter) {
      promises.push(this.getJupiterPrice(mapping.jupiter));
    }

    // Try 1inch for EVM tokens
    if (mapping.ethereum && chainId) {
      promises.push(this.get1inchPrice(chainId, mapping.ethereum));
    }

    // Try CoinGecko as fallback
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

      if (successful.length === 0) return null;

      // Use the most recent successful result
      const best = successful.reduce((prev, current) => 
        current.lastUpdated > prev.lastUpdated ? current : prev
      );

      this.cache.set(cacheKey, best);
      return best;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return cached || null;
    }
  }

  static disconnectAll() {
    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.wsConnections.clear();
  }
}
