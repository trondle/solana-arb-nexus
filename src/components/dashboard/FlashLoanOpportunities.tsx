import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, CreditCard, Target, TrendingDown } from 'lucide-react';
import { calculateOptimizedFees } from '../../utils/flashLoanOptimizer';

interface FlashLoanOpportunitiesProps {
  flashLoanMode: boolean;
  flashLoanOpportunities: any[];
  totalFlashLoanProfit: number;
  isExecuting: boolean;
  isTestMode: boolean;
  optimizationSettings: any;
  getDetailedFees: (opportunity: any) => any;
  executeFlashLoanArbitrage: (opportunity: any) => void;
}

const FlashLoanOpportunities = ({ 
  flashLoanMode, 
  flashLoanOpportunities, 
  totalFlashLoanProfit,
  isExecuting,
  isTestMode,
  optimizationSettings,
  getDetailedFees,
  executeFlashLoanArbitrage
}: FlashLoanOpportunitiesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          Flash Loan Cross-Chain (Zero Capital) - Advanced Optimization Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!flashLoanMode ? (
          <div className="text-center py-6 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>Flash loan mode disabled</div>
            <div className="text-sm">Enable flash loans to see zero-capital opportunities</div>
          </div>
        ) : flashLoanOpportunities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>No flash loan opportunities available</div>
            <div className="text-sm">Scanning for profitable cross-chain arbitrage...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Enhanced Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div>
                <div className="text-2xl font-bold text-blue-600">{flashLoanOpportunities.length}</div>
                <div className="text-sm text-muted-foreground">Optimized Routes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">${totalFlashLoanProfit.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Profit (Optimized)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {flashLoanOpportunities.reduce((sum, opp) => {
                    const fees = calculateOptimizedFees(opp, 250000); // Assume $250K user volume
                    return sum + fees.savings;
                  }, 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Fee Savings ($)</div>
              </div>
            </div>

            {/* Optimization Features Banner */}
            <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200">
              <div className="text-sm font-semibold text-green-800 mb-1">🚀 Advanced Optimization Active</div>
              <div className="text-xs text-green-700 grid grid-cols-2 gap-1">
                <span>✓ Multi-Provider Aggregation</span>
                <span>✓ Dynamic Bridge Selection</span>
                <span>✓ Gas Price Optimization</span>
                <span>✓ Volume-Based Discounts</span>
                <span>✓ DEX Route Optimization</span>
                <span>✓ Batch Execution Ready</span>
              </div>
            </div>
            
            {flashLoanOpportunities.slice(0, 3).map((opportunity) => {
              const optimizedFees = calculateOptimizedFees(opportunity, 250000); // User volume
              const optimizedProfit = opportunity.estimatedProfit - optimizedFees.total;
              
              return (
                <div key={opportunity.id} className="border rounded-lg p-3 bg-gradient-to-r from-white to-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{opportunity.pair}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600">
                        <Zap className="w-3 h-3 mr-1" />
                        Flash Loan
                      </Badge>
                      <Badge variant="secondary" className="text-green-600">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Ultra-Optimized
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {opportunity.fromChain} → {opportunity.toChain} via {opportunity.flashLoanProvider}
                  </div>
                  
                  {/* Enhanced Fee Breakdown with Optimization Details */}
                  <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-3 mb-3 border border-green-200">
                    <div className="text-xs font-semibold mb-2 text-green-800">💰 Optimized Fee Breakdown</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Flash Loan Fee (20% discount):</span>
                        <span className="font-semibold">${optimizedFees.flashLoan.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trading Fees (15% discount):</span>
                        <span className="font-semibold">${optimizedFees.trading.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bridge Fees (70% discount):</span>
                        <span className="font-semibold">${optimizedFees.bridge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gas Fees (67% discount):</span>
                        <span className="font-semibold">${optimizedFees.gas.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-semibold">
                        <span className="text-red-600">Total Optimized Fees:</span>
                        <span className="text-red-600">${optimizedFees.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-green-600">Total Savings:</span>
                        <span className="text-green-600">${optimizedFees.savings.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-muted-foreground">Spread: </span>
                      <span className="font-semibold text-green-600">{opportunity.spread.toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. Profit: </span>
                      <span className="font-semibold">${opportunity.estimatedProfit.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net Profit: </span>
                      <span className="font-semibold text-green-600">${optimizedProfit.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Bridge time: ~{(opportunity.executionTime / 1000).toFixed(1)}s • 
                      Risk: {opportunity.riskLevel} • 
                      Optimizations: 6/6 Active •
                      Fee reduction: {((optimizedFees.savings / (optimizedFees.total + optimizedFees.savings)) * 100).toFixed(0)}%
                    </div>
                    <Button 
                      onClick={() => executeFlashLoanArbitrage(opportunity)}
                      disabled={isExecuting || optimizedProfit <= 0}
                      size="sm"
                      className={`${isTestMode ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"} shadow-lg`}
                    >
                      {isTestMode ? 'Test Ultra-Optimized' : 'Execute Ultra-Optimized'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashLoanOpportunities;
