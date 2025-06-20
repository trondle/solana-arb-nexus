
interface LocalServiceConfig {
  enabled: boolean;
  baseUrl: string;
  port: string;
}

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: number;
  source: string;
}

interface QuoteRequest {
  inputMint?: string;
  outputMint?: string;
  src?: string;
  dst?: string;
  amount: number;
}

interface QuoteResponse {
  price: number;
  estimatedAmount: number;
  fee: number;
  slippage: number;
}

export class LocalServiceAdapter {
  private static config: LocalServiceConfig = {
    enabled: false,
    baseUrl: 'http://localhost',
    port: '3000'
  };

  static setConfig(config: LocalServiceConfig) {
    this.config = config;
    console.log('LocalServiceAdapter: Configuration updated', config);
  }

  static getServiceUrl(): string {
    return `${this.config.baseUrl}:${this.config.port}`;
  }

  static isEnabled(): boolean {
    return this.config.enabled;
  }

  // Solana API methods
  static async getSolanaPrice(tokenMints: string[]): Promise<TokenPrice[]> {
    if (!this.isEnabled()) return [];

    try {
      const url = `${this.getServiceUrl()}/solana/price?ids=${tokenMints.join(',')}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return tokenMints.map(mint => {
        const priceData = data[mint];
        if (!priceData) {
          return {
            symbol: this.mintToSymbol(mint),
            price: 0,
            change24h: 0,
            volume24h: 0,
            lastUpdated: Date.now(),
            source: 'local-service'
          };
        }

        return {
          symbol: this.mintToSymbol(mint),
          price: priceData.price || 0,
          change24h: priceData.change24h || 0,
          volume24h: priceData.volume24h || 0,
          lastUpdated: Date.now(),
          source: 'local-service'
        };
      });
    } catch (error) {
      console.error('LocalServiceAdapter: Solana price fetch failed:', error);
      return [];
    }
  }

  static async getSolanaQuote(inputMint: string, outputMint: string, amount: number): Promise<QuoteResponse | null> {
    if (!this.isEnabled()) return null;

    try {
      const url = `${this.getServiceUrl()}/solana/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        price: data.price || 0,
        estimatedAmount: data.outAmount || 0,
        fee: data.fee || 0,
        slippage: data.slippage || 0
      };
    } catch (error) {
      console.error('LocalServiceAdapter: Solana quote fetch failed:', error);
      return null;
    }
  }

  // EVM (Base & Fantom) API methods
  static async getEVMPrice(chainId: number, tokenAddresses: string[]): Promise<TokenPrice[]> {
    if (!this.isEnabled()) return [];

    try {
      const url = `${this.getServiceUrl()}/evm/${chainId}/price?tokens=${tokenAddresses.join(',')}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return tokenAddresses.map(address => {
        const priceData = data[address];
        if (!priceData) {
          return {
            symbol: this.addressToSymbol(address, chainId),
            price: 0,
            change24h: 0,
            volume24h: 0,
            lastUpdated: Date.now(),
            source: 'local-service'
          };
        }

        return {
          symbol: this.addressToSymbol(address, chainId),
          price: priceData.price || 0,
          change24h: priceData.change24h || 0,
          volume24h: priceData.volume24h || 0,
          lastUpdated: Date.now(),
          source: 'local-service'
        };
      });
    } catch (error) {
      console.error(`LocalServiceAdapter: EVM price fetch failed for chain ${chainId}:`, error);
      return [];
    }
  }

  static async getEVMQuote(chainId: number, srcToken: string, dstToken: string, amount: number): Promise<QuoteResponse | null> {
    if (!this.isEnabled()) return null;

    try {
      const url = `${this.getServiceUrl()}/evm/${chainId}/quote?src=${srcToken}&dst=${dstToken}&amount=${amount}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        price: data.price || 0,
        estimatedAmount: data.toAmount || 0,
        fee: data.fee || 0,
        slippage: data.slippage || 0
      };
    } catch (error) {
      console.error(`LocalServiceAdapter: EVM quote fetch failed for chain ${chainId}:`, error);
      return null;
    }
  }

  static async getEVMGasPrice(chainId: number): Promise<number> {
    if (!this.isEnabled()) return 0;

    try {
      const url = `${this.getServiceUrl()}/evm/${chainId}/gas-price`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.gasPrice || 0;
    } catch (error) {
      console.error(`LocalServiceAdapter: Gas price fetch failed for chain ${chainId}:`, error);
      return 0;
    }
  }

  // Market Data API methods
  static async getSimplePrice(coinIds: string[], vsCurrencies: string[] = ['usd']): Promise<TokenPrice[]> {
    if (!this.isEnabled()) return [];

    try {
      const url = `${this.getServiceUrl()}/prices/simple?ids=${coinIds.join(',')}&vs_currencies=${vsCurrencies.join(',')}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return coinIds.map(coinId => {
        const priceData = data[coinId];
        if (!priceData) {
          return {
            symbol: coinId,
            price: 0,
            change24h: 0,
            volume24h: 0,
            lastUpdated: Date.now(),
            source: 'local-service'
          };
        }

        return {
          symbol: coinId,
          price: priceData.usd || 0,
          change24h: priceData.usd_24h_change || 0,
          volume24h: priceData.usd_24h_vol || 0,
          lastUpdated: Date.now(),
          source: 'local-service'
        };
      });
    } catch (error) {
      console.error('LocalServiceAdapter: Simple price fetch failed:', error);
      return [];
    }
  }

  static async getTrendingTokens(): Promise<any[]> {
    if (!this.isEnabled()) return [];

    try {
      const url = `${this.getServiceUrl()}/prices/trending`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.coins || [];
    } catch (error) {
      console.error('LocalServiceAdapter: Trending tokens fetch failed:', error);
      return [];
    }
  }

  // Helper methods
  private static mintToSymbol(mint: string): string {
    const mintMap: Record<string, string> = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    };
    return mintMap[mint] || 'UNKNOWN';
  }

  private static addressToSymbol(address: string, chainId: number): string {
    const addressMaps: Record<number, Record<string, string>> = {
      8453: { // Base
        '0x0000000000000000000000000000000000000000': 'ETH',
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 'USDC',
        '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2': 'USDT'
      },
      250: { // Fantom
        '0x0000000000000000000000000000000000000000': 'FTM',
        '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75': 'USDC',
        '0x049d68029688eAbF473097a2fC38ef61633A3C7A': 'USDT'
      }
    };
    return addressMaps[chainId]?.[address] || 'UNKNOWN';
  }

  // Health check
  static async healthCheck(): Promise<{ solana: boolean; base: boolean; fantom: boolean; marketData: boolean }> {
    if (!this.isEnabled()) {
      return { solana: false, base: false, fantom: false, marketData: false };
    }

    const health = {
      solana: false,
      base: false,
      fantom: false,
      marketData: false
    };

    try {
      // Test Solana
      const solanaResponse = await fetch(`${this.getServiceUrl()}/solana/price?ids=So11111111111111111111111111111111111111112`);
      health.solana = solanaResponse.ok;
    } catch (e) {
      console.error('Solana health check failed:', e);
    }

    try {
      // Test Base
      const baseResponse = await fetch(`${this.getServiceUrl()}/evm/8453/gas-price`);
      health.base = baseResponse.ok;
    } catch (e) {
      console.error('Base health check failed:', e);
    }

    try {
      // Test Fantom
      const fantomResponse = await fetch(`${this.getServiceUrl()}/evm/250/gas-price`);
      health.fantom = fantomResponse.ok;
    } catch (e) {
      console.error('Fantom health check failed:', e);
    }

    try {
      // Test Market Data
      const marketResponse = await fetch(`${this.getServiceUrl()}/prices/simple?ids=solana&vs_currencies=usd`);
      health.marketData = marketResponse.ok;
    } catch (e) {
      console.error('Market data health check failed:', e);
    }

    console.log('Local Service Health Check:', health);
    return health;
  }
}
