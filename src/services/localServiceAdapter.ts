
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
