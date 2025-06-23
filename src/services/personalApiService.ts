
import { LocalServiceAdapter } from './localServiceAdapter';

interface PersonalApiConfig {
  jupiterApiKey?: string;
  oneInchApiKey?: string;
  coinGeckoApiKey?: string;
  maxSlippage: number;
  maxTradeAmount: number;
  minProfitThreshold: number;
  enableRiskChecks: boolean;
  allowedChains: number[];
  rateLimitPerMinute: number;
}

interface TokenPriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  marketCap?: number;
  lastUpdated: number;
  source: string;
  reliability: number;
}

interface ArbitrageOpportunity {
  tokenSymbol: string;
  buyChain: string;
  sellChain: string;
  buyPrice: number;
  sellPrice: number;
  profitPercent: number;
  estimatedProfit: number;
  riskScore: number;
  confidence: number;
  timestamp: number;
}

export class PersonalApiService {
  private static config: PersonalApiConfig = {
    maxSlippage: 0.5, // 0.5% max slippage
    maxTradeAmount: 1000, // $1000 max per trade for safety
    minProfitThreshold: 0.3, // Minimum 0.3% profit
    enableRiskChecks: true,
    allowedChains: [1, 8453, 250], // Ethereum, Base, Fantom
    rateLimitPerMinute: 30
  };

  private static priceCache = new Map<string, TokenPriceData>();
  private static requestCount = new Map<string, number>();
  private static lastReset = Date.now();

  // Chain configurations for our three supported chains
  private static chainConfigs = {
    1: { // Ethereum (for reference pricing)
      name: 'Ethereum',
      rpcUrl: 'https://eth.llamarpc.com',
      nativeToken: 'ETH'
    },
    8453: { // Base
      name: 'Base',
      rpcUrl: 'https://base.llamarpc.com',
      nativeToken: 'ETH'
    },
    250: { // Fantom
      name: 'Fantom',
      rpcUrl: 'https://rpc.ftm.tools',
      nativeToken: 'FTM'
    }
  };

  // Token contracts for our supported chains
  private static tokenContracts = {
    8453: { // Base
      'ETH': '0x0000000000000000000000000000000000000000',
      'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      'USDT': '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      'DAI': '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'
    },
    250: { // Fantom
      'FTM': '0x0000000000000000000000000000000000000000',
      'USDC': '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
      'USDT': '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
      'DAI': '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E'
    }
  };

  // Solana token mints
  private static solanaMints = {
    'SOL': 'So11111111111111111111111111111111111111112',
    'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'
  };

  static setConfig(newConfig: Partial<PersonalApiConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('PersonalApiService: Configuration updated with enhanced security');
  }

  static getConfig(): PersonalApiConfig {
    return { ...this.config };
  }

  // Rate limiting for security
  private static checkRateLimit(identifier: string = 'default'): boolean {
    const now = Date.now();
    
    // Reset counters every minute
    if (now - this.lastReset > 60000) {
      this.requestCount.clear();
      this.lastReset = now;
    }

    const currentCount = this.requestCount.get(identifier) || 0;
    if (currentCount >= this.config.rateLimitPerMinute) {
      console.warn(`Rate limit exceeded for ${identifier}`);
      return false;
    }

    this.requestCount.set(identifier, currentCount + 1);
    return true;
  }

  // Enhanced Solana price fetching with reliability scoring
  static async getSolanaPrice(tokenSymbol: string): Promise<TokenPriceData | null> {
    if (!this.checkRateLimit(`solana-${tokenSymbol}`)) return null;

    const cacheKey = `SOL-${tokenSymbol}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < 15000) { // 15 second cache
      return cached;
    }

    try {
      const mint = this.solanaMints[tokenSymbol as keyof typeof this.solanaMints];
      if (!mint) return null;

      // Try Jupiter API first (most reliable for Solana)
      let priceData: TokenPriceData | null = null;
      
      if (this.config.jupiterApiKey) {
        try {
          const response = await fetch(`https://price.jup.ag/v4/price?ids=${mint}`, {
            headers: {
              'Authorization': `Bearer ${this.config.jupiterApiKey}`
            }
          });
          
          const data = await response.json();
          
          if (data.data && data.data[mint]) {
            const jupiterData = data.data[mint];
            priceData = {
              symbol: tokenSymbol,
              price: jupiterData.price,
              change24h: jupiterData.priceChange24h || 0,
              volume24h: jupiterData.volume24h || 0,
              liquidity: jupiterData.liquidity || 0,
              lastUpdated: Date.now(),
              source: 'Jupiter',
              reliability: 0.95 // Jupiter is highly reliable for Solana
            };
          }
        } catch (error) {
          console.warn('Jupiter API failed, trying backup sources');
        }
      }

      // Fallback to CoinGecko for additional validation
      if (!priceData && this.config.coinGeckoApiKey) {
        const coinGeckoIds: Record<string, string> = {
          'SOL': 'solana',
          'USDC': 'usd-coin',
          'USDT': 'tether',
          'RAY': 'raydium'
        };

        const coinId = coinGeckoIds[tokenSymbol];
        if (coinId) {
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
              {
                headers: {
                  'x-cg-demo-api-key': this.config.coinGeckoApiKey
                }
              }
            );

            const data = await response.json();
            
            if (data[coinId]) {
              const cgData = data[coinId];
              priceData = {
                symbol: tokenSymbol,
                price: cgData.usd,
                change24h: cgData.usd_24h_change || 0,
                volume24h: cgData.usd_24h_vol || 0,
                liquidity: 0,
                marketCap: cgData.usd_market_cap,
                lastUpdated: Date.now(),
                source: 'CoinGecko',
                reliability: 0.85
              };
            }
          } catch (error) {
            console.warn('CoinGecko API failed');
          }
        }
      }

      if (priceData) {
        this.priceCache.set(cacheKey, priceData);
        console.log(`✓ Solana ${tokenSymbol} price: $${priceData.price} (${priceData.source})`);
      }

      return priceData;
    } catch (error) {
      console.error(`Error fetching Solana price for ${tokenSymbol}:`, error);
      return cached;
    }
  }

  // Enhanced EVM price fetching for Base and Fantom
  static async getEVMPrice(chainId: number, tokenSymbol: string): Promise<TokenPriceData | null> {
    if (!this.config.allowedChains.includes(chainId)) {
      console.warn(`Chain ${chainId} not allowed`);
      return null;
    }

    if (!this.checkRateLimit(`evm-${chainId}-${tokenSymbol}`)) return null;

    const cacheKey = `${chainId}-${tokenSymbol}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < 15000) {
      return cached;
    }

    try {
      const tokenAddress = this.tokenContracts[chainId as keyof typeof this.tokenContracts]?.[tokenSymbol as keyof any];
      if (!tokenAddress) return null;

      let priceData: TokenPriceData | null = null;

      // Try 1inch API first for EVM chains
      if (this.config.oneInchApiKey) {
        try {
          const response = await fetch(
            `https://api.1inch.dev/price/v1.1/${chainId}/${tokenAddress}`,
            {
              headers: {
                'Authorization': `Bearer ${this.config.oneInchApiKey}`,
                'Accept': 'application/json'
              }
            }
          );

          const data = await response.json();
          
          if (data[tokenAddress]) {
            priceData = {
              symbol: tokenSymbol,
              price: parseFloat(data[tokenAddress]),
              change24h: 0, // 1inch doesn't provide 24h change
              volume24h: 0,
              liquidity: 0,
              lastUpdated: Date.now(),
              source: '1inch',
              reliability: 0.90
            };
          }
        } catch (error) {
          console.warn(`1inch API failed for ${tokenSymbol} on chain ${chainId}`);
        }
      }

      // Enhance with CoinGecko data
      if (this.config.coinGeckoApiKey) {
        const coinGeckoIds: Record<string, string> = {
          'ETH': 'ethereum',
          'FTM': 'fantom',
          'USDC': 'usd-coin',
          'USDT': 'tether',
          'DAI': 'dai'
        };

        const coinId = coinGeckoIds[tokenSymbol];
        if (coinId) {
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
              {
                headers: {
                  'x-cg-demo-api-key': this.config.coinGeckoApiKey
                }
              }
            );

            const data = await response.json();
            
            if (data[coinId]) {
              const cgData = data[coinId];
              
              // Merge with 1inch data if available, otherwise use CoinGecko only
              priceData = {
                symbol: tokenSymbol,
                price: priceData?.price || cgData.usd,
                change24h: cgData.usd_24h_change || 0,
                volume24h: cgData.usd_24h_vol || 0,
                liquidity: priceData?.liquidity || 0,
                marketCap: cgData.usd_market_cap,
                lastUpdated: Date.now(),
                source: priceData ? '1inch+CoinGecko' : 'CoinGecko',
                reliability: priceData ? 0.95 : 0.85
              };
            }
          } catch (error) {
            console.warn(`CoinGecko API failed for ${tokenSymbol}`);
          }
        }
      }

      if (priceData) {
        this.priceCache.set(cacheKey, priceData);
        console.log(`✓ ${this.chainConfigs[chainId as keyof typeof this.chainConfigs].name} ${tokenSymbol} price: $${priceData.price} (${priceData.source})`);
      }

      return priceData;
    } catch (error) {
      console.error(`Error fetching EVM price for ${tokenSymbol} on chain ${chainId}:`, error);
      return cached;
    }
  }

  // Low-risk arbitrage opportunity detection
  static async findArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
    if (!this.checkRateLimit('arbitrage-scan')) return [];

    const opportunities: ArbitrageOpportunity[] = [];
    const supportedTokens = ['USDC', 'USDT', 'ETH'];

    try {
      for (const token of supportedTokens) {
        // Get prices from all supported chains
        const [solanaPrice, basePrice, fantomPrice] = await Promise.all([
          token === 'ETH' ? null : this.getSolanaPrice(token),
          this.getEVMPrice(8453, 'ETH'), // Base ETH price
          this.getEVMPrice(250, token === 'ETH' ? 'FTM' : token)
        ]);

        const prices = [
          { chain: 'Solana', price: solanaPrice?.price, data: solanaPrice },
          { chain: 'Base', price: basePrice?.price, data: basePrice },
          { chain: 'Fantom', price: fantomPrice?.price, data: fantomPrice }
        ].filter(p => p.price && p.data);

        // Find arbitrage opportunities between chains
        for (let i = 0; i < prices.length; i++) {
          for (let j = i + 1; j < prices.length; j++) {
            const buyChain = prices[i];
            const sellChain = prices[j];
            
            if (!buyChain.price || !sellChain.price) continue;

            const profitPercent = ((sellChain.price - buyChain.price) / buyChain.price) * 100;
            
            if (Math.abs(profitPercent) >= this.config.minProfitThreshold) {
              const riskScore = this.calculateRiskScore(buyChain.data!, sellChain.data!);
              
              // Only include low-risk opportunities
              if (riskScore <= 30) { // Risk score out of 100, 30 = low risk
                opportunities.push({
                  tokenSymbol: token,
                  buyChain: profitPercent > 0 ? buyChain.chain : sellChain.chain,
                  sellChain: profitPercent > 0 ? sellChain.chain : buyChain.chain,
                  buyPrice: profitPercent > 0 ? buyChain.price : sellChain.price,
                  sellPrice: profitPercent > 0 ? sellChain.price : buyChain.price,
                  profitPercent: Math.abs(profitPercent),
                  estimatedProfit: Math.abs(profitPercent) * this.config.maxTradeAmount / 100,
                  riskScore,
                  confidence: Math.min(buyChain.data!.reliability, sellChain.data!.reliability),
                  timestamp: Date.now()
                });
              }
            }
          }
        }
      }

      // Sort by profit percentage (highest first) and limit to top 10
      opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
      return opportunities.slice(0, 10);

    } catch (error) {
      console.error('Error finding arbitrage opportunities:', error);
      return [];
    }
  }

  // Risk scoring algorithm for conservative trading
  private static calculateRiskScore(buyData: TokenPriceData, sellData: TokenPriceData): number {
    let riskScore = 0;

    // Reliability risk (lower reliability = higher risk)
    riskScore += (1 - Math.min(buyData.reliability, sellData.reliability)) * 30;

    // Volatility risk (higher 24h change = higher risk)
    const avgVolatility = (Math.abs(buyData.change24h) + Math.abs(sellData.change24h)) / 2;
    riskScore += Math.min(avgVolatility * 2, 20);

    // Liquidity risk (lower volume = higher risk)
    const avgVolume = (buyData.volume24h + sellData.volume24h) / 2;
    if (avgVolume < 100000) riskScore += 20; // Low volume
    else if (avgVolume < 1000000) riskScore += 10; // Medium volume

    // Source reliability risk
    if (buyData.source.includes('CoinGecko') || sellData.source.includes('CoinGecko')) {
      riskScore -= 5; // CoinGecko is reliable
    }

    // Age of data risk
    const dataAge = Math.max(Date.now() - buyData.lastUpdated, Date.now() - sellData.lastUpdated);
    if (dataAge > 30000) riskScore += 10; // Data older than 30 seconds

    return Math.max(0, Math.min(100, riskScore));
  }

  // Health check for all APIs
  static async healthCheck(): Promise<{
    jupiter: boolean;
    oneInch: boolean;
    coinGecko: boolean;
    overall: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }> {
    const health = {
      jupiter: false,
      oneInch: false,
      coinGecko: false,
      overall: false,
      riskLevel: 'HIGH' as const
    };

    try {
      // Test Jupiter
      if (this.config.jupiterApiKey) {
        const solPrice = await this.getSolanaPrice('SOL');
        health.jupiter = solPrice !== null;
      }

      // Test 1inch
      if (this.config.oneInchApiKey) {
        const ethPrice = await this.getEVMPrice(8453, 'ETH');
        health.oneInch = ethPrice !== null;
      }

      // Test CoinGecko
      if (this.config.coinGeckoApiKey) {
        const response = await fetch('https://api.coingecko.com/api/v3/ping');
        health.coinGecko = response.ok;
      }

      const workingApis = [health.jupiter, health.oneInch, health.coinGecko].filter(Boolean).length;
      health.overall = workingApis >= 2; // Need at least 2 APIs working

      // Determine risk level based on API availability
      if (workingApis >= 3) health.riskLevel = 'LOW';
      else if (workingApis >= 2) health.riskLevel = 'MEDIUM';
      else health.riskLevel = 'HIGH';

      console.log(`API Health Check: ${workingApis}/3 services operational (Risk: ${health.riskLevel})`);
      
    } catch (error) {
      console.error('Health check failed:', error);
    }

    return health;
  }

  // Clear cache for fresh data
  static clearCache(): void {
    this.priceCache.clear();
    console.log('Price cache cleared');
  }

  // Get cache statistics
  static getCacheStats(): { size: number; oldestEntry: number; newestEntry: number } {
    const entries = Array.from(this.priceCache.values());
    const timestamps = entries.map(e => e.lastUpdated);
    
    return {
      size: this.priceCache.size,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }
}
