
export interface MultiHopRoute {
  id: string;
  path: string[];
  tokens: string[];
  chains: string[];
  estimatedProfit: number;
  totalFees: number;
  netProfit: number;
  executionTime: number;
  confidence: number;
  hops: number;
}

interface RouteData {
  path: string[];
  tokens: string[];
  chains: string[];
}

type ChainPrices = Record<string, number>;
type PriceData = Record<string, ChainPrices>;

export class MultiHopArbitrage {
  private static chains = ['solana', 'base', 'fantom'];
  private static tokens = ['SOL', 'ETH', 'USDC', 'FTM', 'USDT'];
  
  private static prices: PriceData = {
    'solana': { 'SOL': 98.50, 'ETH': 2420.5, 'USDC': 1.0001, 'FTM': 0.4522, 'USDT': 1.0002 },
    'base': { 'SOL': 98.45, 'ETH': 2419.8, 'USDC': 0.9999, 'FTM': 0.4519, 'USDT': 0.9998 },
    'fantom': { 'SOL': 98.52, 'ETH': 2421.2, 'USDC': 1.0002, 'FTM': 0.4520, 'USDT': 1.0001 }
  };

  static findMultiHopOpportunities(maxHops: number = 4): MultiHopRoute[] {
    const opportunities: MultiHopRoute[] = [];
    let routeId = 0;

    // Generate 3-hop and 4-hop routes
    for (let startChain of this.chains) {
      for (let startToken of this.tokens) {
        const routes = this.generateRoutes(startChain, startToken, maxHops);
        
        routes.forEach(route => {
          const profit = this.calculateRouteProfit(route);
          if (profit.netProfit > 5) { // Minimum $5 profit threshold
            opportunities.push({
              id: `multihop-${routeId++}`,
              path: route.path,
              tokens: route.tokens,
              chains: route.chains,
              estimatedProfit: profit.grossProfit,
              totalFees: profit.totalFees,
              netProfit: profit.netProfit,
              executionTime: route.chains.length * 3000, // 3 seconds per hop
              confidence: Math.max(60, 90 - (route.chains.length - 2) * 10), // Lower confidence for more hops
              hops: route.chains.length
            });
          }
        });
      }
    }

    return opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, 15);
  }

  private static generateRoutes(startChain: string, startToken: string, maxHops: number): RouteData[] {
    const routes: RouteData[] = [];
    
    // 3-hop route: Chain A -> Chain B -> Chain C -> Chain A
    this.chains.forEach(midChain => {
      if (midChain !== startChain) {
        this.chains.forEach(endChain => {
          if (endChain !== startChain && endChain !== midChain) {
            // Try different token combinations
            this.tokens.forEach(midToken => {
              if (midToken !== startToken) {
                routes.push({
                  path: [`${startChain}-${startToken}`, `${midChain}-${midToken}`, `${endChain}-${startToken}`, `${startChain}-${startToken}`],
                  tokens: [startToken, midToken, startToken, startToken],
                  chains: [startChain, midChain, endChain, startChain]
                });
              }
            });
          }
        });
      }
    });

    return routes;
  }

  private static calculateRouteProfit(route: RouteData) {
    let currentAmount = 10000; // Start with $10k
    let totalFees = 0;
    
    for (let i = 0; i < route.chains.length - 1; i++) {
      const fromChain = route.chains[i];
      const toChain = route.chains[i + 1];
      const fromToken = route.tokens[i];
      const toToken = route.tokens[i + 1];
      
      // Get prices with type safety
      const fromChainPrices = this.prices[fromChain];
      const toChainPrices = this.prices[toChain];
      
      if (!fromChainPrices || !toChainPrices) continue;
      
      const fromPrice = fromChainPrices[fromToken];
      const toPrice = toChainPrices[toToken];
      
      if (!fromPrice || !toPrice) continue;
      
      // Calculate conversion
      const tokenAmount = currentAmount / fromPrice;
      currentAmount = tokenAmount * toPrice;
      
      // Add fees (bridge + trading)
      const bridgeFee = currentAmount * 0.001; // 0.1% bridge fee
      const tradingFee = currentAmount * 0.003; // 0.3% trading fee
      totalFees += bridgeFee + tradingFee;
      currentAmount -= bridgeFee + tradingFee;
    }
    
    const grossProfit = currentAmount - 10000;
    const netProfit = grossProfit - totalFees;
    
    return { grossProfit, totalFees, netProfit };
  }
}
