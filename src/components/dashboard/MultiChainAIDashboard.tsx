
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Network, 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap,
  Globe,
  Activity,
  BarChart3,
  Timer,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Settings,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { useMultiChainManager } from '@/hooks/useMultiChainManager';
import { useAITimingOptimizer } from '@/hooks/useAITimingOptimizer';
import { useToast } from '@/hooks/use-toast';

const MultiChainAIDashboard = () => {
  const { toast } = useToast();
  const {
    chains,
    enabledChains,
    crossChainOpportunities,
    isScanning,
    toggleChain,
    scanCrossChainOpportunities
  } = useMultiChainManager();

  const {
    strategies,
    enabledStrategies,
    marketConditions,
    currentPrediction,
    isAnalyzing,
    performanceStats,
    toggleStrategy,
    updateStrategyWeight,
    analyzeTimingOpportunity
  } = useAITimingOptimizer();

  const [autoExecuteAI, setAutoExecuteAI] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);

  const executeCrossChainArbitrage = async (opportunity: any) => {
    toast({
      title: "Cross-Chain Arbitrage Initiated",
      description: `Executing ${opportunity.pair} arbitrage from ${opportunity.fromChain} to ${opportunity.toChain}`,
      variant: "default"
    });
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'execute_now': return 'text-green-500';
      case 'wait_short': return 'text-yellow-500';
      case 'wait_long': return 'text-orange-500';
      case 'skip': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'execute_now': return 'default';
      case 'wait_short': return 'secondary';
      case 'wait_long': return 'outline';
      case 'skip': return 'destructive';
      default: return 'secondary';
    }
  };

  const chartConfig = {
    volatility: { label: "Volatility", color: "hsl(var(--chart-1))" },
    gasPrice: { label: "Gas Price", color: "hsl(var(--chart-2))" },
    volume: { label: "Volume", color: "hsl(var(--chart-3))" }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-Chain Opportunities</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{crossChainOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              {enabledChains.length} chains active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Timing Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentPrediction?.score?.toFixed(0) || '--'}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {enabledStrategies.length} strategies active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{performanceStats.profitImprovement}%</div>
            <p className="text-xs text-muted-foreground">
              vs. standard arbitrage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {((performanceStats.accurateTimings / performanceStats.totalPredictions) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceStats.totalPredictions} predictions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="multi-chain" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="multi-chain" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Multi-Chain Arbitrage
          </TabsTrigger>
          <TabsTrigger value="ai-timing" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Timing Optimization
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="multi-chain" className="space-y-6">
          {/* Chain Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Blockchain Network Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chains.map((chain) => (
                  <div key={chain.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={chain.enabled}
                          onCheckedChange={() => toggleChain(chain.id)}
                        />
                        <div>
                          <div className="font-semibold">{chain.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Gas: ${chain.gasCost.toFixed(6)} • Block: {chain.blockTime}ms
                          </div>
                        </div>
                      </div>
                      <Badge variant={chain.enabled ? 'default' : 'secondary'}>
                        {chain.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Flash Loan Providers: </span>
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

          {/* Cross-Chain Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5" />
                  Cross-Chain Arbitrage Opportunities
                </div>
                <div className="flex items-center gap-2">
                  {isScanning && <Activity className="w-4 h-4 animate-pulse" />}
                  <Button onClick={scanCrossChainOpportunities} disabled={isScanning} size="sm">
                    {isScanning ? 'Scanning...' : 'Refresh'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crossChainOpportunities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {enabledChains.length < 2 ? 
                      'Enable at least 2 chains to detect cross-chain opportunities' :
                      'No profitable cross-chain opportunities detected'
                    }
                  </div>
                ) : (
                  crossChainOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{opportunity.pair}</div>
                          <div className="text-sm text-muted-foreground">
                            {opportunity.fromChain} → {opportunity.toChain}
                          </div>
                        </div>
                        <Badge variant={opportunity.riskLevel === 'low' ? 'default' : 
                                      opportunity.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                          {opportunity.riskLevel.toUpperCase()} RISK
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Spread</div>
                          <div className="font-semibold text-green-500">
                            {opportunity.spread.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Net Profit</div>
                          <div className="font-semibold text-green-600">
                            ${opportunity.netProfit.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Bridge Fee</div>
                          <div className="font-semibold text-red-500">
                            ${opportunity.bridgeFee.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Execution Time</div>
                          <div className="font-semibold">
                            {(opportunity.executionTime / 1000).toFixed(1)}s
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Confidence: {opportunity.confidence.toFixed(0)}% • 
                          Total fees: ${opportunity.totalFees.toFixed(2)}
                        </div>
                        <Button 
                          onClick={() => executeCrossChainArbitrage(opportunity)}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Execute Cross-Chain
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-timing" className="space-y-6">
          {/* AI Timing Prediction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Timing Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPrediction ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        Timing Score: {currentPrediction.score.toFixed(0)}/100
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {currentPrediction.reasoning}
                      </div>
                    </div>
                    <Badge variant={getRecommendationBadge(currentPrediction.recommendation)}>
                      {currentPrediction.recommendation.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <Progress value={currentPrediction.score} className="h-3" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold">Optimal Window</div>
                      <div className="text-muted-foreground">
                        {Math.round((currentPrediction.optimalWindow.end - currentPrediction.optimalWindow.start) / 1000)}s
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold">Confidence</div>
                      <div className="text-muted-foreground">
                        {currentPrediction.optimalWindow.confidence.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-semibold">Risk Adjustment</div>
                      <div className="text-muted-foreground">
                        {(currentPrediction.riskAdjustment * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isAnalyzing ? 'AI is analyzing market conditions...' : 'No timing analysis available'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Strategy Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Strategy Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="text-sm font-medium">Auto-Execute AI Recommendations</label>
                  <p className="text-xs text-muted-foreground">Execute trades when AI confidence exceeds threshold</p>
                </div>
                <Switch 
                  checked={autoExecuteAI}
                  onCheckedChange={setAutoExecuteAI}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence Threshold for Auto-Execute</span>
                  <span>{confidenceThreshold}%</span>
                </div>
                <Slider
                  value={[confidenceThreshold]}
                  onValueChange={(value) => setConfidenceThreshold(value[0])}
                  min={50}
                  max={95}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={strategy.enabled}
                          onCheckedChange={() => toggleStrategy(strategy.id)}
                        />
                        <div>
                          <div className="font-semibold text-sm">{strategy.name}</div>
                          <div className="text-xs text-muted-foreground">{strategy.description}</div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {strategy.performance.toFixed(1)}% accuracy
                      </Badge>
                    </div>

                    {strategy.enabled && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Strategy Weight</span>
                          <span>{(strategy.weight * 100).toFixed(0)}%</span>
                        </div>
                        <Slider
                          value={[strategy.weight * 100]}
                          onValueChange={(value) => updateStrategyWeight(strategy.id, value[0] / 100)}
                          min={5}
                          max={40}
                          step={5}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Market Conditions Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-Time Market Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marketConditions}>
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line dataKey="volatility" stroke="var(--color-volatility)" strokeWidth={2} />
                    <Line dataKey="gasPrice" stroke="var(--color-gasPrice)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Predictions</span>
                    <span className="font-semibold">{performanceStats.totalPredictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accurate Timings</span>
                    <span className="font-semibold text-green-600">{performanceStats.accurateTimings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Improvement</span>
                    <span className="font-semibold text-blue-600">+{performanceStats.profitImprovement}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Reduction</span>
                    <span className="font-semibold text-purple-600">-{performanceStats.riskReduction}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-Chain Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Chains</span>
                    <span className="font-semibold">{enabledChains.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cross-Chain Opportunities</span>
                    <span className="font-semibold text-blue-600">{crossChainOpportunities.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Cross-Chain Profit</span>
                    <span className="font-semibold text-green-600">
                      ${crossChainOpportunities.length > 0 ? crossChainOpportunities[0].netProfit.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Bridge Fee</span>
                    <span className="font-semibold text-red-500">
                      ${crossChainOpportunities.length > 0 ? 
                        (crossChainOpportunities.reduce((sum, op) => sum + op.bridgeFee, 0) / crossChainOpportunities.length).toFixed(2) : 
                        '0.00'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiChainAIDashboard;
