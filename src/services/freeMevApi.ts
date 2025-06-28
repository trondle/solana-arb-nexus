
export class FreeMevApi {
  private static initialized = false;
  private static baseUrl = '';

  static initialize() {
    this.initialized = true;
    this.baseUrl = 'https://api.binance.com/api/v3'; // Real Binance API
    console.log('🔴 LIVE: FreeMevApi initialized with real endpoints');
  }

  static async getMevOpportunities(tokens: string[], apiKey: string) {
    if (!this.initialized) {
      throw new Error('FreeMevApi not initialized');
    }

    try {
      console.log('🔴 LIVE: Fetching real MEV opportunities for:', tokens);

      const prices = await Promise.all(
        tokens.map(async (token) => {
          try {
            const binanceData = await this.getBinancePrice(token);
            const coinbaseData = await this.getCoinbasePrice(token);
            
            return {
              token,
              solana: binanceData ? {
                price: binanceData.price,
                change24h: binanceData.change24h,
                volume24h: binanceData.volume24h,
                source: 'Binance-LIVE'
              } : null,
              base: coinbaseData ? {
                price: coinbaseData.price,
                change24h: coinbaseData.change24h,
                volume24h: coinbaseData.volume24h,
                source: 'Coinbase-LIVE'
              } : null,
              fantom: null // Would need Fantom-specific API
            };
          } catch (error) {
            console.error(`🚫 LIVE: Failed to fetch ${token}:`, error);
            throw error;
          }
        })
      );

      // Calculate real arbitrage opportunities from live data
      const arbitrageOpportunities = this.calculateRealArbitrage(prices.filter(p => p.solana && p.base));

      return {
        success: true,
        data: {
          prices,
          arbitrageOpportunities,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error('🚫 LIVE: FreeMevApi error:', error);
      throw error;
    }
  }

  private static async getBinancePrice(symbol: string) {
    try {
      const binanceSymbol = symbol === 'SOL' ? 'SOLUSDT' : 
                           symbol === 'ETH' ? 'ETHUSDT' :
                           symbol === 'USDC' ? 'USDCUSDT' : null;
      
      if (!binanceSymbol) return null;

      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${binanceSymbol}`);
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.volume)
      };
    } catch (error) {
      console.error(`Binance API error for ${symbol}:`, error);
      throw error;
    }
  }

  private static async getCoinbasePrice(symbol: string) {
    try {
      const coinbaseSymbol = symbol === 'SOL' ? 'SOL-USD' : 
                            symbol === 'ETH' ? 'ETH-USD' :
                            symbol === 'USDC' ? 'USDC-USD' : null;
      
      if (!coinbaseSymbol) return null;

      const response = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.rates && data.data.rates.USD) {
        return {
          price: parseFloat(data.data.rates.USD),
          change24h: 0, // Coinbase exchange rates don't include 24h change
          volume24h: 0
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Coinbase API error for ${symbol}:`, error);
      throw error;
    }
  }

  private static calculateRealArbitrage(priceData: any[]) {
    const opportunities = [];
    
    for (const data of priceData) {
      if (data.solana && data.base) {
        const solanaPrice = data.solana.price;
        const basePrice = data.base.price;
        
        if (Math.abs(solanaPrice - basePrice) > 0.01) { // Minimum $0.01 spread
          const buyPrice = Math.min(solanaPrice, basePrice);
          const sellPrice = Math.max(solanaPrice, basePrice);
          const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
          
          if (profitPercent > 0.1) { // Minimum 0.1% profit
            opportunities.push({
              token: data.token,
              buyChain: solanaPrice < basePrice ? 'solana' : 'base',
              sellChain: solanaPrice > basePrice ? 'solana' : 'base',
              buyPrice,
              sellPrice,
              profitPercent,
              estimatedProfit: profitPercent * 10, // Estimate for $1000 trade
              confidence: 0.9, // High confidence for real data
              riskLevel: 'LOW'
            });
          }
        }
      }
    }
    
    return opportunities;
  }
}
