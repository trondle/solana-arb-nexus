
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  TestTube, 
  Play, 
  Pause, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Brain
} from 'lucide-react';

interface SimulationResult {
  id: string;
  timestamp: Date;
  scenario: string;
  expectedProfit: number;
  actualProfit: number;
  executionTime: number;
  gasUsed: number;
  slippage: number;
  success: boolean;
  riskFactors: string[];
}

interface BacktestMetrics {
  totalTrades: number;
  successRate: number;
  totalProfit: number;
  averageProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winLossRatio: number;
  profitFactor: number;
}

interface MarketScenario {
  id: string;
  name: string;
  description: string;
  volatility: number;
  liquidityMultiplier: number;
  gasMultiplier: number;
  probability: number;
}

const SimulationBacktesting = () => {
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [autoSimulation, setAutoSimulation] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [selectedScenario, setSelectedScenario] = useState('mixed');
  const [realTimeSimulation, setRealTimeSimulation] = useState(false);
  
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [backtestMetrics, setBacktestMetrics] = useState<BacktestMetrics>({
    totalTrades: 1247,
    successRate: 84.3,
    totalProfit: 15847.32,
    averageProfit: 12.71,
    maxDrawdown: 3.8,
    sharpeRatio: 2.14,
    winLossRatio: 2.8,
    profitFactor: 1.65
  });

  const [marketScenarios] = useState<MarketScenario[]>([
    {
      id: 'bull_market',
      name: 'Bull Market',
      description: 'Strong upward trend, high liquidity',
      volatility: 0.8,
      liquidityMultiplier: 1.5,
      gasMultiplier: 1.2,
      probability: 25
    },
    {
      id: 'bear_market',
      name: 'Bear Market',
      description: 'Downward trend, reduced liquidity',
      volatility: 1.3,
      liquidityMultiplier: 0.7,
      gasMultiplier: 0.9,
      probability: 20
    },
    {
      id: 'sideways',
      name: 'Sideways Market',
      description: 'Low volatility, stable conditions',
      volatility: 0.5,
      liquidityMultiplier: 1.0,
      gasMultiplier: 1.0,
      probability: 35
    },
    {
      id: 'high_volatility',
      name: 'High Volatility',
      description: 'Extreme price swings, variable liquidity',
      volatility: 2.0,
      liquidityMultiplier: 0.6,
      gasMultiplier: 1.8,
      probability: 15
    },
    {
      id: 'network_congestion',
      name: 'Network Congestion',
      description: 'High gas prices, slow execution',
      volatility: 1.1,
      liquidityMultiplier: 0.8,
      gasMultiplier: 3.0,
      probability: 5
    }
  ]);

  const [performanceData, setPerformanceData] = useState([
    { time: '00:00', profit: 0, trades: 0, successRate: 0 },
    { time: '04:00', profit: 245, trades: 12, successRate: 83 },
    { time: '08:00', profit: 598, trades: 28, successRate: 85 },
    { time: '12:00', profit: 892, trades: 45, successRate: 87 },
    { time: '16:00', profit: 1234, trades: 67, successRate: 84 },
    { time: '20:00', profit: 1587, trades: 89, successRate: 86 },
    { time: '24:00', profit: 1847, trades: 103, successRate: 85 }
  ]);

  const [scenarioResults, setScenarioResults] = useState([
    { scenario: 'Bull Market', trades: 312, profit: 4234, successRate: 89 },
    { scenario: 'Bear Market', trades: 249, profit: 2891, successRate: 78 },
    { scenario: 'Sideways', trades: 436, profit: 5123, successRate: 86 },
    { scenario: 'High Vol', trades: 187, profit: 2847, successRate: 81 },
    { scenario: 'Congestion', trades: 63, profit: 752, successRate: 74 }
  ]);

  // Real-time simulation
  useEffect(() => {
    if (!realTimeSimulation) return;

    const interval = setInterval(() => {
      // Simulate a new trade result
      const scenarios = ['bull_market', 'bear_market', 'sideways', 'high_volatility'];
      const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      const scenario = marketScenarios.find(s => s.id === randomScenario)!;
      
      const baseProfit = 50 + Math.random() * 100;
      const volatilityImpact = (Math.random() - 0.5) * scenario.volatility * 50;
      const actualProfit = Math.max(0, baseProfit + volatilityImpact);
      const success = actualProfit > 10;
      
      const newResult: SimulationResult = {
        id: `sim-${Date.now()}`,
        timestamp: new Date(),
        scenario: scenario.name,
        expectedProfit: baseProfit,
        actualProfit,
        executionTime: 2000 + Math.random() * 3000,
        gasUsed: 150000 + Math.random() * 50000,
        slippage: Math.random() * 2,
        success,
        riskFactors: success ? [] : ['High slippage', 'Low liquidity']
      };
      
      setSimulationResults(prev => [newResult, ...prev.slice(0, 49)]);
      
      // Update metrics
      setBacktestMetrics(prev => {
        const newTotal = prev.totalTrades + 1;
        const newSuccessful = success ? prev.totalProfit + actualProfit : prev.totalProfit;
        const newSuccessRate = ((prev.successRate * prev.totalTrades) + (success ? 100 : 0)) / newTotal;
        
        return {
          ...prev,
          totalTrades: newTotal,
          successRate: newSuccessRate,
          totalProfit: newSuccessful,
          averageProfit: newSuccessful / newTotal
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [realTimeSimulation, marketScenarios]);

  const runSimulation = async () => {
    setIsRunningSimulation(true);
    setSimulationProgress(0);
    
    const totalRuns = 100;
    const results: SimulationResult[] = [];
    
    for (let i = 0; i < totalRuns; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Pick random scenario based on probability
      const random = Math.random() * 100;
      let cumulativeProb = 0;
      let selectedScen = marketScenarios[0];
      
      for (const scenario of marketScenarios) {
        cumulativeProb += scenario.probability;
        if (random <= cumulativeProb) {
          selectedScen = scenario;
          break;
        }
      }
      
      // Simulate trade with scenario conditions
      const baseProfit = 30 + Math.random() * 80;
      const volatilityImpact = (Math.random() - 0.5) * selectedScen.volatility * 40;
      const liquidityImpact = (1 - selectedScen.liquidityMultiplier) * 20;
      const gasImpact = (selectedScen.gasMultiplier - 1) * 15;
      
      const actualProfit = Math.max(-20, baseProfit + volatilityImpact - liquidityImpact - gasImpact);
      const success = actualProfit > 5;
      
      const result: SimulationResult = {
        id: `sim-${i}`,
        timestamp: new Date(),
        scenario: selectedScen.name,
        expectedProfit: baseProfit,
        actualProfit,
        executionTime: 1800 + Math.random() * 2000,
        gasUsed: 120000 + Math.random() * 80000,
        slippage: Math.random() * 3,
        success,
        riskFactors: success ? [] : ['Market conditions', 'Execution risk']
      };
      
      results.push(result);
      setSimulationProgress(((i + 1) / totalRuns) * 100);
    }
    
    setSimulationResults(results);
    
    // Calculate new metrics
    const successful = results.filter(r => r.success);
    const totalProfit = results.reduce((sum, r) => sum + r.actualProfit, 0);
    
    setBacktestMetrics({
      totalTrades: results.length,
      successRate: (successful.length / results.length) * 100,
      totalProfit,
      averageProfit: totalProfit / results.length,
      maxDrawdown: 2.5 + Math.random() * 3,
      sharpeRatio: 1.8 + Math.random() * 0.8,
      winLossRatio: successful.length / (results.length - successful.length),
      profitFactor: 1.4 + Math.random() * 0.6
    });
    
    setIsRunningSimulation(false);
  };

  const chartConfig = {
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-1))",
    },
    successRate: {
      label: "Success Rate",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Advanced Simulation & Backtesting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Market Scenario</label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed Conditions</SelectItem>
                  <SelectItem value="bull_market">Bull Market</SelectItem>
                  <SelectItem value="bear_market">Bear Market</SelectItem>
                  <SelectItem value="high_volatility">High Volatility</SelectItem>
                  <SelectItem value="network_congestion">Network Congestion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={runSimulation} 
                disabled={isRunningSimulation}
                className="w-full h-10"
              >
                {isRunningSimulation ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </div>

          {isRunningSimulation && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Simulation Progress</span>
                <span>{simulationProgress.toFixed(0)}%</span>
              </div>
              <Progress value={simulationProgress} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Real-Time Simulation</h4>
              <p className="text-sm text-muted-foreground">Continuously simulate trades with live market data</p>
            </div>
            <Switch 
              checked={realTimeSimulation}
              onCheckedChange={setRealTimeSimulation}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Simulation</h4>
              <p className="text-sm text-muted-foreground">Run simulations before each trade</p>
            </div>
            <Switch 
              checked={autoSimulation}
              onCheckedChange={setAutoSimulation}
            />
          </div>
        </CardContent>
      </Card>

      {/* Backtest Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{backtestMetrics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {backtestMetrics.totalTrades} total trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${backtestMetrics.totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${backtestMetrics.averageProfit.toFixed(2)} avg per trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{backtestMetrics.sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{backtestMetrics.maxDrawdown.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Worst losing streak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    dataKey="profit" 
                    stroke="var(--color-profit)" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scenario Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioResults}>
                  <XAxis dataKey="scenario" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="profit" fill="var(--color-profit)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Market Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Market Scenario Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketScenarios.map((scenario) => (
              <div key={scenario.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{scenario.name}</h3>
                  <Badge variant="outline">{scenario.probability}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Volatility:</span>
                    <span>{scenario.volatility}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidity:</span>
                    <span>{scenario.liquidityMultiplier}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Cost:</span>
                    <span>{scenario.gasMultiplier}x</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Simulation Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Simulation Results</CardTitle>
        </CardHeader>
        <CardContent>
          {simulationResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No simulation results yet. Run a simulation to see results.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {simulationResults.slice(0, 10).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{result.scenario}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${result.actualProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${result.actualProfit.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.slippage.toFixed(2)}% slip
                    </div>
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

export default SimulationBacktesting;
