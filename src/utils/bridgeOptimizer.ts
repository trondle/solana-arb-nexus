
export interface BridgeRoute {
  name: string;
  baseFee: number;
  percentageFee: number;
  estimatedTime: number;
  reliability: number;
  supported: boolean;
}

export interface OptimizedBridgeQuote {
  route: BridgeRoute;
  totalFee: number;
  estimatedTime: number;
  gasOptimized: boolean;
}

export class BridgeOptimizer {
  private static routes: Record<string, BridgeRoute[]> = {
    'ethereum-bsc': [
      { name: 'Stargate', baseFee: 5, percentageFee: 0.06, estimatedTime: 15000, reliability: 98, supported: true },
      { name: 'Multichain', baseFee: 8, percentageFee: 0.1, estimatedTime: 12000, reliability: 95, supported: true },
      { name: 'LayerZero', baseFee: 3, percentageFee: 0.05, estimatedTime: 18000, reliability: 97, supported: true }
    ],
    'ethereum-polygon': [
      { name: 'Polygon Bridge', baseFee: 2, percentageFee: 0.02, estimatedTime: 8000, reliability: 99, supported: true },
      { name: 'Stargate', baseFee: 4, percentageFee: 0.04, estimatedTime: 10000, reliability: 98, supported: true }
    ],
    'bsc-polygon': [
      { name: 'Multichain', baseFee: 3, percentageFee: 0.03, estimatedTime: 6000, reliability: 96, supported: true },
      { name: 'LayerZero', baseFee: 2, percentageFee: 0.04, estimatedTime: 8000, reliability: 97, supported: true }
    ],
    'fantom-avalanche': [
      { name: 'Multichain', baseFee: 1, percentageFee: 0.02, estimatedTime: 5000, reliability: 94, supported: true },
      { name: 'LayerZero', baseFee: 1.5, percentageFee: 0.03, estimatedTime: 7000, reliability: 96, supported: true }
    ]
  };

  static getOptimalBridgeRoute(
    fromChain: string, 
    toChain: string, 
    amount: number,
    prioritizeSpeed: boolean = false
  ): OptimizedBridgeQuote | null {
    const routeKey = `${fromChain.toLowerCase()}-${toChain.toLowerCase()}`;
    const reverseRouteKey = `${toChain.toLowerCase()}-${fromChain.toLowerCase()}`;
    
    const availableRoutes = this.routes[routeKey] || this.routes[reverseRouteKey] || [];
    const supportedRoutes = availableRoutes.filter(route => route.supported);

    if (supportedRoutes.length === 0) {
      // Fallback to generic bridge with higher fees
      return {
        route: {
          name: 'Generic Bridge',
          baseFee: 10,
          percentageFee: 0.15,
          estimatedTime: 20000,
          reliability: 90,
          supported: true
        },
        totalFee: 10 + (amount * 0.15 / 100),
        estimatedTime: 20000,
        gasOptimized: false
      };
    }

    const quotes = supportedRoutes.map(route => {
      const totalFee = route.baseFee + (amount * route.percentageFee / 100);
      return {
        route,
        totalFee,
        estimatedTime: route.estimatedTime,
        gasOptimized: route.name === 'LayerZero' || route.name === 'Stargate'
      };
    });

    // Sort by criteria: if prioritizing speed, weight time more heavily
    return quotes.sort((a, b) => {
      if (prioritizeSpeed) {
        const aScore = (a.totalFee * 0.3) + (a.estimatedTime / 1000 * 0.7);
        const bScore = (b.totalFee * 0.3) + (b.estimatedTime / 1000 * 0.7);
        return aScore - bScore;
      } else {
        const aScore = (a.totalFee * 0.7) + (a.estimatedTime / 1000 * 0.3);
        const bScore = (b.totalFee * 0.7) + (b.estimatedTime / 1000 * 0.3);
        return aScore - bScore;
      }
    })[0];
  }

  static getBridgeFeeEstimate(fromChain: string, toChain: string, amount: number): number {
    const quote = this.getOptimalBridgeRoute(fromChain, toChain, amount);
    return quote ? quote.totalFee : amount * 0.1; // 10% fallback
  }

  static getGasOptimizedRoutes(): string[] {
    return ['LayerZero', 'Stargate', 'Hyperlane'];
  }
}
