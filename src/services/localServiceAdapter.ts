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

export class LocalServiceAdapter {
  private static config: LocalServiceConfig = {
    enabled: false,
    baseUrl: 'http://localhost',
    port: '3001'
  };

  static setConfig(config: LocalServiceConfig) {
    this.config = config;
    console.log('LocalServiceAdapter configured:', config);
  }

  static isEnabled(): boolean {
    return this.config.enabled;
  }

  static async getPrice(symbol: string, chainId?: number): Promise<TokenPrice | null> {
    if (!this.isEnabled()) return null;

    try {
      // Try to get price based on chain context
      if (chainId === 101) { // Solana
        const mints = this.getSolanaMintForSymbol(symbol);
        if (mints.length > 0) {
          const results = await this.getSolanaPrice(mints);
          return results.find(r => r.symbol === symbol) || null;
        }
      } else if (chainId && [8453, 250].includes(chainId)) { // Base or Fantom
        const addresses = this.getEvmAddressForSymbol(symbol, chainId);
        if (addresses.length > 0) {
          const results = await this.getEVMPrice(chainId, addresses);
          return results.find(r => r.symbol === symbol) || null;
        }
      }

      // Fallback to simple market price
      const coinIds = this.getCoinIdForSymbol(symbol);
      if (coinIds.length > 0) {
        const results = await this.getSimplePrice(coinIds);
        return results.find(r => r.symbol === symbol) || null;
      }

      return null;
    } catch (error) {
      console.error(`LocalServiceAdapter getPrice error for ${symbol}:`, error);
      return null;
    }
  }

  private static getSolanaMintForSymbol(symbol: string): string[] {
    const mints: Record<string, string> = {
      'SOL': 'So11111111111111111111111111111111111111112',
      'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    };
    return mints[symbol] ? [mints[symbol]] : [];
  }

  private static getEvmAddressForSymbol(symbol: string, chainId: number): string[] {
    const addresses: Record<number, Record<string, string>> = {
      8453: { // Base
        'ETH': '0x0000000000000000000000000000000000000000',
        'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
      },
      250: { // Fantom
        'FTM': '0x0000000000000000000000000000000000000000',
        'USDC': '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75'
      }
    };
    return addresses[chainId]?.[symbol] ? [addresses[chainId][symbol]] : [];
  }

  private static getCoinIdForSymbol(symbol: string): string[] {
    const coinIds: Record<string, string> = {
      'SOL': 'solana',
      'ETH': 'ethereum',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'FTM': 'fantom'
    };
    return coinIds[symbol] ? [coinIds[symbol]] : [];
  }

  static async getSolanaPrice(mints: string[]): Promise<TokenPrice[]> {
    if (!this.isEnabled()) return [];

    try {
      const response = await fetch(`${this.config.baseUrl}:${this.config.port}/api/solana/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mints })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.prices || [];
    } catch (error) {
      console.error('LocalServiceAdapter Solana price error:', error);
      return [];
    }
  }

  static async getEVMPrice(chainId: number, addresses: string[]): Promise<TokenPrice[]> {
    if (!this.isEnabled()) return [];

    try {
      const response = await fetch(`${this.config.baseUrl}:${this.config.port}/api/evm/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainId, addresses })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.prices || [];
    } catch (error) {
      console.error('LocalServiceAdapter EVM price error:', error);
      return [];
    }
  }

  static async getSimplePrice(coinIds: string[]): Promise<TokenPrice[]> {
    if (!this.isEnabled()) return [];

    try {
      const response = await fetch(`${this.config.baseUrl}:${this.config.port}/api/market/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinIds })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.prices || [];
    } catch (error) {
      console.error('LocalServiceAdapter market price error:', error);
      return [];
    }
  }

  static async healthCheck(): Promise<{
    solana: boolean;
    base: boolean;
    fantom: boolean;
    marketData: boolean;
  }> {
    if (!this.isEnabled()) {
      return { solana: false, base: false, fantom: false, marketData: false };
    }

    try {
      const response = await fetch(`${this.config.baseUrl}:${this.config.port}/api/health`);
      const data = await response.json();
      
      return {
        solana: data.solana || false,
        base: data.base || false,
        fantom: data.fantom || false,
        marketData: data.marketData || false
      };
    } catch (error) {
      console.error('LocalServiceAdapter health check failed:', error);
      return { solana: false, base: false, fantom: false, marketData: false };
    }
  }
}
