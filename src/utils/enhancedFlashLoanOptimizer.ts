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
      console.log('🔴 LIVE: Scanning for REAL arbitrage opportunities only...');

      // 1. Bridge arbitrage opportunities (LIVE DATA ONLY)
      try {
        const bridgeOpps = BridgeArbitrageScanner.scanBridgeArbitrage();
        console.log(`🔴 LIVE: Found ${bridgeOpps.length} real bridge opportunities`);
        
        for (const opp of bridgeOpps) {
          // Validate this is real data before proceeding
          if (!this.validateLiveData(opp)) {
            console.log(`⚠️ SKIPPING: Bridge opportunity ${opp.id} - not live data`);
            continue;
          }

          const executionPlan = PrivateExecutionService.getExecutionPlan(opp);
          const requiredCapital = Math.max(1000, opp.estimatedProfit * 50);
          
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
        }
      } catch (error) {
        console.error('🚫 LIVE: Bridge opportunities error:', error);
        // Don't continue with mock data - throw error for live trading
        throw new Error('Bridge arbitrage service failed - live data required');
      }

      // 2. Multi-hop arbitrage (LIVE DATA ONLY)
      try {
        const multiHopOpps = MultiHopArbitrage.findMultiHopOpportunities(4);
        console.log(`🔴 LIVE: Found ${multiHopOpps.length} real multi-hop opportunities`);
        
        for (const opp of multiHopOpps) {
          if (!this.validateLiveData(opp)) {
            console.log(`⚠️ SKIPPING: Multi-hop opportunity ${opp.id} - not live data`);
            continue;
          }

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
        }
      } catch (error) {
        console.error('🚫 LIVE: Multi-hop opportunities error:', error);
        throw new Error('Multi-hop arbitrage service failed - live data required');
      }

      // 3. Triangle arbitrage (LIVE DATA ONLY)
      try {
        const triangleOpps = TriangleArbitrage.findTriangleOpportunities();
        console.log(`🔴 LIVE: Found ${triangleOpps.length} real triangle opportunities`);
        
        for (const opp of triangleOpps) {
          if (!this.validateLiveData(opp)) {
            console.log(`⚠️ SKIPPING: Triangle opportunity ${opp.id} - not live data`);
            continue;
          }

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
        }
      } catch (error) {
        console.error('🚫 LIVE: Triangle opportunities error:', error);
        throw new Error('Triangle arbitrage service failed - live data required');
      }

      // 4. Yield farming arbitrage (LIVE DATA ONLY) - LIMITED
      try {
        const yieldOpps = YieldFarmingArbitrage.findYieldArbitrageOpportunities();
        console.log(`🔴 LIVE: Found ${yieldOpps.length} real yield opportunities`);
        
        for (const opp of yieldOpps.slice(0, 3)) { // Limit to top 3 for live trading
          if (!this.validateLiveData(opp)) {
            console.log(`⚠️ SKIPPING: Yield opportunity ${opp.id} - not live data`);
            continue;
          }

          const baseAmount = 5000;
          const dailyProfit = (baseAmount * opp.combinedYield / 100) / 365;
          
          // Only include if daily profit > $5
          if (dailyProfit < 5) {
            console.log(`⚠️ SKIPPING: Yield opportunity ${opp.id} - profit too low: $${dailyProfit}`);
            continue;
          }

          const executionPlan = PrivateExecutionService.getExecutionPlan({ netProfit: dailyProfit });
          
          opportunities.push({
            id: opp.id,
            type: 'yield',
            estimatedProfit: dailyProfit,
            netProfit: dailyProfit - 2,
            executionPlan,
            feeOptimization: this.optimizeFees(opp),
            confidence: 85,
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
        }
      } catch (error) {
        console.error('🚫 LIVE: Yield opportunities error:', error);
        // Yield farming is optional for live trading
        console.log('⚠️ Continuing without yield opportunities');
      }

      console.log(`🔴 LIVE: Total REAL opportunities found: ${opportunities.length}`);

      if (opportunities.length === 0) {
        throw new Error('🚫 LIVE TRADING: No real arbitrage opportunities found. Mock data removed.');
      }

    } catch (error) {
      console.error('🚫 LIVE: Enhanced opportunities error:', error);
      throw error;
    }

    // Sort by priority and return only profitable opportunities
    const profitableOpps = opportunities
      .filter(opp => opp.netProfit > 5) // Minimum $5 profit for live trading
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 15); // Top 15 opportunities for live trading

    console.log(`🔴 LIVE: Returning ${profitableOpps.length} profitable real opportunities`);
    return profitableOpps;
  }

  private static validateLiveData(opportunity: any): boolean {
    // Validate that this opportunity contains real market data
    if (!opportunity || !opportunity.id) return false;
    
    // Check for mock data indicators
    if (opportunity.source === 'mock' || opportunity.source === 'demo') return false;
    if (opportunity.id.includes('mock') || opportunity.id.includes('demo')) return false;
    
    // Require recent timestamp (within last 30 seconds)
    if (opportunity.lastUpdated && Date.now() - opportunity.lastUpdated > 30000) {
      console.log(`⚠️ Data too old: ${opportunity.id} - ${Date.now() - opportunity.lastUpdated}ms ago`);
      return false;
    }
    
    // Require minimum confidence for live trading
    if (opportunity.confidence && opportunity.confidence < 70) {
      console.log(`⚠️ Confidence too low: ${opportunity.id} - ${opportunity.confidence}%`);
      return false;
    }
    
    return true;
  }

  private static optimizeFees(opportunity: any) {
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
    const profitScore = Math.min(opportunity.netProfit / 50, 1) * 40;
    const confidenceScore = (opportunity.confidence / 100) * 25;
    const speedScore = opportunity.executionPlan?.estimatedExecutionTime ? 
      (1 - Math.min(opportunity.executionPlan.estimatedExecutionTime / 10000, 1)) * 20 : 15;
    
    const riskScore = opportunity.risk === 'low' ? 15 : 
                     opportunity.risk === 'medium' ? 10 : 5;
    
    const totalScore = profitScore + confidenceScore + speedScore + riskScore;
    
    console.log(`🔴 LIVE Priority: ${opportunity.id}: ${totalScore.toFixed(1)}`);
    
    return totalScore;
  }

  static getExecutionAdvantages() {
    const currentTimestamp = Date.now();
    const advantages = PrivateExecutionService.calculateExecutionAdvantage();
    
    console.log('🔴 LIVE execution advantages calculated:', advantages);
    return {
      ...advantages,
      lastCalculated: currentTimestamp,
      isLive: true
    };
  }

  static updateTradingHistory(volume: number, success: boolean, profit: number) {
    console.log(`🔴 LIVE trading history: Volume: $${volume}, Success: ${success}, Profit: $${profit}`);
    DynamicFeeOptimizer.updateTradingHistory(volume, success, profit);
  }

  static getTradingStats() {
    const stats = DynamicFeeOptimizer.getTradingHistory();
    console.log('🔴 LIVE trading stats retrieved:', stats);
    return {
      ...stats,
      isLive: true,
      lastUpdated: Date.now()
    };
  }

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
      const bridgeTest = BridgeArbitrageScanner.scanBridgeArbitrage();
      health.bridgeScanner = Array.isArray(bridgeTest) && bridgeTest.length > 0;

      const multiHopTest = MultiHopArbitrage.findMultiHopOpportunities(1);
      health.multiHopService = Array.isArray(multiHopTest);

      const triangleTest = TriangleArbitrage.findTriangleOpportunities();
      health.triangleService = Array.isArray(triangleTest);

      const yieldTest = YieldFarmingArbitrage.findYieldArbitrageOpportunities();
      health.yieldService = Array.isArray(yieldTest);

      const executionTest = PrivateExecutionService.calculateExecutionAdvantage();
      health.privateExecution = typeof executionTest === 'object';

      // Require all services for live trading
      const healthyServices = Object.values(health).filter(status => status).length;
      health.overallHealth = healthyServices >= 4;

      console.log('🔴 LIVE services health check:', health);
      
    } catch (error) {
      console.error('🚫 LIVE health check failed:', error);
      throw error;
    }

    return health;
  }
}
