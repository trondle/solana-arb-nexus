
export interface TradingHistory {
  totalVolume: number;
  successRate: number;
  profitGenerated: number;
  consecutiveSuccesses: number;
}

export interface FeeNegotiation {
  originalFee: number;
  negotiatedFee: number;
  discount: number;
  reason: string;
}

export class DynamicFeeOptimizer {
  private static tradingHistory: TradingHistory = {
    totalVolume: 2500000, // $2.5M simulated volume
    successRate: 0.92, // 92% success rate
    profitGenerated: 85000, // $85k profit generated
    consecutiveSuccesses: 15
  };

  static negotiateFlashLoanFee(provider: any, amount: number): FeeNegotiation {
    const history = this.tradingHistory;
    let discount = 0;
    let reason = '';

    // Volume-based discounts (much more aggressive)
    if (history.totalVolume > 2000000) {
      discount += 0.4; // 40% discount for high volume
      reason += 'High-volume trader discount. ';
    } else if (history.totalVolume > 1000000) {
      discount += 0.25; // 25% discount
      reason += 'Volume-based discount. ';
    }

    // Success rate bonuses
    if (history.successRate > 0.9) {
      discount += 0.2; // 20% additional discount for high success rate
      reason += 'Excellence bonus for 90%+ success rate. ';
    }

    // Consecutive success streak bonus
    if (history.consecutiveSuccesses > 10) {
      discount += 0.15; // 15% streak bonus
      reason += `Streak bonus for ${history.consecutiveSuccesses} consecutive successes. `;
    }

    // Profit generation bonus
    if (history.profitGenerated > 50000) {
      discount += 0.1; // 10% bonus for generating significant profit
      reason += 'High-profit generator bonus. ';
    }

    // Large trade bonus
    if (amount > 20000) {
      discount += 0.05; // 5% bonus for large trades
      reason += 'Large trade bonus. ';
    }

    // Cap discount at 70%
    discount = Math.min(discount, 0.7);
    
    const originalFee = provider.fee;
    const negotiatedFee = originalFee * (1 - discount);

    return {
      originalFee,
      negotiatedFee,
      discount: discount * 100,
      reason: reason.trim()
    };
  }

  static updateTradingHistory(volume: number, success: boolean, profit: number) {
    this.tradingHistory.totalVolume += volume;
    this.tradingHistory.profitGenerated += profit;
    
    if (success) {
      this.tradingHistory.consecutiveSuccesses += 1;
    } else {
      this.tradingHistory.consecutiveSuccesses = 0;
    }
    
    // Recalculate success rate (simplified)
    this.tradingHistory.successRate = Math.min(0.95, this.tradingHistory.successRate + (success ? 0.01 : -0.02));
  }

  static getTradingHistory(): TradingHistory {
    return { ...this.tradingHistory };
  }
}
