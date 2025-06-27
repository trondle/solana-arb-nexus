
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
  actualAmount: number;
  priority: number;
}

export class EnhancedFlashLoanOptimizer {
  static async findAllOpportunities(): Promise<EnhancedArbitrageOpportunity[]> {
    const opportunities: EnhancedArbitrageOpportunity[] = [];

    try {
      console.log('🔍 Scanning for live arbitrage opportunities...');

      // 1. Bridge arbitrage opportunities (LIVE DATA ONLY)
      try {
        const bridgeOpps = BridgeArbitrageScanner.scanBridgeArbitrage();
        console.log(`📡 Found ${bridgeOpps.length} live bridge opportunities`);
        
        bridgeOpps.forEach(opp => {
          const executionPlan = PrivateExecutionService.getExecutionPlan(opp);
          const requiredCapital = Math.max(1000, opp.estimatedProfit * 50); // Dynamic capital based on profit
          
          opportunities.push({
            id: opp.id,
            type: 'bridge',
            estimatedProfit: opp.estimatedProfit,
            netProfit: executionPlan.profitAfterExecution,
            executionPlan,
            feeOptimization: this.optimizeFees(opp),
            confidence: opp.confidence,
            risk: 'low',
            data: opp,
            actualAmount: requiredCapital,
            priority: this.calculatePriority({
              estimatedProfit: opp.estimatedProfit,
              netProfit: executionPlan.profitAfterExecution,
              confidence: opp.confidence,
              risk: 'low',
              executionPlan
            } as any)
          });
        });
      } catch (error) {
        console.error('Error fetching bridge opportunities:', error);
      }

      // 2. Multi-hop arbitrage (LIVE DATA ONLY)
      try {
        const multiHopOpps = MultiHopArbitrage.findMultiHopOpportunities(4);
        console.log(`🔗 Found ${multiHopOpps.length} live multi-hop opportunities`);
        
        multiHopOpps.forEach(opp => {
          const executionPlan = PrivateExecutionService.getExecutionPlan(opp);
          const requiredCapital = Math.max(2000, opp.estimatedProfit * 40);
          
          opportunities.push({
            id: opp.id,
            type: 'multihop',
            estimatedProfit: opp.estimatedProfit,
            netProfit: executionPlan.profitAfterExecution,
            executionPlan,
            feeOptimization: this.optimizeFees(opp),
            confidence: opp.confidence,
            risk: 'medium',
            data: opp,
            actualAmount: requiredCapital,
            priority: this.calculatePriority({
              estimatedProfit: opp.estimatedProfit,
              netProfit: executionPlan.profitAfterExecution,
              confidence: opp.confidence,
              risk: 'medium',
              executionPlan
            } as any)
          });
        });
      } catch (error) {
        console.error('Error fetching multi-hop opportunities:', error);
      }

      // 3. Triangle arbitrage (LIVE DATA ONLY)
      try {
        const triangleOpps = TriangleArbitrage.findTriangleOpportunities();
        console.log(`📐 Found ${triangleOpps.length} live triangle opportunities`);
        
        triangleOpps.forEach(opp => {
          const executionPlan = PrivateExecutionService.getExecutionPlan(opp);
          const requiredCapital = Math.max(1500, opp.profit * 60);
          
          opportunities.push({
            id: opp.id,
            type: 'triangle',
            estimatedProfit: opp.profit,
            netProfit: executionPlan.profitAfterExecution,
            executionPlan,
            feeOptimization: this.optimizeFees(opp),
            confidence: opp.confidence,
            risk: 'low',
            data: opp,
            actualAmount: requiredCapital,
            priority: this.calculatePriority({
              estimatedProfit: opp.profit,
              netProfit: executionPlan.profitAfterExecution,
              confidence: opp.confidence,
              risk: 'low',
              executionPlan
            } as any)
          });
        });
      } catch (error) {
        console.error('Error fetching triangle opportunities:', error);
      }

      // 4. Yield farming arbitrage (LIVE DATA ONLY)
      try {
        const yieldOpps = YieldFarmingArbitrage.findYieldArbitrageOpportunities();
        console.log(`🌾 Found ${yieldOpps.length} live yield opportunities`);
        
        yieldOpps.slice(0, 5).forEach(opp => {
          // Convert APY to realistic daily profit estimate
          const baseAmount = 5000; // Base amount for yield calculation
          const dailyProfit = (baseAmount * opp.combinedYield / 100) / 365;
          const executionPlan = PrivateExecutionService.getExecutionPlan({ netProfit: dailyProfit });
          
          opportunities.push({
            id: opp.id,
            type: 'yield',
            estimatedProfit: dailyProfit,
            netProfit: dailyProfit - 2, // Execution costs
            executionPlan,
            feeOptimization: this.optimizeFees(opp),
            confidence: 85, // Conservative confidence for yield strategies
            risk: opp.risk,
            data: opp,
            actualAmount: baseAmount,
            priority: this.calculatePriority({
              estimatedProfit: dailyProfit,
              netProfit: dailyProfit - 2,
              confidence: 85,
              risk: opp.risk,
              executionPlan
            } as any)
          });
        });
      } catch (error) {
        console.error('Error fetching yield opportunities:', error);
      }

      console.log(`✅ Total live opportunities found: ${opportunities.length}`);

    } catch (error) {
      console.error('Error finding enhanced opportunities:', error);
    }

    // Sort by priority and return top opportunities
    const sortedOpps = opportunities
      .filter(opp => opp.netProfit > 0) // Only profitable opportunities
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 25); // Top 25 opportunities

    console.log(`🎯 Returning ${sortedOpps.length} profitable opportunities`);
    return sortedOpps;
  }

  private static optimizeFees(opportunity: any) {
    // Use dynamic fee optimizer for real flash loans
    const mockProvider = { fee: 0.09, name: 'OptimalFlashLoan' };
    const feeNegotiation = DynamicFeeOptimizer.negotiateFlashLoanFee(mockProvider, opportunity.actualAmount || 1000);
    
    return {
      originalFees: mockProvider.fee * 100,
      optimizedFees: feeNegotiation.negotiatedFee * 100,
      savings: feeNegotiation.discount,
      reason: feeNegotiation.reason
    };
  }

  private static calculatePriority(opportunity: EnhancedArbitrageOpportunity): number {
    // Enhanced priority scoring based on real market conditions
    const profitScore = Math.min(opportunity.netProfit / 50, 1) * 40; // Profit contribution (max 40)
    const confidenceScore = (opportunity.confidence / 100) * 25; // Confidence contribution (max 25)
    const speedScore = opportunity.executionPlan?.estimatedExecutionTime ? 
      (1 - Math.min(opportunity.executionPlan.estimatedExecutionTime / 10000, 1)) * 20 : 15; // Speed contribution (max 20)
    
    // Risk scoring (lower risk = higher score)
    const riskScore = opportunity.risk === 'low' ? 15 : 
                     opportunity.risk === 'medium' ? 10 : 5; // Risk contribution (max 15)
    
    const totalScore = profitScore + confidenceScore + speedScore + riskScore;
    
    console.log(`📊 Priority calculated for ${opportunity.id}: ${totalScore.toFixed(1)} (Profit: ${profitScore.toFixed(1)}, Confidence: ${confidenceScore.toFixed(1)}, Speed: ${speedScore.toFixed(1)}, Risk: ${riskScore})`);
    
    return totalScore;
  }

  static getExecutionAdvantages() {
    // Calculate real-time execution advantages
    const currentTimestamp = Date.now();
    const advantages = PrivateExecutionService.calculateExecutionAdvantage();
    
    console.log('🛡️ Live execution advantages calculated:', advantages);
    return {
      ...advantages,
      lastCalculated: currentTimestamp,
      isLive: true
    };
  }

  static updateTradingHistory(volume: number, success: boolean, profit: number) {
    console.log(`📈 Updating live trading history: Volume: $${volume}, Success: ${success}, Profit: $${profit}`);
    DynamicFeeOptimizer.updateTradingHistory(volume, success, profit);
  }

  static getTradingStats() {
    const stats = DynamicFeeOptimizer.getTradingHistory();
    console.log('📊 Live trading stats retrieved:', stats);
    return {
      ...stats,
      isLive: true,
      lastUpdated: Date.now()
    };
  }

  // Health check for live data sources
  static async healthCheck(): Promise<{
    bridgeScanner: boolean;
    multiHopService: boolean;
    triangleService: boolean;
    yieldService: boolean;
    privateExecution: boolean;
    overallHealth: boolean;
  }> {
    const health = {
      bridgeScanner: false,
      multiHopService: false,
      triangleService: false,
      yieldService: false,
      privateExecution: false,
      overallHealth: false
    };

    try {
      // Test each service
      const bridgeTest = BridgeArbitrageScanner.scanBridgeArbitrage();
      health.bridgeScanner = Array.isArray(bridgeTest);

      const multiHopTest = MultiHopArbitrage.findMultiHopOpportunities(1);
      health.multiHopService = Array.isArray(multiHopTest);

      const triangleTest = TriangleArbitrage.findTriangleOpportunities();
      health.triangleService = Array.isArray(triangleTest);

      const yieldTest = YieldFarmingArbitrage.findYieldArbitrageOpportunities();
      health.yieldService = Array.isArray(yieldTest);

      const executionTest = PrivateExecutionService.calculateExecutionAdvantage();
      health.privateExecution = typeof executionTest === 'object';

      // Overall health check
      const healthyServices = Object.values(health).filter(status => status).length;
      health.overallHealth = healthyServices >= 4; // At least 4 out of 5 services working

      console.log('🏥 Live services health check:', health);
      
    } catch (error) {
      console.error('Health check failed:', error);
    }

    return health;
  }
}
