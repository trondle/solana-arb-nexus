
export interface TriangleOpportunity {
  id: string;
  chain: string;
  tokenA: string;
  tokenB: string;
  tokenC: string;
  path: string;
  priceA: number;
  priceB: number;
  priceC: number;
  profit: number;
  profitPercent: number;
  confidence: number;
  dexes: string[];
}

export class TriangleArbitrage {
  private static dexPrices = {
    'solana': {
      'Raydium': { 'SOL/USDC': 98.50, 'ETH/USDC': 2420.0, 'ETH/SOL': 24.57 },
      'Orca': { 'SOL/USDC': 98.45, 'ETH/USDC': 2419.5, 'ETH/SOL': 24.55 },
      'Jupiter': { 'SOL/USDC': 98.52, 'ETH/USDC': 2421.0, 'ETH/SOL': 24.59 }
    },
    'base': {
      'Uniswap V3': { 'ETH/USDC': 2419.8, 'SOL/USDC': 98.40, 'SOL/ETH': 0.0407 },
      'SushiSwap': { 'ETH/USDC': 2420.2, 'SOL/USDC': 98.35, 'SOL/ETH': 0.0406 }
    },
    'fantom': {
      'SpookySwap': { 'FTM/USDC': 0.4520, 'ETH/USDC': 2421.0, 'ETH/FTM': 5354.2 },
      'SpiritSwap': { 'FTM/USDC': 0.4518, 'ETH/USDC': 2420.5, 'ETH/FTM': 5356.8 }
    }
  };

  static findTriangleOpportunities(): TriangleOpportunity[] {
    const opportunities: TriangleOpportunity[] = [];
    let oppId = 0;

    Object.entries(this.dexPrices).forEach(([chain, chainDexes]) => {
      const dexNames = Object.keys(chainDexes);
      
      // Check each DEX for triangle opportunities
      dexNames.forEach(dex => {
        const prices = chainDexes[dex as keyof typeof chainDexes];
        const pairs = Object.keys(prices);
        
        // Look for triangle patterns
        this.findTrianglesInDex(prices, pairs).forEach(triangle => {
          if (triangle.profitPercent > 0.1) { // Minimum 0.1% profit
            opportunities.push({
              id: `triangle-${oppId++}`,
              chain,
              tokenA: triangle.tokenA,
              tokenB: triangle.tokenB,
              tokenC: triangle.tokenC,
              path: triangle.path,
              priceA: triangle.priceA,
              priceB: triangle.priceB,
              priceC: triangle.priceC,
              profit: triangle.profit,
              profitPercent: triangle.profitPercent,
              confidence: 80 + Math.random() * 15, // 80-95% confidence
              dexes: [dex]
            });
          }
        });
      });

      // Cross-DEX triangles (higher profit potential)
      if (dexNames.length > 1) {
        this.findCrossDexTriangles(chainDexes, dexNames, chain).forEach(triangle => {
          if (triangle.profitPercent > 0.05) { // Lower threshold for cross-DEX
            opportunities.push({
              id: `cross-triangle-${oppId++}`,
              chain,
              tokenA: triangle.tokenA,
              tokenB: triangle.tokenB,
              tokenC: triangle.tokenC,
              path: triangle.path,
              priceA: triangle.priceA,
              priceB: triangle.priceB,
              priceC: triangle.priceC,
              profit: triangle.profit,
              profitPercent: triangle.profitPercent,
              confidence: 85 + Math.random() * 10,
              dexes: triangle.dexes
            });
          }
        });
      }
    });

    return opportunities.sort((a, b) => b.profitPercent - a.profitPercent).slice(0, 20);
  }

  private static findTrianglesInDex(prices: any, pairs: string[]) {
    const triangles: any[] = [];
    
    // Example: SOL/USDC + ETH/USDC + ETH/SOL should form a triangle
    if (prices['SOL/USDC'] && prices['ETH/USDC'] && prices['ETH/SOL']) {
      const solUsdcPrice = prices['SOL/USDC'];
      const ethUsdcPrice = prices['ETH/USDC'];
      const ethSolPrice = prices['ETH/SOL'];
      
      // Calculate expected ETH/SOL price from the other two
      const expectedEthSol = ethUsdcPrice / solUsdcPrice;
      const actualEthSol = ethSolPrice;
      
      const discrepancy = (actualEthSol - expectedEthSol) / expectedEthSol;
      
      if (Math.abs(discrepancy) > 0.001) { // 0.1% minimum discrepancy
        const profit = 10000 * Math.abs(discrepancy) * 0.8; // 80% capture rate
        triangles.push({
          tokenA: 'USDC',
          tokenB: 'SOL',
          tokenC: 'ETH',
          path: 'USDC→SOL→ETH→USDC',
          priceA: 1,
          priceB: solUsdcPrice,
          priceC: ethUsdcPrice,
          profit,
          profitPercent: Math.abs(discrepancy) * 100
        });
      }
    }
    
    return triangles;
  }

  private static findCrossDexTriangles(chainDexes: any, dexNames: string[], chain: string) {
    const triangles: any[] = [];
    
    // Compare prices across different DEXes for arbitrage
    for (let i = 0; i < dexNames.length; i++) {
      for (let j = i + 1; j < dexNames.length; j++) {
        const dex1 = dexNames[i];
        const dex2 = dexNames[j];
        const prices1 = chainDexes[dex1];
        const prices2 = chainDexes[dex2];
        
        // Find common pairs and calculate potential profit
        Object.keys(prices1).forEach(pair => {
          if (prices2[pair]) {
            const price1 = prices1[pair];
            const price2 = prices2[pair];
            const spread = Math.abs(price1 - price2) / Math.min(price1, price2);
            
            if (spread > 0.002) { // 0.2% minimum spread
              const [tokenA, tokenB] = pair.split('/');
              const profit = 10000 * spread * 0.7; // 70% capture rate for cross-DEX
              
              triangles.push({
                tokenA,
                tokenB,
                tokenC: 'USDC',
                path: `${tokenA}→${tokenB}→${tokenA}`,
                priceA: price1,
                priceB: price2,
                priceC: 1,
                profit,
                profitPercent: spread * 100,
                dexes: [dex1, dex2]
              });
            }
          }
        });
      }
    }
    
    return triangles;
  }
}
