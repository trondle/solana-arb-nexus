
import { DynamicFeeOptimizer } from './dynamicFeeOptimizer';
import { BridgeArbitrageScanner } from '../services/bridgeArbitrageScanner';
import { MultiHopArbitrage } from '../services/multiHopArbitrage';
import { TriangleArbitrage } from '../services/triangleArbitrage';
import { YieldFarmingArbitrage } from '../services/yieldFarmingArbitrage';
import { PrivateExecutionService } from '../services/privateExecution';

export interface EnhancedArbitrageOpportunity {
  id: string;
  type: 'regular' | 'bridge' | 'multihop' | 'triangle' | 'yield';
  estimatedProfit: number;
  netProfit: number;
  executionPlan: any;
  feeOptimization: any;
  confidence: number;
  risk: string;
  data: any;
}

export class EnhancedFlashLoanOptimizer {
  static async findAllOpportunities(): Promise<EnhancedArbitrageOpportunity[]> {
    const opportunities: EnhancedArbitrageOpportunity[] = [];

    try {
      // 1. Bridge arbitrage opportunities
      const bridgeOpps = BridgeArbitrageScanner.scanBridgeArbitrage();
      bridgeOpps.forEach(opp => {
        const executionPlan = PrivateExecutionService.getExecutionPlan(opp);
        opportunities.push({
          id: opp.id,
          type: 'bridge',
          estimatedProfit: opp.estimatedProfit,
          netProfit: executionPlan.profitAfterExecution,
          executionPlan,
          feeOptimization: this.optimizeFees(opp),
          confidence: opp.confidence,
          risk: 'low',
          data: opp
        });
      });

      // 2. Multi-hop arbitrage
      const multiHopOpps = MultiHopArbitrage.findMultiHopOpportunities(4);
      multiHopOpps.forEach(opp => {
        const executionPlan = PrivateExecutionService.getExecutionPlan(opp);
        opportunities.push({
          id: opp.id,
          type: 'multihop',
          estimatedProfit: opp.estimatedProfit,
          netProfit: executionPlan.profitAfterExecution,
          executionPlan,
          feeOptimization: this.optimizeFees(opp),
          confidence: opp.confidence,
          risk: 'medium',
          data: opp
        });
      });

      // 3. Triangle arbitrage
      const triangleOpps = TriangleArbitrage.findTriangleOpportunities();
      triangleOpps.forEach(opp => {
        const executionPlan = PrivateExecutionService.getExecutionPlan(opp);
        opportunities.push({
          id: opp.id,
          type: 'triangle',
          estimatedProfit: opp.profit,
          netProfit: executionPlan.profitAfterExecution,
          executionPlan,
          feeOptimization: this.optimizeFees(opp),
          confidence: opp.confidence,
          risk: 'low',
          data: opp
        });
      });

      // 4. Yield farming arbitrage
      const yieldOpps = YieldFarmingArbitrage.findYieldArbitrageOpportunities();
      yieldOpps.slice(0, 5).forEach(opp => {
        // Convert APY to daily profit estimate
        const dailyProfit = (10000 * opp.combinedYield / 100) / 365;
        const executionPlan = PrivateExecutionService.getExecutionPlan({ netProfit: dailyProfit });
        
        opportunities.push({
          id: opp.id,
          type: 'yield',
          estimatedProfit: dailyProfit,
          netProfit: dailyProfit - 0.5, // Small execution cost
          executionPlan,
          feeOptimization: this.optimizeFees(opp),
          confidence: 90,
          risk: opp.risk,
          data: opp
        });
      });

    } catch (error) {
      console.error('Error finding enhanced opportunities:', error);
    }

    // Sort by net profit and return top opportunities
    return opportunities
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 25) // Top 25 opportunities
      .map(opp => ({
        ...opp,
        // Add execution priority
        priority: this.calculatePriority(opp)
      })) as any;
  }

  private static optimizeFees(opportunity: any) {
    // Use dynamic fee optimizer for flash loans
    const mockProvider = { fee: 0.09, name: 'MockProvider' };
    const feeNegotiation = DynamicFeeOptimizer.negotiateFlashLoanFee(mockProvider, 10000);
    
    return {
      originalFees: mockProvider.fee * 100,
      optimizedFees: feeNegotiation.negotiatedFee * 100,
      savings: feeNegotiation.discount,
      reason: feeNegotiation.reason
    };
  }

  private static calculatePriority(opportunity: EnhancedArbitrageOpportunity): number {
    // Priority scoring: profit (40%) + confidence (30%) + execution speed (20%) + risk (10%)
    const profitScore = Math.min(opportunity.netProfit / 100, 1) * 40;
    const confidenceScore = (opportunity.confidence / 100) * 30;
    const speedScore = opportunity.executionPlan?.estimatedExecutionTime ? 
      (1 - Math.min(opportunity.executionPlan.estimatedExecutionTime / 10000, 1)) * 20 : 10;
    const riskScore = opportunity.risk === 'low' ? 10 : opportunity.risk === 'medium' ? 7 : 4;
    
    return profitScore + confidenceScore + speedScore + riskScore;
  }

  static getExecutionAdvantages() {
    return PrivateExecutionService.calculateExecutionAdvantage();
  }

  static updateTradingHistory(volume: number, success: boolean, profit: number) {
    DynamicFeeOptimizer.updateTradingHistory(volume, success, profit);
  }

  static getTradingStats() {
    return DynamicFeeOptimizer.getTradingHistory();
  }
}
