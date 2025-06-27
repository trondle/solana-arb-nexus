
export interface TriangleOpportunity {
  id: string;
  tokenA: string;
  tokenB: string;
  tokenC: string;
  chain: string;
  dexes: string[];
  profit: number;
  profitPercent: number;
  confidence: number;
  executionTime: number;
  liquidity: number;
  slippage: number;
}

interface TokenPair {
  token1: string;
  token2: string;
  price: number;
  dex: string;
  liquidity: number;
}

export class TriangleArbitrage {
  private static chains = ['solana', 'base', 'fantom'];
  
  private static tradingPairs: Record<string, TokenPair[]> = {
    'solana': [
      { token1: 'SOL', token2: 'USDC', price: 98.50, dex: 'Raydium', liquidity: 5000000 },
      { token1: 'SOL', token2: 'ETH', price: 0.0407, dex: 'Orca', liquidity: 2000000 },
      { token1: 'ETH', token2: 'USDC', price: 2420.0, dex: 'Jupiter', liquidity: 8000000 },
      { token1: 'USDC', token2: 'USDT', price: 1.0001, dex: 'Raydium', liquidity: 10000000 },
      { token1: 'SOL', token2: 'USDT', price: 98.45, dex: 'Orca', liquidity: 3000000 }
    ],
    'base': [
      { token1: 'ETH', token2: 'USDC', price: 2419.8, dex: 'Uniswap V3', liquidity: 15000000 },
      { token1: 'ETH', token2: 'USDT', price: 2420.2, dex: 'SushiSwap', liquidity: 5000000 },
      { token1: 'USDC', token2: 'USDT', price: 0.9999, dex: 'Uniswap V3', liquidity: 20000000 }
    ],
    'fantom': [
      { token1: 'FTM', token2: 'USDC', price: 0.4520, dex: 'SpookySwap', liquidity: 2000000 },
      { token1: 'FTM', token2: 'ETH', price: 0.000187, dex: 'SpiritSwap', liquidity: 1000000 },
      { token1: 'ETH', token2: 'USDC', price: 2421.2, dex: 'SpookySwap', liquidity: 3000000 },
      { token1: 'USDC', token2: 'USDT', price: 1.0002, dex: 'SpiritSwap', liquidity: 5000000 }
    ]
  };

  static findTriangleOpportunities(): TriangleOpportunity[] {
    const opportunities: TriangleOpportunity[] = [];
    let oppId = 0;

    this.chains.forEach(chain => {
      const pairs = this.tradingPairs[chain];
      if (!pairs) return;

      // Find all possible triangle combinations
      for (let i = 0; i < pairs.length; i++) {
        for (let j = 0; j < pairs.length; j++) {
          for (let k = 0; k < pairs.length; k++) {
            if (i === j || j === k || i === k) continue;

            const pair1 = pairs[i]; // A -> B
            const pair2 = pairs[j]; // B -> C  
            const pair3 = pairs[k]; // C -> A

            // Check if we can form a triangle
            if (this.canFormTriangle(pair1, pair2, pair3)) {
              const profit = this.calculateTriangleProfit(pair1, pair2, pair3);
              
              if (profit.netProfit > 1) { // Minimum $1 profit
                opportunities.push({
                  id: `triangle-${oppId++}`,
                  tokenA: pair1.token1,
                  tokenB: pair1.token2,
                  tokenC: pair2.token2,
                  chain,
                  dexes: [pair1.dex, pair2.dex, pair3.dex],
                  profit: profit.netProfit,
                  profitPercent: profit.profitPercent,
                  confidence: this.calculateConfidence(pair1, pair2, pair3),
                  executionTime: 4000 + Math.random() * 2000, // 4-6 seconds
                  liquidity: Math.min(pair1.liquidity, pair2.liquidity, pair3.liquidity),
                  slippage: this.calculateSlippage(pair1, pair2, pair3)
                });
              }
            }
          }
        }
      }
    });

    return opportunities.sort((a, b) => b.profit - a.profit).slice(0, 10);
  }

  private static canFormTriangle(pair1: TokenPair, pair2: TokenPair, pair3: TokenPair): boolean {
    // Check if pair1.token2 == pair2.token1 and pair2.token2 == pair3.token1 and pair3.token2 == pair1.token1
    return (
      pair1.token2 === pair2.token1 &&
      pair2.token2 === pair3.token1 &&
      pair3.token2 === pair1.token1
    ) || (
      // Or reverse direction
      pair1.token2 === pair3.token2 &&
      pair2.token1 === pair1.token2 &&
      pair3.token1 === pair2.token2
    );
  }

  private static calculateTriangleProfit(pair1: TokenPair, pair2: TokenPair, pair3: TokenPair) {
    const startAmount = 1000; // Start with $1000
    
    // Execute the triangle trade
    let currentAmount = startAmount;
    
    // Trade 1: A -> B
    const amountB = currentAmount / pair1.price;
    
    // Trade 2: B -> C  
    const amountC = amountB / pair2.price;
    
    // Trade 3: C -> A
    const finalAmount = amountC * pair3.price;
    
    // Calculate fees (0.25% per trade = 0.75% total)
    const totalFees = startAmount * 0.0075;
    const grossProfit = finalAmount - startAmount;
    const netProfit = grossProfit - totalFees;
    const profitPercent = (netProfit / startAmount) * 100;
    
    return { grossProfit, netProfit, profitPercent };
  }

  private static calculateConfidence(pair1: TokenPair, pair2: TokenPair, pair3: TokenPair): number {
    // Base confidence on liquidity and price stability
    const avgLiquidity = (pair1.liquidity + pair2.liquidity + pair3.liquidity) / 3;
    const liquidityScore = Math.min(avgLiquidity / 1000000, 1) * 50; // Max 50 points
    
    // Price stability score (assume more stable for established pairs)
    const stabilityScore = 35; // Base score
    
    // Execution complexity penalty
    const complexityPenalty = 5; // 3 trades = some complexity
    
    return Math.min(95, liquidityScore + stabilityScore - complexityPenalty);
  }

  private static calculateSlippage(pair1: TokenPair, pair2: TokenPair, pair3: TokenPair): number {
    // Calculate expected slippage based on liquidity
    const pair1Slippage = Math.min(1000 / pair1.liquidity * 100, 2); // Max 2%
    const pair2Slippage = Math.min(1000 / pair2.liquidity * 100, 2);
    const pair3Slippage = Math.min(1000 / pair3.liquidity * 100, 2);
    
    return pair1Slippage + pair2Slippage + pair3Slippage;
  }

  static getOptimalTriangleRoute(chain: string, maxSlippage: number = 1.0): TriangleOpportunity | null {
    const opportunities = this.findTriangleOpportunities();
    const chainOpportunities = opportunities.filter(opp => 
      opp.chain === chain && opp.slippage <= maxSlippage
    );
    
    return chainOpportunities.length > 0 ? chainOpportunities[0] : null;
  }
}
