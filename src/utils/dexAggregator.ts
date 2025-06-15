
import { DEXConfig } from '../config/types';

export interface DexQuote {
  dex: DEXConfig;
  effectiveFee: number;
  slippage: number;
  liquidity: number;
  priceImpact: number;
  routeOptimized: boolean;
}

export interface AggregatedRoute {
  buyQuote: DexQuote;
  sellQuote: DexQuote;
  totalFees: number;
  estimatedProfit: number;
  confidence: number;
}

export class DexAggregator {
  private static feeDiscounts = {
    'volume-based': {
      100000: 0.1,  // 10% discount for $100k+ volume
      500000: 0.15, // 15% discount for $500k+ volume
      1000000: 0.2  // 20% discount for $1M+ volume
    },
    'maker-rebates': {
      'Curve Finance': 0.02,
      'Balancer': 0.01,
      'SushiSwap': 0.005
    }
  };

  static getOptimalDexRoute(
    dexes: DEXConfig[], 
    amount: number, 
    userVolume: number = 0,
    preferLowSlippage: boolean = true
  ): DexQuote {
    const quotes = dexes.map(dex => {
      let effectiveFee = dex.fee;
      
      // Apply volume discounts
      const volumeDiscount = this.getVolumeDiscount(userVolume);
      effectiveFee = dex.fee * (1 - volumeDiscount);
      
      // Apply maker rebates
      const makerRebate = this.feeDiscounts['maker-rebates'][dex.name] || 0;
      effectiveFee = Math.max(0, effectiveFee - makerRebate);
      
      // Calculate price impact based on liquidity
      const priceImpact = this.calculatePriceImpact(amount, dex.liquidity);
      
      // Adjust slippage for large orders
      let adjustedSlippage = dex.slippage;
      if (amount > dex.liquidity * 0.01) {
        adjustedSlippage *= 1.5; // 50% higher slippage for large orders
      }

      return {
        dex,
        effectiveFee,
        slippage: adjustedSlippage,
        liquidity: dex.liquidity,
        priceImpact,
        routeOptimized: this.isRouteOptimized(dex.name)
      };
    });

    // Multi-criteria sorting
    return quotes.sort((a, b) => {
      if (preferLowSlippage) {
        const aScore = (a.effectiveFee * 0.4) + (a.slippage * 0.4) + (a.priceImpact * 0.2);
        const bScore = (b.effectiveFee * 0.4) + (b.slippage * 0.4) + (b.priceImpact * 0.2);
        return aScore - bScore;
      } else {
        const aScore = (a.effectiveFee * 0.6) + (a.slippage * 0.2) + (a.priceImpact * 0.2);
        const bScore = (b.effectiveFee * 0.6) + (b.slippage * 0.2) + (b.priceImpact * 0.2);
        return aScore - bScore;
      }
    })[0];
  }

  static findOptimalArbitrageRoute(
    buyDexes: DEXConfig[],
    sellDexes: DEXConfig[],
    amount: number,
    spread: number,
    userVolume: number = 0
  ): AggregatedRoute | null {
    const buyQuote = this.getOptimalDexRoute(buyDexes, amount, userVolume, true);
    const sellQuote = this.getOptimalDexRoute(sellDexes, amount, userVolume, true);
    
    const totalFees = (buyQuote.effectiveFee + sellQuote.effectiveFee) * amount / 100;
    const grossProfit = amount * spread / 100;
    const estimatedProfit = grossProfit - totalFees;
    
    // Calculate confidence based on liquidity and slippage
    const liquidityScore = Math.min(buyQuote.liquidity, sellQuote.liquidity) / 1000000; // Normalize to millions
    const slippageScore = 1 - Math.max(buyQuote.slippage, sellQuote.slippage);
    const confidence = Math.min(95, (liquidityScore * 50) + (slippageScore * 45));
    
    if (estimatedProfit <= 0) return null;
    
    return {
      buyQuote,
      sellQuote,
      totalFees,
      estimatedProfit,
      confidence
    };
  }

  private static getVolumeDiscount(userVolume: number): number {
    const discounts = this.feeDiscounts['volume-based'];
    
    if (userVolume >= 1000000) return discounts[1000000];
    if (userVolume >= 500000) return discounts[500000];
    if (userVolume >= 100000) return discounts[100000];
    
    return 0;
  }

  private static calculatePriceImpact(amount: number, liquidity: number): number {
    if (liquidity === 0) return 1; // 100% price impact for no liquidity
    
    const ratio = amount / liquidity;
    
    if (ratio < 0.001) return 0.001; // 0.1% minimum
    if (ratio < 0.01) return ratio * 0.5; // Linear up to 0.5%
    if (ratio < 0.05) return 0.005 + (ratio - 0.01) * 2; // Up to 8.5%
    
    return Math.min(0.15, 0.085 + (ratio - 0.05) * 3); // Cap at 15%
  }

  private static isRouteOptimized(dexName: string): boolean {
    const optimizedDexes = ['1inch', 'Paraswap', 'Jupiter', 'Matcha'];
    return optimizedDexes.includes(dexName);
  }

  static estimateSlippage(amount: number, liquidity: number, baseFee: number): number {
    const liquidityRatio = amount / liquidity;
    let slippageMultiplier = 1;
    
    if (liquidityRatio > 0.05) slippageMultiplier = 3;
    else if (liquidityRatio > 0.01) slippageMultiplier = 2;
    else if (liquidityRatio > 0.005) slippageMultiplier = 1.5;
    
    return baseFee * slippageMultiplier;
  }
}
