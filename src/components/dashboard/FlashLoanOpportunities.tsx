
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Zap, CreditCard, Target, TrendingDown, Filter, SortAsc, SortDesc } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<'profit' | 'fees' | 'spread' | 'time'>('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'low-fees' | 'high-profit'>('all');
  const [minProfit, setMinProfit] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [displayCount, setDisplayCount] = useState(20);

  // Enhanced filtering and sorting logic
  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = [...flashLoanOpportunities];

    // Apply filters
    if (filterBy === 'low-fees') {
      filtered = filtered.filter(opp => {
        const optimizedFees = calculateOptimizedFees(opp, 250000);
        return optimizedFees.total < opp.estimatedProfit * 0.3; // Fees less than 30% of profit
      });
    } else if (filterBy === 'high-profit') {
      const avgProfit = filtered.reduce((sum, opp) => sum + opp.netProfit, 0) / filtered.length;
      filtered = filtered.filter(opp => opp.netProfit > avgProfit);
    }

    // Apply custom filters
    if (minProfit) {
      const minProfitNum = parseFloat(minProfit);
      filtered = filtered.filter(opp => opp.netProfit >= minProfitNum);
    }

    if (maxFees) {
      const maxFeesNum = parseFloat(maxFees);
      filtered = filtered.filter(opp => {
        const optimizedFees = calculateOptimizedFees(opp, 250000);
        return optimizedFees.total <= maxFeesNum;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: number, valueB: number;

      switch (sortBy) {
        case 'fees':
          const feesA = calculateOptimizedFees(a, 250000).total;
          const feesB = calculateOptimizedFees(b, 250000).total;
          valueA = feesA;
          valueB = feesB;
          break;
        case 'spread':
          valueA = a.spread;
          valueB = b.spread;
          break;
        case 'time':
          valueA = a.executionTime;
          valueB = b.executionTime;
          break;
        case 'profit':
        default:
          valueA = a.netProfit;
          valueB = b.netProfit;
          break;
      }

      return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
    });

    return filtered.slice(0, displayCount);
  }, [flashLoanOpportunities, sortBy, sortOrder, filterBy, minProfit, maxFees, displayCount]);

  const resetFilters = () => {
    setSortBy('profit');
    setSortOrder('desc');
    setFilterBy('all');
    setMinProfit('');
    setMaxFees('');
  };

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
          <div className="space-y-4">
            {/* Enhanced Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div>
                <div className="text-2xl font-bold text-blue-600">{flashLoanOpportunities.length}</div>
                <div className="text-sm text-muted-foreground">Total Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">${totalFlashLoanProfit.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Profit (Optimized)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {flashLoanOpportunities.reduce((sum, opp) => {
                    const fees = calculateOptimizedFees(opp, 250000);
                    return sum + fees.savings;
                  }, 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Fee Savings ($)</div>
              </div>
            </div>

            {/* Advanced Filtering and Sorting Controls */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-4 h-4" />
                  Advanced Filtering & Sorting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profit">Net Profit</SelectItem>
                        <SelectItem value="fees">Total Fees</SelectItem>
                        <SelectItem value="spread">Spread %</SelectItem>
                        <SelectItem value="time">Execution Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">
                          <div className="flex items-center gap-1">
                            <SortDesc className="w-3 h-3" />
                            High to Low
                          </div>
                        </SelectItem>
                        <SelectItem value="asc">
                          <div className="flex items-center gap-1">
                            <SortAsc className="w-3 h-3" />
                            Low to High
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Filter</Label>
                    <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Show All</SelectItem>
                        <SelectItem value="low-fees">Low Fees Only</SelectItem>
                        <SelectItem value="high-profit">High Profit Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Display Count</Label>
                    <Select value={displayCount.toString()} onValueChange={(value) => setDisplayCount(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 Results</SelectItem>
                        <SelectItem value="20">20 Results</SelectItem>
                        <SelectItem value="30">30 Results</SelectItem>
                        <SelectItem value="50">50 Results</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Min Profit ($)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      value={minProfit}
                      onChange={(e) => setMinProfit(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Fees ($)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 50"
                      value={maxFees}
                      onChange={(e) => setMaxFees(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={resetFilters}
                      variant="outline"
                      className="w-full"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Showing {filteredAndSortedOpportunities.length} of {flashLoanOpportunities.length} opportunities</span>
                  <span>Sorted by {sortBy} ({sortOrder === 'desc' ? 'highest first' : 'lowest first'})</span>
                </div>
              </CardContent>
            </Card>

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
            
            {filteredAndSortedOpportunities.map((opportunity) => {
              const optimizedFees = calculateOptimizedFees(opportunity, 250000);
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

            {filteredAndSortedOpportunities.length === 0 && flashLoanOpportunities.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div>No opportunities match your current filters</div>
                <div className="text-sm">Try adjusting your filter criteria or reset filters</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashLoanOpportunities;
