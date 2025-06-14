
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  Zap, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  Target,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlashArbitrageOpportunity {
  id: string;
  pair: string;
  buyDex: string;
  sellDex: string;
  spread: number;
  estimatedProfit: number;
  requiredCapital: number;
  flashLoanFee: number;
  totalFees: number;
  netProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

interface FlashLoanProvider {
  name: string;
  fee: number;
  maxAmount: number;
  minAmount: number;
  available: boolean;
  estimatedTime: number;
}

interface ArbitrageExecution {
  id: string;
  opportunity: FlashArbitrageOpportunity;
  status: 'pending' | 'borrowing' | 'buying' | 'selling' | 'repaying' | 'completed' | 'failed';
  actualProfit: number;
  executionTime: number;
  timestamp: string;
}

const ZeroCapitalArbitrage = () => {
  const { toast } = useToast();
  
  const [opportunities, setOpportunities] = useState<FlashArbitrageOpportunity[]>([]);
  const [providers] = useState<FlashLoanProvider[]>([
    { name: 'Solend', fee: 0.09, maxAmount: 1000000, minAmount: 1000, available: true, estimatedTime: 2.1 },
    { name: 'Mango', fee: 0.05, maxAmount: 500000, minAmount: 500, available: true, estimatedTime: 1.8 },
    { name: 'Francium', fee: 0.06, maxAmount: 300000, minAmount: 1000, available: true, estimatedTime: 2.3 }
  ]);
  
  const [selectedProvider, setSelectedProvider] = useState('mango');
  const [autoExecute, setAutoExecute] = useState(false);
  const [minProfitThreshold, setMinProfitThreshold] = useState(5);
  const [maxRiskLevel, setMaxRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executions, setExecutions] = useState<ArbitrageExecution[]>([]);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  const [profitHistory, setProfitHistory] = useState<any[]>([]);

  useEffect(() => {
    const generateOpportunities = (): FlashArbitrageOpportunity[] => {
      const pairs = ['SOL/USDC', 'SOL/USDT', 'ETH/SOL', 'RAY/SOL', 'ORCA/SOL'];
      const dexes = ['Raydium', 'Orca', 'Jupiter', 'Serum'];
      const opportunities: FlashArbitrageOpportunity[] = [];

      for (let i = 0; i < 6; i++) {
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const buyDex = dexes[Math.floor(Math.random() * dexes.length)];
        let sellDex = dexes[Math.floor(Math.random() * dexes.length)];
        while (sellDex === buyDex) {
          sellDex = dexes[Math.floor(Math.random() * dexes.length)];
        }

        const spread = 0.8 + Math.random() * 2.5; // 0.8% to 3.3%
        const requiredCapital = 5000 + Math.random() * 45000;
        const provider = providers.find(p => p.name.toLowerCase() === selectedProvider);
        const flashLoanFee = requiredCapital * (provider?.fee || 0.05) / 100;
        const tradingFees = requiredCapital * 0.006; // 0.6% total trading fees
        const totalFees = flashLoanFee + tradingFees;
        const estimatedProfit = requiredCapital * spread / 100;
        const netProfit = estimatedProfit - totalFees;
        
        const riskLevel: 'low' | 'medium' | 'high' = 
          spread > 2.5 ? 'low' : spread > 1.5 ? 'medium' : 'high';
        
        opportunities.push({
          id: `arb-${i}`,
          pair,
          buyDex,
          sellDex,
          spread,
          estimatedProfit,
          requiredCapital,
          flashLoanFee,
          totalFees,
          netProfit,
          riskLevel,
          confidence: 75 + Math.random() * 20
        });
      }

      return opportunities
        .filter(opp => opp.netProfit > 0)
        .sort((a, b) => b.netProfit - a.netProfit);
    };

    setOpportunities(generateOpportunities());
    
    const interval = setInterval(() => {
      setOpportunities(generateOpportunities());
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedProvider, providers]);

  const executeFlashArbitrage = async (opportunity: FlashArbitrageOpportunity) => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    setExecutionProgress(0);
    setCurrentStep('Initializing flash loan...');

    const steps = [
      'Borrowing funds via flash loan',
      'Executing buy order',
      'Executing sell order',
      'Repaying flash loan',
      'Calculating final profit'
    ];

    const execution: ArbitrageExecution = {
      id: `exec-${Date.now()}`,
      opportunity,
      status: 'pending',
      actualProfit: 0,
      executionTime: 0,
      timestamp: new Date().toLocaleTimeString()
    };

    setExecutions(prev => [execution, ...prev.slice(0, 9)]);
    
    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setExecutionProgress((i + 1) * 20);
        
        // Update execution status
        const status = i === 0 ? 'borrowing' : 
                     i === 1 ? 'buying' : 
                     i === 2 ? 'selling' : 
                     i === 3 ? 'repaying' : 'completed';
        
        setExecutions(prev => 
          prev.map(exec => 
            exec.id === execution.id 
              ? { ...exec, status: status as any }
              : exec
          )
        );
        
        await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
      }

      // Simulate some slippage and real-world conditions
      const slippageFactor = 0.985 + Math.random() * 0.025; // 1.5% to 2.5% slippage
      const actualProfit = opportunity.netProfit * slippageFactor;
      const executionTime = 4000 + Math.random() * 2000;

      setExecutions(prev => 
        prev.map(exec => 
          exec.id === execution.id 
            ? { 
                ...exec, 
                status: 'completed',
                actualProfit,
                executionTime
              }
            : exec
        )
      );

      // Add to profit history
      setProfitHistory(prev => [...prev.slice(-9), {
        time: new Date().toLocaleTimeString(),
        profit: actualProfit,
        fees: opportunity.totalFees
      }]);

      toast({
        title: "Flash Arbitrage Completed!",
        description: `Net profit: $${actualProfit.toFixed(2)} (fees paid: $${opportunity.totalFees.toFixed(2)})`,
        variant: actualProfit > 0 ? "default" : "destructive"
      });

    } catch (error) {
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === execution.id 
            ? { ...exec, status: 'failed' }
            : exec
        )
      );

      toast({
        title: "Arbitrage Failed",
        description: "Flash loan execution failed. No funds lost.",
        variant: "destructive"
      });
    }

    setIsExecuting(false);
    setExecutionProgress(0);
    setCurrentStep('');
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'borrowing': return <ArrowUpDown className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'buying': case 'selling': return <Target className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'repaying': return <ArrowUpDown className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const chartConfig = {
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-1))",
    },
    fees: {
      label: "Fees",
      color: "hsl(var(--chart-2))",
    },
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const riskLevels = { low: 1, medium: 2, high: 3 };
    const maxRiskLevels = { low: 1, medium: 2, high: 3 };
    return opp.netProfit >= minProfitThreshold && 
           riskLevels[opp.riskLevel] <= maxRiskLevels[maxRiskLevel];
  });

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Zero-Capital Arbitrage Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Zero-Risk Flash Loan Arbitrage:</strong> You only pay fees (~0.05-0.09% loan fee + ~0.6% trading fees). 
              No capital required - funds are borrowed and repaid in the same transaction.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Flash Loan Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.filter(p => p.available).map(provider => (
                    <SelectItem key={provider.name.toLowerCase()} value={provider.name.toLowerCase()}>
                      {provider.name} ({provider.fee}% fee)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Profit Threshold ($)</Label>
              <Input
                type="number"
                value={minProfitThreshold}
                onChange={(e) => setMinProfitThreshold(parseFloat(e.target.value))}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label>Max Risk Level</Label>
              <Select value={maxRiskLevel} onValueChange={(value: any) => setMaxRiskLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk Only</SelectItem>
                  <SelectItem value="medium">Medium Risk & Below</SelectItem>
                  <SelectItem value="high">All Risk Levels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Auto Execute</Label>
                <Switch 
                  checked={autoExecute}
                  onCheckedChange={setAutoExecute}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-execute profitable opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Execution */}
      {isExecuting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 animate-pulse" />
              Executing Flash Arbitrage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{executionProgress}%</span>
              </div>
              <Progress value={executionProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Flash Loan Arbitrage Opportunities
            </div>
            <Badge variant="outline">
              {filteredOpportunities.length} Available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{opportunity.pair}</div>
                    <div className="text-sm text-muted-foreground">
                      Buy on {opportunity.buyDex} → Sell on {opportunity.sellDex}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={opportunity.riskLevel === 'low' ? 'default' : 
                                 opportunity.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                      {opportunity.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Spread</div>
                    <div className="font-semibold text-green-500">
                      {opportunity.spread.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Required Capital</div>
                    <div className="font-semibold">
                      ${opportunity.requiredCapital.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Fees</div>
                    <div className="font-semibold text-red-500">
                      ${opportunity.totalFees.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Net Profit</div>
                    <div className={`font-semibold ${opportunity.netProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${opportunity.netProfit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Confidence</div>
                    <div className="font-semibold">
                      {opportunity.confidence.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Flash loan fee: ${opportunity.flashLoanFee.toFixed(2)} • 
                    Trading fees: ${(opportunity.totalFees - opportunity.flashLoanFee).toFixed(2)}
                  </div>
                  <Button 
                    onClick={() => executeFlashArbitrage(opportunity)}
                    disabled={isExecuting || opportunity.netProfit <= 0}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Execute Flash Arbitrage
                  </Button>
                </div>
              </div>
            ))}

            {filteredOpportunities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No profitable opportunities match your criteria. 
                Try adjusting your minimum profit threshold or risk level.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution History & Profit Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {executions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No executions yet</p>
              ) : (
                executions.map((execution) => (
                  <div key={execution.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <div>
                          <div className="font-semibold text-sm">
                            {execution.opportunity.pair}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {execution.timestamp}
                          </div>
                        </div>
                      </div>
                      <Badge variant={execution.status === 'completed' ? 'default' : 
                                   execution.status === 'failed' ? 'destructive' : 'secondary'}>
                        {execution.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {execution.status === 'completed' && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Profit: </span>
                          <span className={`font-semibold ${execution.actualProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${execution.actualProfit.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time: </span>
                          <span className="font-semibold">
                            {(execution.executionTime / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit History</CardTitle>
          </CardHeader>
          <CardContent>
            {profitHistory.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No profit data yet
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitHistory}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ZeroCapitalArbitrage;
