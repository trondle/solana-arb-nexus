
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Globe, 
  Target,
  ArrowRightLeft,
  DollarSign,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Wallet,
  CreditCard
} from 'lucide-react';
import { useMultiChainManager } from '@/hooks/useMultiChainManager';
import { useAITimingOptimizer } from '@/hooks/useAITimingOptimizer';

const MultiChainAIDashboard = () => {
  const { 
    chains, 
    enabledChains, 
    crossChainOpportunities, 
    isScanning, 
    flashLoanMode,
    toggleChain, 
    setFlashLoanMode
  } = useMultiChainManager();
  
  const {
    strategies,
    marketConditions,
    activeRecommendations,
    isAnalyzing,
    performance,
    toggleStrategy
  } = useAITimingOptimizer();

  const flashLoanOpportunities = crossChainOpportunities.filter(op => op.flashLoanEnabled);
  const regularOpportunities = crossChainOpportunities.filter(op => !op.flashLoanEnabled);
  const totalFlashLoanProfit = flashLoanOpportunities.reduce((sum, op) => sum + op.netProfit, 0);
  const totalRegularProfit = regularOpportunities.reduce((sum, op) => sum + op.netProfit, 0);

  return (
    <div className="space-y-6">
      {/* Multi-Chain Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Multi-Chain Arbitrage Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{enabledChains.length}</div>
              <div className="text-sm text-muted-foreground">Active Chains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{crossChainOpportunities.length}</div>
              <div className="text-sm text-muted-foreground">Cross-Chain Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{flashLoanOpportunities.length}</div>
              <div className="text-sm text-muted-foreground">Flash Loan Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                ${(totalFlashLoanProfit + totalRegularProfit).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Potential Profit</div>
            </div>
          </div>

          {/* Flash Loan Mode Toggle */}
          <Alert className="mb-4">
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>Flash Loan Cross-Chain Arbitrage:</strong> Execute cross-chain arbitrage with zero capital requirement.
                  Flash loans enable massive capital efficiency for cross-chain opportunities.
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Label htmlFor="flash-mode">Enable Flash Loans</Label>
                  <Switch 
                    id="flash-mode"
                    checked={flashLoanMode}
                    onCheckedChange={setFlashLoanMode}
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Chain Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chains.map((chain) => (
              <div 
                key={chain.id} 
                className={`border rounded-lg p-4 ${chain.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{chain.name}</div>
                    <Badge variant={chain.enabled ? 'default' : 'secondary'}>
                      {chain.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Switch 
                    checked={chain.enabled}
                    onCheckedChange={() => toggleChain(chain.id)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Gas Cost: </span>
                    <span className="font-semibold">${chain.gasCost.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Block Time: </span>
                    <span className="font-semibold">{chain.blockTime}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flash Providers: </span>
                    <span className="font-semibold">{chain.flashLoanProviders.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DEXes: </span>
                    <span className="font-semibold">{chain.dexes.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flash Loan vs Regular Opportunities Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flash Loan Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Flash Loan Cross-Chain (Zero Capital)
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
                
                {flashLoanOpportunities.slice(0, 3).map((opportunity) => (
                  <div key={opportunity.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{opportunity.pair}</div>
                      <Badge variant="outline" className="text-blue-600">
                        <Zap className="w-3 h-3 mr-1" />
                        Flash Loan
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {opportunity.fromChain} → {opportunity.toChain} via {opportunity.flashLoanProvider}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Spread: </span>
                        <span className="font-semibold text-green-600">{opportunity.spread.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Flash Fee: </span>
                        <span className="font-semibold">${opportunity.flashLoanFee?.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Net Profit: </span>
                        <span className="font-semibold text-green-600">${opportunity.netProfit.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regular Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-500" />
              Regular Cross-Chain (Requires Capital)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regularOpportunities.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div>No regular opportunities available</div>
                <div className="text-sm">Scanning for profitable cross-chain arbitrage...</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{regularOpportunities.length}</div>
                    <div className="text-sm text-muted-foreground">Available</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">${totalRegularProfit.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Profit</div>
                  </div>
                </div>
                
                {regularOpportunities.slice(0, 3).map((opportunity) => (
                  <div key={opportunity.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{opportunity.pair}</div>
                      <Badge variant="outline" className="text-green-600">
                        <Wallet className="w-3 h-3 mr-1" />
                        Regular
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {opportunity.fromChain} → {opportunity.toChain}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Capital: </span>
                        <span className="font-semibold">${opportunity.requiresCapital.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Spread: </span>
                        <span className="font-semibold text-green-600">{opportunity.spread.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Net Profit: </span>
                        <span className="font-semibold text-green-600">${opportunity.netProfit.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Timing Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Timing Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Active Strategies</h4>
              {strategies.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{strategy.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Score: {strategy.currentScore.toFixed(1)} | Profit: +{strategy.profitIncrease.toFixed(1)}%
                    </div>
                  </div>
                  <Switch 
                    checked={strategy.enabled}
                    onCheckedChange={() => toggleStrategy(strategy.id)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Market Conditions</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Volatility</span>
                  <span className="font-semibold">{marketConditions.volatility.toFixed(1)}%</span>
                </div>
                <Progress value={marketConditions.volatility} />
                
                <div className="flex justify-between text-sm">
                  <span>Liquidity Index</span>
                  <span className="font-semibold">{marketConditions.liquidityIndex.toFixed(1)}</span>
                </div>
                <Progress value={marketConditions.liquidityIndex} />
                
                <div className="flex justify-between text-sm">
                  <span>Gas Efficiency</span>
                  <span className="font-semibold">{marketConditions.gasOptimization.toFixed(1)}%</span>
                </div>
                <Progress value={marketConditions.gasOptimization} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Performance</h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">+{performance.profitIncrease.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Profit Increase</div>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">{performance.successRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <div className="text-lg font-bold text-purple-600">{performance.executedTrades}</div>
                  <div className="text-xs text-muted-foreground">AI Trades</div>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <div className="text-lg font-bold text-orange-600">${performance.totalProfit.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">Total Profit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Recommendations */}
          {activeRecommendations.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800">AI Recommendations</span>
              </div>
              <div className="space-y-2">
                {activeRecommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-semibold">{rec.action}</div>
                      <div className="text-muted-foreground">{rec.reason}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">+{rec.expectedProfit.toFixed(1)}%</Badge>
                      <Badge variant={rec.confidence > 80 ? 'default' : 'secondary'}>
                        {rec.confidence.toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiChainAIDashboard;
