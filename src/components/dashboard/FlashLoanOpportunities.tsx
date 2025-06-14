
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, CreditCard, Target, TrendingDown } from 'lucide-react';

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
          Flash Loan Cross-Chain (Zero Capital) - Optimized
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
            <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="text-2xl font-bold text-blue-600">{flashLoanOpportunities.length}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">${totalFlashLoanProfit.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Profit</div>
              </div>
            </div>
            
            {flashLoanOpportunities.slice(0, 3).map((opportunity) => {
              const detailedFees = getDetailedFees(opportunity);
              const optimizedProfit = opportunity.estimatedProfit - detailedFees.total;
              
              return (
                <div key={opportunity.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{opportunity.pair}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600">
                        <Zap className="w-3 h-3 mr-1" />
                        Flash Loan
                      </Badge>
                      <Badge variant="secondary" className="text-green-600">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Optimized
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {opportunity.fromChain} → {opportunity.toChain} via {opportunity.flashLoanProvider}
                  </div>
                  
                  {/* Detailed Fee Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-xs font-semibold mb-2">Detailed Fee Breakdown (Optimized)</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Flash Loan Fee:</span>
                        <span className="font-semibold">${detailedFees.flashLoan.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trading Fees:</span>
                        <span className="font-semibold">${detailedFees.trading.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bridge Fees:</span>
                        <span className="font-semibold">${detailedFees.bridge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gas Fees:</span>
                        <span className="font-semibold">${detailedFees.gas.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-semibold">Total Fees:</span>
                        <span className="font-semibold text-red-600">${detailedFees.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-green-600">Fee Savings:</span>
                        <span className="font-semibold text-green-600">${detailedFees.savings.toFixed(2)}</span>
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
                      Optimizations: {Object.values(optimizationSettings).filter(Boolean).length}/10
                    </div>
                    <Button 
                      onClick={() => executeFlashLoanArbitrage(opportunity)}
                      disabled={isExecuting || optimizedProfit <= 0}
                      size="sm"
                      className={isTestMode ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}
                    >
                      {isTestMode ? 'Test Optimized Flash Loan' : 'Execute Optimized Flash Loan'}
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
