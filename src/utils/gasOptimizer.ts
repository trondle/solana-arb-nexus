
export interface GasPrice {
  slow: number;
  standard: number;
  fast: number;
  instant: number;
}

export interface GasOptimization {
  recommendedGasPrice: number;
  estimatedConfirmationTime: number;
  potentialSavings: number;
  networkCongestion: 'low' | 'medium' | 'high';
}

export class GasOptimizer {
  private static gasHistory: Record<string, GasPrice[]> = {};
  
  private static mockGasPrices: Record<string, GasPrice> = {
    ethereum: { slow: 15, standard: 20, fast: 30, instant: 45 },
    bsc: { slow: 3, standard: 5, fast: 8, instant: 12 },
    polygon: { slow: 1, standard: 2, fast: 4, instant: 8 },
    avalanche: { slow: 25, standard: 30, fast: 40, instant: 60 },
    fantom: { slow: 1, standard: 2, fast: 3, instant: 5 },
    arbitrum: { slow: 0.1, standard: 0.2, fast: 0.3, instant: 0.5 },
    optimism: { slow: 0.1, standard: 0.2, fast: 0.3, instant: 0.5 }
  };

  static getCurrentGasPrice(chainId: string): GasPrice {
    // Add some variability to simulate real conditions
    const base = this.mockGasPrices[chainId] || this.mockGasPrices.ethereum;
    const variance = 0.8 + Math.random() * 0.4; // ±20% variance
    
    return {
      slow: base.slow * variance,
      standard: base.standard * variance,
      fast: base.fast * variance,
      instant: base.instant * variance
    };
  }

  static getOptimalGasPrice(
    chainId: string, 
    urgency: 'low' | 'medium' | 'high', 
    maxWaitTime: number = 60000
  ): GasOptimization {
    const currentPrices = this.getCurrentGasPrice(chainId);
    const congestion = this.estimateNetworkCongestion(chainId);
    
    let recommendedGasPrice: number;
    let estimatedConfirmationTime: number;
    
    switch (urgency) {
      case 'low':
        recommendedGasPrice = currentPrices.slow;
        estimatedConfirmationTime = 180000; // 3 minutes
        break;
      case 'medium':
        recommendedGasPrice = currentPrices.standard;
        estimatedConfirmationTime = 60000; // 1 minute
        break;
      case 'high':
        recommendedGasPrice = currentPrices.fast;
        estimatedConfirmationTime = 30000; // 30 seconds
        break;
    }

    // Adjust for network congestion
    if (congestion === 'high') {
      recommendedGasPrice *= 1.2;
      estimatedConfirmationTime *= 1.5;
    } else if (congestion === 'low') {
      recommendedGasPrice *= 0.8;
      estimatedConfirmationTime *= 0.7;
    }

    const potentialSavings = currentPrices.instant - recommendedGasPrice;

    return {
      recommendedGasPrice,
      estimatedConfirmationTime,
      potentialSavings,
      networkCongestion: congestion
    };
  }

  private static estimateNetworkCongestion(chainId: string): 'low' | 'medium' | 'high' {
    // Simulate network congestion based on time and randomness
    const hour = new Date().getHours();
    const isPeakTime = (hour >= 8 && hour <= 10) || (hour >= 14 && hour <= 16) || (hour >= 20 && hour <= 22);
    const randomFactor = Math.random();
    
    if (isPeakTime && randomFactor > 0.6) return 'high';
    if (randomFactor > 0.8) return 'high';
    if (randomFactor < 0.3) return 'low';
    return 'medium';
  }

  static estimateTransactionCost(
    chainId: string, 
    gasLimit: number = 200000,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): number {
    const gasOptimization = this.getOptimalGasPrice(chainId, urgency);
    return gasLimit * gasOptimization.recommendedGasPrice / 1e9; // Convert to ETH/native token
  }

  static getBatchGasSavings(transactionCount: number): number {
    // Estimate gas savings from batching transactions
    if (transactionCount <= 1) return 0;
    
    const baseGasPerTx = 21000;
    const batchOverhead = 50000;
    const regularGas = transactionCount * baseGasPerTx;
    const batchGas = batchOverhead + (transactionCount * baseGasPerTx * 0.7);
    
    return Math.max(0, regularGas - batchGas);
  }
}
