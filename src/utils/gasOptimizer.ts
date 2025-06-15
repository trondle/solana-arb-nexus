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
  optimalExecutionTime?: Date;
  gasTrend: 'rising' | 'falling' | 'stable';
}

export class GasOptimizer {
  private static gasHistory: Record<string, GasPrice[]> = {};
  private static listeners = new Set<(data: any) => void>();
  
  private static mockGasPrices: Record<string, GasPrice> = {
    ethereum: { slow: 15, standard: 20, fast: 30, instant: 45 },
    bsc: { slow: 3, standard: 5, fast: 8, instant: 12 },
    polygon: { slow: 1, standard: 2, fast: 4, instant: 8 },
    avalanche: { slow: 25, standard: 30, fast: 40, instant: 60 },
    fantom: { slow: 1, standard: 2, fast: 3, instant: 5 },
    arbitrum: { slow: 0.1, standard: 0.2, fast: 0.3, instant: 0.5 },
    optimism: { slow: 0.1, standard: 0.2, fast: 0.3, instant: 0.5 },
    base: { slow: 0.05, standard: 0.1, fast: 0.15, instant: 0.25 }
  };

  static getCurrentGasPrice(chainId: string): GasPrice {
    // Simulate real-time gas price fluctuations
    const base = this.mockGasPrices[chainId] || this.mockGasPrices.ethereum;
    const timeOfDay = new Date().getHours();
    
    // Higher gas during peak hours (8-10 AM, 2-4 PM, 8-10 PM UTC)
    const peakMultiplier = (timeOfDay >= 8 && timeOfDay <= 10) || 
                          (timeOfDay >= 14 && timeOfDay <= 16) || 
                          (timeOfDay >= 20 && timeOfDay <= 22) ? 1.3 : 1.0;
    
    // Add random variance and network congestion simulation
    const variance = 0.7 + Math.random() * 0.6; // ±30% variance
    const congestionMultiplier = this.getNetworkCongestionMultiplier(chainId);
    
    const multiplier = variance * peakMultiplier * congestionMultiplier;
    
    const currentPrice = {
      slow: base.slow * multiplier,
      standard: base.standard * multiplier,
      fast: base.fast * multiplier,
      instant: base.instant * multiplier
    };

    // Store in history for trend analysis
    this.updateGasHistory(chainId, currentPrice);
    
    return currentPrice;
  }

  static getOptimalGasPrice(
    chainId: string, 
    urgency: 'low' | 'medium' | 'high', 
    maxWaitTime: number = 60000
  ): GasOptimization {
    const currentPrices = this.getCurrentGasPrice(chainId);
    const congestion = this.estimateNetworkCongestion(chainId);
    const trend = this.analyzeGasTrend(chainId);
    
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

    // Optimize based on gas trend
    if (trend === 'rising' && urgency === 'low') {
      // If gas is rising and we're not urgent, wait for better prices
      recommendedGasPrice = currentPrices.slow;
      estimatedConfirmationTime = 300000; // 5 minutes
    } else if (trend === 'falling' && urgency === 'high') {
      // If gas is falling but we're urgent, use slightly lower than instant
      recommendedGasPrice = currentPrices.fast;
    }

    const potentialSavings = currentPrices.instant - recommendedGasPrice;
    
    // Calculate optimal execution time
    const optimalExecutionTime = this.calculateOptimalExecutionTime(chainId, urgency);

    return {
      recommendedGasPrice,
      estimatedConfirmationTime,
      potentialSavings,
      networkCongestion: congestion,
      optimalExecutionTime,
      gasTrend: trend
    };
  }

  private static getNetworkCongestionMultiplier(chainId: string): number {
    // Simulate network-specific congestion patterns
    const congestionPatterns: Record<string, number> = {
      ethereum: 1.0 + Math.sin(Date.now() / 300000) * 0.3, // 5-minute cycles
      bsc: 1.0 + Math.sin(Date.now() / 120000) * 0.2, // 2-minute cycles
      polygon: 1.0 + Math.sin(Date.now() / 180000) * 0.15, // 3-minute cycles
      arbitrum: 1.0 + Math.sin(Date.now() / 600000) * 0.1, // 10-minute cycles
      optimism: 1.0 + Math.sin(Date.now() / 480000) * 0.1, // 8-minute cycles
      base: 1.0 + Math.sin(Date.now() / 240000) * 0.12 // 4-minute cycles
    };
    
    return Math.max(0.5, congestionPatterns[chainId] || 1.0);
  }

  private static estimateNetworkCongestion(chainId: string): 'low' | 'medium' | 'high' {
    const currentPrice = this.getCurrentGasPrice(chainId);
    const basePrice = this.mockGasPrices[chainId] || this.mockGasPrices.ethereum;
    
    const multiplier = currentPrice.standard / basePrice.standard;
    
    if (multiplier > 1.3) return 'high';
    if (multiplier > 1.1) return 'medium';
    return 'low';
  }

  private static updateGasHistory(chainId: string, gasPrice: GasPrice): void {
    if (!this.gasHistory[chainId]) {
      this.gasHistory[chainId] = [];
    }
    
    this.gasHistory[chainId].push(gasPrice);
    
    // Keep only last 20 readings for trend analysis
    if (this.gasHistory[chainId].length > 20) {
      this.gasHistory[chainId] = this.gasHistory[chainId].slice(-20);
    }
    
    // Notify listeners of gas price updates
    this.notifyListeners({ chainId, gasPrice, trend: this.analyzeGasTrend(chainId) });
  }

  private static analyzeGasTrend(chainId: string): 'rising' | 'falling' | 'stable' {
    const history = this.gasHistory[chainId];
    if (!history || history.length < 5) return 'stable';
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, p) => sum + p.standard, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.standard, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.05) return 'rising';
    if (change < -0.05) return 'falling';
    return 'stable';
  }

  private static calculateOptimalExecutionTime(chainId: string, urgency: string): Date {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Identify low-gas periods (typically late night/early morning)
    const lowGasPeriods = [2, 3, 4, 5, 6]; // 2 AM - 6 AM UTC
    
    if (urgency === 'low' && !lowGasPeriods.includes(currentHour)) {
      // Suggest waiting until next low-gas period
      const nextLowGasPeriod = lowGasPeriods.find(hour => hour > currentHour) || lowGasPeriods[0];
      const targetTime = new Date(now);
      
      if (nextLowGasPeriod > currentHour) {
        targetTime.setHours(nextLowGasPeriod, 0, 0, 0);
      } else {
        targetTime.setDate(targetTime.getDate() + 1);
        targetTime.setHours(nextLowGasPeriod, 0, 0, 0);
      }
      
      return targetTime;
    }
    
    // For urgent transactions, execute immediately
    return now;
  }

  static estimateTransactionCost(
    chainId: string, 
    gasLimit: number = 200000,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): { cost: number; optimization: GasOptimization } {
    const gasOptimization = this.getOptimalGasPrice(chainId, urgency);
    const cost = gasLimit * gasOptimization.recommendedGasPrice / 1e9; // Convert to ETH/native token
    
    return { cost, optimization: gasOptimization };
  }

  static getBatchGasSavings(transactionCount: number, chainId: string = 'ethereum'): number {
    if (transactionCount <= 1) return 0;
    
    const baseGasPerTx = 21000;
    const batchOverhead = chainId === 'ethereum' ? 50000 : 30000; // Lower overhead on L2s
    const regularGas = transactionCount * baseGasPerTx;
    const batchGas = batchOverhead + (transactionCount * baseGasPerTx * 0.7);
    
    return Math.max(0, regularGas - batchGas);
  }

  static subscribe(callback: (data: any) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notifyListeners(data: any): void {
    this.listeners.forEach(callback => callback(data));
  }

  // Start real-time gas monitoring
  static startGasMonitoring(): void {
    const chains = Object.keys(this.mockGasPrices);
    
    setInterval(() => {
      chains.forEach(chainId => {
        this.getCurrentGasPrice(chainId); // This updates history and notifies listeners
      });
    }, 10000); // Update every 10 seconds
  }

  // Get gas price predictions
  static getGasPricePrediction(chainId: string, hoursAhead: number = 1): GasPrice {
    const currentPrice = this.getCurrentGasPrice(chainId);
    const trend = this.analyzeGasTrend(chainId);
    
    let multiplier = 1;
    
    if (trend === 'rising') {
      multiplier = 1 + (hoursAhead * 0.1); // 10% increase per hour
    } else if (trend === 'falling') {
      multiplier = 1 - (hoursAhead * 0.08); // 8% decrease per hour
    }
    
    return {
      slow: currentPrice.slow * multiplier,
      standard: currentPrice.standard * multiplier,
      fast: currentPrice.fast * multiplier,
      instant: currentPrice.instant * multiplier
    };
  }
}
