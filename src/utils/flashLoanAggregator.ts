
import { ChainConfig, FlashLoanProvider } from '../config/types';

export interface FlashLoanQuote {
  provider: FlashLoanProvider;
  effectiveFee: number;
  estimatedTime: number;
  availability: boolean;
  reliability: number;
  volumeDiscount?: number;
}

export interface AggregatorOptions {
  userVolume: number;
  preferredProviders?: string[];
  maxSlippage: number;
  prioritizeSpeed: boolean;
}

export class FlashLoanAggregator {
  private static volumeDiscountTiers = [
    { minVolume: 1000000, discount: 0.25 }, // 25% discount for $1M+ volume
    { minVolume: 500000, discount: 0.15 },  // 15% discount for $500K+ volume
    { minVolume: 100000, discount: 0.08 },  // 8% discount for $100K+ volume
    { minVolume: 50000, discount: 0.05 }    // 5% discount for $50K+ volume
  ];

  static getBestFlashLoanQuote(
    chain: ChainConfig, 
    amount: number, 
    options: AggregatorOptions
  ): FlashLoanQuote | null {
    const availableProviders = chain.flashLoanProviders.filter(
      provider => provider.available && 
                 amount >= provider.minAmount && 
                 amount <= provider.maxAmount
    );

    if (availableProviders.length === 0) return null;

    const quotes = availableProviders.map(provider => {
      // Apply volume discounts
      let effectiveFee = provider.fee;
      const volumeDiscount = this.getVolumeDiscount(options.userVolume);
      if (volumeDiscount > 0) {
        effectiveFee = provider.fee * (1 - volumeDiscount);
      }

      // Speed bonus for certain providers
      let estimatedTime = 2000 + Math.random() * 1000;
      if (provider.name === 'dYdX' || provider.name === 'Mango') {
        estimatedTime *= 0.8; // 20% faster
      }

      return {
        provider,
        effectiveFee,
        estimatedTime,
        availability: provider.available,
        reliability: provider.reliability,
        volumeDiscount
      };
    });

    // Multi-criteria sorting: fee (40%), reliability (30%), speed (30%)
    return quotes.sort((a, b) => {
      const aScore = (a.effectiveFee * 0.4) + 
                    ((100 - a.reliability) * 0.3) + 
                    (a.estimatedTime / 1000 * 0.3);
      const bScore = (b.effectiveFee * 0.4) + 
                    ((100 - b.reliability) * 0.3) + 
                    (b.estimatedTime / 1000 * 0.3);
      return aScore - bScore;
    })[0];
  }

  private static getVolumeDiscount(userVolume: number): number {
    for (const tier of this.volumeDiscountTiers) {
      if (userVolume >= tier.minVolume) {
        return tier.discount;
      }
    }
    return 0;
  }

  static estimateCompetitiveFee(
    primaryQuote: FlashLoanQuote,
    allQuotes: FlashLoanQuote[]
  ): number {
    if (allQuotes.length < 2) return primaryQuote.effectiveFee;
    
    // Use competitive pricing - 10% better than second best
    const secondBest = allQuotes.sort((a, b) => a.effectiveFee - b.effectiveFee)[1];
    return Math.min(primaryQuote.effectiveFee, secondBest.effectiveFee * 0.9);
  }
}
