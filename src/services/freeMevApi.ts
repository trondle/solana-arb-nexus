
import { FreePriceService } from './freePriceService';
import { InternalApiService } from './internalApiService';

interface MevPriceRequest {
  symbols: string[];
  chains?: number[];
  includeArbitrage?: boolean;
}

interface MevPriceResponse {
  success: boolean;
  data: {
    prices: any[];
    arbitrageOpportunities?: any[];
    timestamp: number;
    source: string;
  };
  metadata: {
    requestId: string;
    responseTime: number;
    dataFreshness: number;
  };
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

export class FreeMevApi {
  private static baseUrl = 'https://your-mev-api.com/api/v1'; // This would be your deployed endpoint
  private static isInitialized = false;

  static initialize(): void {
    if (this.isInitialized) return;
    
    InternalApiService.initialize();
    console.log('🚀 FreeMevApi initialized');
    this.isInitialized = true;
  }

  // Main API endpoint for getting live prices
  static async getPrices(request: MevPriceRequest, apiKey?: string): Promise<MevPriceResponse> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    try {
      // Validate API key if provided
      if (apiKey && !InternalApiService.validateApiKey(apiKey, 'price_read')) {
        throw new Error('Invalid or expired API key');
      }

      const prices = [];
      const arbitrageOpportunities: ArbitrageOpportunity[] = [];

      // Fetch prices for each symbol
      for (const symbol of request.symbols) {
        const tokenPrices: any = { token: symbol };
        
        // Get Solana price
        if (!request.chains || request.chains.includes(0)) {
          const solPrice = await FreePriceService.getSolanaPrice(symbol);
          if (solPrice) {
            tokenPrices.solana = {
              price: solPrice.price,
              change24h: solPrice.change24h,
              volume24h: solPrice.volume24h,
              source: solPrice.source,
              chain: 'solana'
            };
          }
        }

        // Get Base price (Chain ID 8453)
        if (!request.chains || request.chains.includes(8453)) {
          const basePrice = await FreePriceService.getEVMPrice(8453, symbol);
          if (basePrice) {
            tokenPrices.base = {
              price: basePrice.price,
              change24h: basePrice.change24h,
              volume24h: basePrice.volume24h,
              source: basePrice.source,
              chain: 'base',
              chainId: 8453
            };
          }
        }

        // Get Fantom price (Chain ID 250)
        if (!request.chains || request.chains.includes(250)) {
          const fantomPrice = await FreePriceService.getEVMPrice(250, symbol);
          if (fantomPrice) {
            tokenPrices.fantom = {
              price: fantomPrice.price,
              change24h: fantomPrice.change24h,
              volume24h: fantomPrice.volume24h,
              source: fantomPrice.source,
              chain: 'fantom',
              chainId: 250
            };
          }
        }

        prices.push(tokenPrices);

        // Calculate arbitrage opportunities if requested
        if (request.includeArbitrage) {
          const opportunities = this.calculateArbitrageOpportunities(tokenPrices);
          arbitrageOpportunities.push(...opportunities);
        }
      }

      const responseTime = Date.now() - startTime;
      
      // Record successful API call
      if (apiKey) {
        InternalApiService.recordSuccess(apiKey, responseTime);
      }

      const response: MevPriceResponse = {
        success: true,
        data: {
          prices,
          arbitrageOpportunities: request.includeArbitrage ? arbitrageOpportunities : undefined,
          timestamp: Date.now(),
          source: 'FreeMevApi'
        },
        metadata: {
          requestId,
          responseTime,
          dataFreshness: 3000 // Data is updated every 3 seconds
        }
      };

      console.log(`✅ API Request ${requestId} completed in ${responseTime}ms`);
      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record failed API call
      if (apiKey) {
        InternalApiService.recordFailure(apiKey);
      }

      console.error(`❌ API Request ${requestId} failed:`, error);
      
      return {
        success: false,
        data: {
          prices: [],
          timestamp: Date.now(),
          source: 'FreeMevApi'
        },
        metadata: {
          requestId,
          responseTime,
          dataFreshness: 0
        }
      };
    }
  }

  private static calculateArbitrageOpportunities(tokenPrices: any): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    const chains = ['solana', 'base', 'fantom'];
    
    // Compare prices between all chain pairs
    for (let i = 0; i < chains.length; i++) {
      for (let j = i + 1; j < chains.length; j++) {
        const chain1 = chains[i];
        const chain2 = chains[j];
        
        const price1 = tokenPrices[chain1]?.price;
        const price2 = tokenPrices[chain2]?.price;
        
        if (price1 && price2 && price1 !== price2) {
          const profitPercent = Math.abs((price2 - price1) / price1) * 100;
          
          // Only include opportunities > 0.1%
          if (profitPercent > 0.1) {
            const buyChain = price1 < price2 ? chain1 : chain2;
            const sellChain = price1 < price2 ? chain2 : chain1;
            const buyPrice = Math.min(price1, price2);
            const sellPrice = Math.max(price1, price2);
            
            opportunities.push({
              token: tokenPrices.token,
              buyChain: buyChain === 'solana' ? 'solana' : tokenPrices[buyChain]?.chainId || buyChain,
              sellChain: sellChain === 'solana' ? 'solana' : tokenPrices[sellChain]?.chainId || sellChain,
              buyPrice,
              sellPrice,
              profitPercent,
              estimatedProfit: profitPercent * 10, // Assuming $1000 trade
              confidence: 0.85, // Fixed confidence for demo
              riskLevel: profitPercent > 2 ? 'HIGH' : profitPercent > 1 ? 'MEDIUM' : 'LOW'
            });
          }
        }
      }
    }
    
    return opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
  }

  // Convenience method for MEV arbitrage system
  static async getMevOpportunities(symbols: string[] = ['SOL', 'ETH', 'USDC', 'USDT'], apiKey?: string) {
    return this.getPrices({
      symbols,
      includeArbitrage: true
    }, apiKey);
  }

  // Stream prices for real-time updates
  static subscribeToMevPrices(
    symbols: string[], 
    callback: (data: MevPriceResponse) => void,
    apiKey?: string
  ): () => void {
    const interval = setInterval(async () => {
      try {
        const data = await this.getMevOpportunities(symbols, apiKey);
        callback(data);
      } catch (error) {
        console.error('Error in price subscription:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }

  // Health check endpoint
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: any;
    uptime: number;
    version: string;
  }> {
    const priceServiceHealth = FreePriceService.getHealthStatus();
    const apiSystemHealth = InternalApiService.getSystemOverview();
    
    return {
      status: priceServiceHealth.isActive ? 'healthy' : 'degraded',
      services: {
        priceService: priceServiceHealth,
        apiManagement: apiSystemHealth
      },
      uptime: Date.now(), // Simplified uptime
      version: '1.0.0'
    };
  }
}
