
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Brain, 
  DollarSign, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Settings,
  BarChart3,
  Gauge,
  Timer,
  Sparkles
} from 'lucide-react';

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  impact: number;
  complexity: 'low' | 'medium' | 'high';
  estimatedGain: number;
}

interface ProfitMetrics {
  currentProfit: number;
  optimizedProfit: number;
  improvement: number;
  gasOptimization: number;
  slippageReduction: number;
  feeOptimization: number;
  timingOptimization: number;
}

interface OptimizationSettings {
  aggressiveOptimization: boolean;
  riskTolerance: number;
  maxSlippage: number;
  gasPriceLimit: number;
  minProfitThreshold: number;
  timeWindow: number;
  autoOptimize: boolean;
}

interface OpportunityAnalysis {
  pair: string;
  currentProfit: number;
  optimizedProfit: number;
  strategies: string[];
  confidence: number;
  riskScore: number;
  timeToExecution: number;
}

const ProfitOptimizer = () => {
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([]);
  const [metrics, setMetrics] = useState<ProfitMetrics>({
    currentProfit: 0,
    optimizedProfit: 0,
    improvement: 0,
    gasOptimization: 0,
    slippageReduction: 0,
    feeOptimization: 0,
    timingOptimization: 0
  });

  const [opportunities, setOpportunities] = useState<OpportunityAnalysis[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const [settings, setSettings] = useState<OptimizationSettings>({
    aggressiveOptimization: false,
    riskTolerance: 50,
    maxSlippage: 1.0,
    gasPriceLimit: 0.01,
    minProfitThreshold: 5.0,
    timeWindow: 30,
    autoOptimize: true
  });

  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([]);

  useEffect(() => {
    const generateStrategies = (): OptimizationStrategy[] => {
      return [
        {
          id: 'gas-optimization',
          name: 'Gas Price Optimization',
          description: 'Dynamically adjust gas prices for optimal execution',
          enabled: true,
          impact: 85,
          complexity: 'medium',
          estimatedGain: 12.5
        },
        {
          id: 'route-optimization',
          name: 'Route Optimization',
          description: 'Find the most profitable trading routes',
          enabled: true,
          impact: 92,
          complexity: 'high',
          estimatedGain: 18.2
        },
        {
          id: 'timing-optimization',
          name: 'Timing Optimization',
          description: 'Execute trades at optimal market moments',
          enabled: false,
          impact: 78,
          complexity: 'high',
          estimatedGain: 15.8
        },
        {
          id: 'slippage-minimization',
          name: 'Slippage Minimization',
          description: 'Reduce slippage through smart order splitting',
          enabled: true,
          impact: 73,
          complexity: 'medium',
          estimatedGain: 8.9
        },
        {
          id: 'fee-reduction',
          name: 'Fee Reduction',
          description: 'Minimize protocol and network fees',
          enabled: true,
          impact: 68,
          complexity: 'low',
          estimatedGain: 6.4
        },
        {
          id: 'liquidity-analysis',
          name: 'Liquidity Analysis',
          description: 'Analyze liquidity depth for better execution',
          enabled: false,
          impact: 81,
          complexity: 'high',
          estimatedGain: 13.7
        },
        {
          id: 'mev-protection',
          name: 'MEV Protection',
          description: 'Protect against front-running and sandwich attacks',
          enabled: true,
          impact: 89,
          complexity: 'high',
          estimatedGain: 22.1
        }
      ];
    };

    const generateOpportunities = (): OpportunityAnalysis[] => {
      const pairs = ['SOL/USDC', 'SOL/USDT', 'ETH/SOL', 'RAY/SOL', 'BONK/SOL'];
      
      return pairs.map(pair => ({
        pair,
        currentProfit: 10 + Math.random() * 50,
        optimizedProfit: 15 + Math.random() * 70,
        strategies: strategies.filter(s => s.enabled && Math.random() > 0.5).map(s => s.name).slice(0, 3),
        confidence: 70 + Math.random() * 25,
        riskScore: Math.random() * 100,
        timeToExecution: 1 + Math.random() * 10
      }));
    };

    const calculateMetrics = () => {
      const enabledStrategies = strategies.filter(s => s.enabled);
      const totalGain = enabledStrategies.reduce((sum, s) => sum + s.estimatedGain, 0);
      
      const baseProfit = 45.8;
      const optimizedProfit = baseProfit + totalGain;
      
      setMetrics({
        currentProfit: baseProfit,
        optimizedProfit,
        improvement: ((optimizedProfit - baseProfit) / baseProfit) * 100,
        gasOptimization: enabledStrategies.find(s => s.id === 'gas-optimization')?.estimatedGain || 0,
        slippageReduction: enabledStrategies.find(s => s.id === 'slippage-minimization')?.estimatedGain || 0,
        feeOptimization: enabledStrategies.find(s => s.id === 'fee-reduction')?.estimatedGain || 0,
        timingOptimization: enabledStrategies.find(s => s.id === 'timing-optimization')?.estimatedGain || 0
      });
    };

    setStrategies(generateStrategies());
    
    const interval = setInterval(() => {
      setOpportunities(generateOpportunities());
      calculateMetrics();
    }, 4000);

    return () => clearInterval(interval);
  }, [strategies]);

  const toggleStrategy = (strategyId: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, enabled: !strategy.enabled }
        : strategy
    ));
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    const steps = ['Analyzing market conditions', 'Calculating optimal routes', 'Optimizing gas prices', 'Minimizing slippage', 'Finalizing strategy'];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setOptimizationProgress((i + 1) * 20);
    }

    setOptimizationHistory(prev => [...prev.slice(-4), {
      timestamp: new Date().toLocaleTimeString(),
      improvement: metrics.improvement,
      strategies: strategies.filter(s => s.enabled).length,
      profit: metrics.optimizedProfit
    }]);

    setIsOptimizing(false);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'text-green-500';
    if (risk < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Optimization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.currentProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Base arbitrage profit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimized Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${metrics.optimizedProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">With optimizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+{metrics.improvement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Profit increase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {strategies.filter(s => s.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">of {strategies.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Optimization Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={strategy.enabled}
                      onCheckedChange={() => toggleStrategy(strategy.id)}
                    />
                    <div>
                      <div className="font-semibold">{strategy.name}</div>
                      <div className="text-sm text-muted-foreground">{strategy.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={strategy.enabled ? 'default' : 'secondary'}>
                      +${strategy.estimatedGain.toFixed(1)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Impact</div>
                    <div className="font-semibold">{strategy.impact}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Complexity</div>
                    <div className={`font-semibold capitalize ${getComplexityColor(strategy.complexity)}`}>
                      {strategy.complexity}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Estimated Gain</div>
                    <div className="font-semibold text-green-600">
                      ${strategy.estimatedGain.toFixed(1)}
                    </div>
                  </div>
                </div>

                {strategy.enabled && (
                  <div className="mt-3">
                    <Progress value={strategy.impact} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Optimization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Aggressive Optimization</label>
                  <p className="text-xs text-muted-foreground">Enable high-risk, high-reward strategies</p>
                </div>
                <Switch 
                  checked={settings.aggressiveOptimization}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, aggressiveOptimization: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Auto Optimize</label>
                  <p className="text-xs text-muted-foreground">Automatically apply optimizations</p>
                </div>
                <Switch 
                  checked={settings.autoOptimize}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoOptimize: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Risk Tolerance</label>
                  <span className="text-sm text-muted-foreground">{settings.riskTolerance}%</span>
                </div>
                <Slider
                  value={[settings.riskTolerance]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, riskTolerance: value[0] }))}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Min Profit Threshold ($)</label>
                  <span className="text-sm text-muted-foreground">${settings.minProfitThreshold}</span>
                </div>
                <Slider
                  value={[settings.minProfitThreshold]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, minProfitThreshold: value[0] }))}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Optimization Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opportunity, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">{opportunity.pair}</div>
                  <Badge variant="outline">
                    {opportunity.confidence.toFixed(0)}% confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <div className="text-muted-foreground">Current Profit</div>
                    <div className="font-semibold">${opportunity.currentProfit.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Optimized Profit</div>
                    <div className="font-semibold text-green-600">${opportunity.optimizedProfit.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Risk Score</div>
                    <div className={`font-semibold ${getRiskColor(opportunity.riskScore)}`}>
                      {opportunity.riskScore.toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Execution Time</div>
                    <div className="font-semibold">{opportunity.timeToExecution.toFixed(1)}s</div>
                  </div>
                </div>

                {opportunity.strategies.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Applicable Strategies:</div>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.strategies.map((strategy, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {strategy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Run Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Optimization Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOptimizing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running optimization...</span>
                <span>{optimizationProgress}%</span>
              </div>
              <Progress value={optimizationProgress} />
            </div>
          )}

          <Button 
            onClick={runOptimization}
            disabled={isOptimizing}
            className="w-full"
          >
            {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
          </Button>

          <Alert>
            <Gauge className="h-4 w-4" />
            <AlertDescription>
              Optimization will analyze current market conditions and apply enabled strategies 
              to maximize profit potential while respecting risk parameters.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Optimization History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Optimization History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {optimizationHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No optimization runs yet</p>
          ) : (
            <div className="space-y-2">
              {optimizationHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{entry.timestamp}</span>
                    <Badge variant="outline">{entry.strategies} strategies</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">+{entry.improvement.toFixed(1)}%</span>
                    <span className="font-semibold text-green-600">${entry.profit.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitOptimizer;
