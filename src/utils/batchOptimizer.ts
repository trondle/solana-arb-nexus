
export interface BatchOpportunity {
  id: string;
  pair: string;
  netProfit: number;
  requiredCapital: number;
  provider: string;
  gasEstimate: number;
  executionTime: number;
}

export interface BatchGroup {
  id: string;
  opportunities: BatchOpportunity[];
  totalProfit: number;
  totalCapital: number;
  estimatedGasSavings: number;
  providerOptimization: boolean;
  executionOrder: number[];
}

export class BatchOptimizer {
  static createOptimalBatches(
    opportunities: BatchOpportunity[],
    maxBatchSize: number = 5,
    maxCapitalPerBatch: number = 500000
  ): BatchGroup[] {
    if (opportunities.length === 0) return [];
    
    // Sort by profitability first
    const sortedOpps = opportunities.sort((a, b) => b.netProfit - a.netProfit);
    const batches: BatchGroup[] = [];
    
    while (sortedOpps.length > 0) {
      const batch = this.createSingleBatch(sortedOpps, maxBatchSize, maxCapitalPerBatch);
      if (batch.opportunities.length > 0) {
        batches.push(batch);
        // Remove batched opportunities
        batch.opportunities.forEach(opp => {
          const index = sortedOpps.findIndex(o => o.id === opp.id);
          if (index > -1) sortedOpps.splice(index, 1);
        });
      } else {
        break; // No more batchable opportunities
      }
    }
    
    return batches;
  }

  private static createSingleBatch(
    opportunities: BatchOpportunity[],
    maxBatchSize: number,
    maxCapitalPerBatch: number
  ): BatchGroup {
    const batchOpps: BatchOpportunity[] = [];
    let totalCapital = 0;
    let totalProfit = 0;
    
    // Try to group by same provider first for better optimization
    const providerGroups = this.groupByProvider(opportunities);
    
    for (const [provider, opps] of Object.entries(providerGroups)) {
      if (batchOpps.length >= maxBatchSize) break;
      
      for (const opp of opps) {
        if (batchOpps.length >= maxBatchSize) break;
        if (totalCapital + opp.requiredCapital > maxCapitalPerBatch) continue;
        
        batchOpps.push(opp);
        totalCapital += opp.requiredCapital;
        totalProfit += opp.netProfit;
      }
      
      if (batchOpps.length > 0) break; // Use first viable provider group
    }
    
    // If no same-provider batch possible, create mixed batch
    if (batchOpps.length === 0) {
      for (const opp of opportunities) {
        if (batchOpps.length >= maxBatchSize) break;
        if (totalCapital + opp.requiredCapital > maxCapitalPerBatch) continue;
        
        batchOpps.push(opp);
        totalCapital += opp.requiredCapital;
        totalProfit += opp.netProfit;
      }
    }
    
    const estimatedGasSavings = this.calculateGasSavings(batchOpps);
    const providerOptimization = this.hasProviderOptimization(batchOpps);
    const executionOrder = this.optimizeExecutionOrder(batchOpps);
    
    return {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      opportunities: batchOpps,
      totalProfit: totalProfit + estimatedGasSavings,
      totalCapital,
      estimatedGasSavings,
      providerOptimization,
      executionOrder
    };
  }

  private static groupByProvider(opportunities: BatchOpportunity[]): Record<string, BatchOpportunity[]> {
    return opportunities.reduce((groups, opp) => {
      if (!groups[opp.provider]) {
        groups[opp.provider] = [];
      }
      groups[opp.provider].push(opp);
      return groups;
    }, {} as Record<string, BatchOpportunity[]>);
  }

  private static calculateGasSavings(opportunities: BatchOpportunity[]): number {
    if (opportunities.length <= 1) return 0;
    
    const individualGas = opportunities.reduce((sum, opp) => sum + opp.gasEstimate, 0);
    const batchOverhead = 50000; // Base batch transaction cost
    const batchGas = batchOverhead + (individualGas * 0.7); // 30% gas savings per operation
    
    return Math.max(0, (individualGas - batchGas) * 0.00002); // Convert to USD (assuming $20 gas)
  }

  private static hasProviderOptimization(opportunities: BatchOpportunity[]): boolean {
    const providers = new Set(opportunities.map(opp => opp.provider));
    return providers.size === 1; // All use same provider
  }

  private static optimizeExecutionOrder(opportunities: BatchOpportunity[]): number[] {
    // Sort by execution time (fastest first) and profitability
    const indexed = opportunities.map((opp, index) => ({ ...opp, originalIndex: index }));
    
    indexed.sort((a, b) => {
      const timeScore = a.executionTime - b.executionTime;
      const profitScore = (b.netProfit - a.netProfit) * 0.1;
      return timeScore + profitScore;
    });
    
    return indexed.map(item => item.originalIndex);
  }

  static estimateBatchEfficiency(batch: BatchGroup): {
    gasSavingsPercent: number;
    timeEfficiency: number;
    capitalEfficiency: number;
    overallScore: number;
  } {
    const gasSavingsPercent = batch.opportunities.length > 1 ? 
      (batch.estimatedGasSavings / batch.totalCapital) * 100 : 0;
    
    const averageExecutionTime = batch.opportunities.reduce((sum, opp) => sum + opp.executionTime, 0) / batch.opportunities.length;
    const timeEfficiency = Math.max(0, 100 - (averageExecutionTime / 1000)); // Better score for faster execution
    
    const capitalEfficiency = (batch.totalProfit / batch.totalCapital) * 100;
    
    const overallScore = (gasSavingsPercent * 0.3) + (timeEfficiency * 0.3) + (capitalEfficiency * 0.4);
    
    return {
      gasSavingsPercent,
      timeEfficiency,
      capitalEfficiency,
      overallScore
    };
  }

  static getRecommendedBatchSize(opportunities: BatchOpportunity[]): number {
    if (opportunities.length <= 2) return opportunities.length;
    if (opportunities.length <= 5) return Math.min(3, opportunities.length);
    
    // For larger sets, optimize based on capital and gas efficiency
    const avgCapital = opportunities.reduce((sum, opp) => sum + opp.requiredCapital, 0) / opportunities.length;
    
    if (avgCapital < 50000) return 5; // Small trades can be batched more
    if (avgCapital < 100000) return 4;
    return 3; // Larger trades need smaller batches
  }
}
