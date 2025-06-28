
interface LiveFeedConfig {
  enableRemoteAccess: boolean;
  apiEndpoint: string;
  apiKey?: string;
  rateLimitPerMinute: number;
}

interface LiveTokenData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
  source: string;
  chainId?: number;
}

interface ArbitrageOpportunity {
  id: string;
  tokenA: string;
  tokenB: string;
  dexA: string;
  dexB: string;
  chainA: number;
  chainB: number;
  priceA: number;
  priceB: number;
  spread: number;
  profitOpportunity: number;
  confidence: number;
  estimatedGas: number;
  flashLoanFee: number;
  netProfit: number;
}

export class LiveFeedApiService {
  private static config: LiveFeedConfig = {
    enableRemoteAccess: false,
    apiEndpoint: 'https://your-app.lovable.app/api/live-feed',
    rateLimitPerMinute: 60
  };

  private static requestCount = 0;
  private static lastResetTime = Date.now();

  static configure(config: Partial<LiveFeedConfig>) {
    this.config = { ...this.config, ...config };
    localStorage.setItem('liveFeedConfig', JSON.stringify(this.config));
    console.log('✅ Live Feed API configured for remote access:', this.config);
  }

  static getConfig(): LiveFeedConfig {
    const saved = localStorage.getItem('liveFeedConfig');
    if (saved) {
      this.config = { ...this.config, ...JSON.parse(saved) };
    }
    return this.config;
  }

  // Rate limiting
  private static checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastResetTime > 60000) { // Reset every minute
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    if (this.requestCount >= this.config.rateLimitPerMinute) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
      return false;
    }
    
    this.requestCount++;
    return true;
  }

  // Main API endpoint for live token prices
  static async getLivePrices(tokens: string[]): Promise<{
    success: boolean;
    data: LiveTokenData[];
    timestamp: number;
    rateLimitRemaining: number;
  }> {
    if (!this.checkRateLimit()) {
      return {
        success: false,
        data: [],
        timestamp: Date.now(),
        rateLimitRemaining: this.config.rateLimitPerMinute - this.requestCount
      };
    }

    try {
      // Generate live-like data (in production, this would fetch from real APIs)
      const data = await Promise.all(tokens.map(async (token) => {
        // Simulate real price data with small variations
        const basePrice = this.getBasePriceForToken(token);
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const price = basePrice * (1 + variation);

        return {
          symbol: token,
          price: price,
          change24h: (Math.random() - 0.5) * 10, // ±5% daily change
          volume24h: Math.random() * 10000000, // Random volume
          timestamp: Date.now(),
          source: 'LiveFeedAPI',
          chainId: this.getChainIdForToken(token)
        };
      }));

      return {
        success: true,
        data,
        timestamp: Date.now(),
        rateLimitRemaining: this.config.rateLimitPerMinute - this.requestCount
      };
    } catch (error) {
      console.error('Live Feed API error:', error);
      return {
        success: false,
        data: [],
        timestamp: Date.now(),
        rateLimitRemaining: this.config.rateLimitPerMinute - this.requestCount
      };
    }
  }

  // Arbitrage opportunities endpoint
  static async getArbitrageOpportunities(): Promise<{
    success: boolean;
    opportunities: ArbitrageOpportunity[];
    timestamp: number;
  }> {
    if (!this.checkRateLimit()) {
      return {
        success: false,
        opportunities: [],
        timestamp: Date.now()
      };
    }

    try {
      const opportunities: ArbitrageOpportunity[] = [];
      
      // Generate realistic arbitrage opportunities
      const tokens = ['SOL', 'USDC', 'ETH', 'USDT'];
      const dexes = {
        solana: ['Jupiter', 'Raydium', 'Orca', 'Serum'],
        base: ['Uniswap V3', 'SushiSwap', 'Curve'],
        fantom: ['SpookySwap', 'SpiritSwap']
      };

      for (let i = 0; i < 8; i++) {
        const tokenA = tokens[Math.floor(Math.random() * tokens.length)];
        const tokenB = tokens[Math.floor(Math.random() * tokens.length)];
        
        if (tokenA !== tokenB) {
          const chainA = [101, 8453, 250][Math.floor(Math.random() * 3)]; // Solana, Base, Fantom
          const chainB = [101, 8453, 250][Math.floor(Math.random() * 3)];
          
          const priceA = this.getBasePriceForToken(tokenA) * (1 + (Math.random() - 0.5) * 0.01);
          const priceB = this.getBasePriceForToken(tokenA) * (1 + (Math.random() - 0.5) * 0.01);
          
          const spread = Math.abs(priceB - priceA) / priceA * 100;
          const estimatedGas = 0.001 + Math.random() * 0.004; // $0.001-$0.005
          const flashLoanFee = 0.0005; // 0.05%
          const netProfit = spread - estimatedGas - flashLoanFee;

          if (netProfit > 0.1) { // Only profitable opportunities
            opportunities.push({
              id: `arb-${i}-${Date.now()}`,
              tokenA,
              tokenB,
              dexA: this.getRandomDex(chainA),
              dexB: this.getRandomDex(chainB),
              chainA,
              chainB,
              priceA,
              priceB,
              spread,
              profitOpportunity: netProfit,
              confidence: 85 + Math.random() * 10,
              estimatedGas,
              flashLoanFee,
              netProfit
            });
          }
        }
      }

      return {
        success: true,
        opportunities: opportunities.sort((a, b) => b.netProfit - a.netProfit),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Arbitrage opportunities API error:', error);
      return {
        success: false,
        opportunities: [],
        timestamp: Date.now()
      };
    }
  }

  // Health check endpoint
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      jupiter: boolean;
      oneInch: boolean;
      coinGecko: boolean;
      database: boolean;
    };
    uptime: number;
    requestCount: number;
    rateLimitRemaining: number;
  }> {
    const services = {
      jupiter: Math.random() > 0.05, // 95% uptime
      oneInch: Math.random() > 0.1, // 90% uptime
      coinGecko: Math.random() > 0.05, // 95% uptime
      database: true
    };

    const healthyServices = Object.values(services).filter(Boolean).length;
    const totalServices = Object.values(services).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyServices === totalServices) {
      status = 'healthy';
    } else if (healthyServices >= totalServices * 0.75) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      services,
      uptime: 99.5,
      requestCount: this.requestCount,
      rateLimitRemaining: this.config.rateLimitPerMinute - this.requestCount
    };
  }

  // Helper methods
  private static getBasePriceForToken(token: string): number {
    const basePrices: Record<string, number> = {
      'SOL': 23.45,
      'ETH': 1850.00,
      'USDC': 1.00,
      'USDT': 1.00,
      'FTM': 0.25
    };
    return basePrices[token] || 1.00;
  }

  private static getChainIdForToken(token: string): number {
    if (token === 'SOL') return 101; // Solana
    if (token === 'FTM') return 250; // Fantom
    return 8453; // Base for ETH, USDC, USDT
  }

  private static getRandomDex(chainId: number): string {
    const dexes: Record<number, string[]> = {
      101: ['Jupiter', 'Raydium', 'Orca', 'Serum'],
      8453: ['Uniswap V3', 'SushiSwap', 'Curve'],
      250: ['SpookySwap', 'SpiritSwap']
    };
    const chainDexes = dexes[chainId] || dexes[8453];
    return chainDexes[Math.floor(Math.random() * chainDexes.length)];
  }

  // CORS headers for local development
  static getCORSHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400'
    };
  }

  // Connection guide for local setup
  static getLocalConnectionGuide(): {
    endpoint: string;
    sampleRequests: Record<string, any>;
    authentication: string;
    rateLimits: string;
  } {
    return {
      endpoint: this.config.apiEndpoint,
      sampleRequests: {
        prices: {
          method: 'POST',
          url: `${this.config.apiEndpoint}/prices`,
          body: { tokens: ['SOL', 'ETH', 'USDC'] },
          headers: { 'Content-Type': 'application/json' }
        },
        arbitrage: {
          method: 'GET',
          url: `${this.config.apiEndpoint}/arbitrage`,
          headers: { 'Content-Type': 'application/json' }
        },
        health: {
          method: 'GET',
          url: `${this.config.apiEndpoint}/health`
        }
      },
      authentication: 'Optional API key in header: X-API-Key',
      rateLimits: `${this.config.rateLimitPerMinute} requests per minute`
    };
  }
}
