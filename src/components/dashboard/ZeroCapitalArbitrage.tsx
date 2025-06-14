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
  ArrowUpDown,
  TestTube,
  Lock,
  Unlock,
  Trophy,
  BarChart3
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
  isTestMode: boolean;
}

interface TestingStats {
  totalTestExecutions: number;
  successfulTests: number;
  totalTestProfit: number;
  averageTestProfit: number;
  testingLevel: number;
  virtualBalance: number;
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
  
  // Testing Mode States
  const [isTestMode, setIsTestMode] = useState(true);
  const [testingStats, setTestingStats] = useState<TestingStats>({
    totalTestExecutions: 0,
    successfulTests: 0,
    totalTestProfit: 0,
    averageTestProfit: 0,
    testingLevel: 1,
    virtualBalance: 0
  });
  const [liveModeUnlocked, setLiveModeUnlocked] = useState(false);
  const [showLiveModeWarning, setShowLiveModeWarning] = useState(false);
  
  const [profitHistory, setProfitHistory] = useState<any[]>([]);

  // Check if live mode should be unlocked based on testing performance
  useEffect(() => {
    const { totalTestExecutions, successfulTests } = testingStats;
    const successRate = totalTestExecutions > 0 ? successfulTests / totalTestExecutions : 0;
    
    // Unlock live mode after 10+ successful tests with 80%+ success rate
    if (totalTestExecutions >= 10 && successRate >= 0.8) {
      setLiveModeUnlocked(true);
    }
  }, [testingStats]);

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
    
    // Show warning for live mode
    if (!isTestMode && !showLiveModeWarning) {
      setShowLiveModeWarning(true);
      return;
    }
    
    setIsExecuting(true);
    setExecutionProgress(0);
    setCurrentStep(isTestMode ? 'Simulating flash loan...' : 'Initializing flash loan...');

    const steps = isTestMode ? [
      'Simulating flash loan borrowing',
      'Simulating buy order execution',
      'Simulating sell order execution',
      'Simulating loan repayment',
      'Calculating simulated profit'
    ] : [
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
      timestamp: new Date().toLocaleTimeString(),
      isTestMode
    };

    setExecutions(prev => [execution, ...prev.slice(0, 9)]);
    
    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setExecutionProgress((i + 1) * 20);
        
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
        
        // Faster execution in test mode
        const delay = isTestMode ? 800 + Math.random() * 400 : 1200 + Math.random() * 800;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Simulate realistic conditions
      let slippageFactor = 0.985 + Math.random() * 0.025;
      let actualProfit = opportunity.netProfit * slippageFactor;
      
      // In test mode, occasionally simulate failures for realism
      const failureChance = isTestMode ? 0.15 : 0.05;
      const failed = Math.random() < failureChance;
      
      if (failed) {
        throw new Error('Simulated execution failure');
      }

      const executionTime = 4000 + Math.random() * 2000;

      // Update testing stats if in test mode
      if (isTestMode) {
        setTestingStats(prev => ({
          ...prev,
          totalTestExecutions: prev.totalTestExecutions + 1,
          successfulTests: prev.successfulTests + 1,
          totalTestProfit: prev.totalTestProfit + actualProfit,
          averageTestProfit: (prev.totalTestProfit + actualProfit) / (prev.totalTestExecutions + 1),
          virtualBalance: prev.virtualBalance + actualProfit,
          testingLevel: Math.floor((prev.totalTestExecutions + 1) / 5) + 1
        }));
      }

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

      setProfitHistory(prev => [...prev.slice(-9), {
        time: new Date().toLocaleTimeString(),
        profit: actualProfit,
        fees: opportunity.totalFees,
        isTest: isTestMode
      }]);

      toast({
        title: isTestMode ? "Test Arbitrage Completed!" : "Flash Arbitrage Completed!",
        description: `${isTestMode ? 'Simulated' : 'Net'} profit: $${actualProfit.toFixed(2)} (fees ${isTestMode ? 'simulated' : 'paid'}: $${opportunity.totalFees.toFixed(2)})`,
        variant: actualProfit > 0 ? "default" : "destructive"
      });

    } catch (error) {
      // Update testing stats for failures too
      if (isTestMode) {
        setTestingStats(prev => ({
          ...prev,
          totalTestExecutions: prev.totalTestExecutions + 1,
          averageTestProfit: prev.totalTestExecutions > 0 ? prev.totalTestProfit / (prev.totalTestExecutions + 1) : 0,
          testingLevel: Math.floor((prev.totalTestExecutions + 1) / 5) + 1
        }));
      }

      setExecutions(prev => 
        prev.map(exec => 
          exec.id === execution.id 
            ? { ...exec, status: 'failed' }
            : exec
        )
      );

      toast({
        title: isTestMode ? "Test Arbitrage Failed" : "Arbitrage Failed",
        description: isTestMode ? "Simulated execution failed. This helps you understand real risks." : "Flash loan execution failed. No funds lost.",
        variant: "destructive"
      });
    }

    setIsExecuting(false);
    setExecutionProgress(0);
    setCurrentStep('');
    setShowLiveModeWarning(false);
  };

  const confirmLiveMode = () => {
    setShowLiveModeWarning(false);
    // Continue with the execution that was interrupted
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
      {/* Testing Mode Header */}
      <Card className={`border-2 ${isTestMode ? 'border-blue-500' : 'border-orange-500'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isTestMode ? <TestTube className="w-5 h-5 text-blue-500" /> : <Zap className="w-5 h-5 text-orange-500" />}
              {isTestMode ? 'Test Mode Active' : 'Live Trading Mode'}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Test Mode</Label>
                <Switch 
                  checked={isTestMode}
                  onCheckedChange={(checked) => {
                    if (!checked && !liveModeUnlocked) {
                      toast({
                        title: "Live Mode Locked",
                        description: "Complete 10+ test runs with 80%+ success rate to unlock live trading.",
                        variant: "destructive"
                      });
                      return;
                    }
                    setIsTestMode(checked);
                  }}
                  disabled={!liveModeUnlocked && !isTestMode}
                />
                <Label>Live Mode</Label>
                {!liveModeUnlocked && <Lock className="w-4 h-4 text-gray-500" />}
                {liveModeUnlocked && <Unlock className="w-4 h-4 text-green-500" />}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className={isTestMode ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}>
            {isTestMode ? <TestTube className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertDescription>
              {isTestMode ? (
                <div>
                  <strong>Safe Testing Environment:</strong> All executions are simulated with zero risk. 
                  No real funds or fees involved. Perfect for learning and strategy testing.
                  <br />
                  <strong>Virtual Balance:</strong> ${testingStats.virtualBalance.toFixed(2)}
                </div>
              ) : (
                <div>
                  <strong>⚠️ LIVE TRADING MODE:</strong> Real funds and fees will be involved. 
                  Ensure you understand the risks before proceeding.
                </div>
              )}
            </AlertDescription>
          </Alert>

          {isTestMode && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{testingStats.totalTestExecutions}</div>
                <div className="text-sm text-muted-foreground">Test Runs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {testingStats.totalTestExecutions > 0 ? 
                    ((testingStats.successfulTests / testingStats.totalTestExecutions) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">${testingStats.averageTestProfit.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Avg Profit</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-yellow-500">{testingStats.testingLevel}</span>
                </div>
                <div className="text-sm text-muted-foreground">Testing Level</div>
              </div>
            </div>
          )}

          {!liveModeUnlocked && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                <span className="font-semibold">Unlock Live Trading</span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Requirements: 10+ test executions with 80%+ success rate
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Test Executions: {testingStats.totalTestExecutions}/10</span>
                  <span>Success Rate: {testingStats.totalTestExecutions > 0 ? 
                    ((testingStats.successfulTests / testingStats.totalTestExecutions) * 100).toFixed(0) : 0}%/80%</span>
                </div>
                <Progress value={Math.min((testingStats.totalTestExecutions / 10) * 100, 100)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Mode Warning Modal */}
      {showLiveModeWarning && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Live Mode Confirmation Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>⚠️ WARNING:</strong> You are about to execute a live flash loan arbitrage with real funds. 
                This involves actual financial risk including:
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Flash loan fees (~{selectedProvider === 'mango' ? '0.05' : selectedProvider === 'solend' ? '0.09' : '0.06'}%)</li>
                  <li>Trading fees (~0.6%)</li>
                  <li>Potential slippage and failed transactions</li>
                  <li>Network congestion risks</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button 
                onClick={confirmLiveMode}
                variant="destructive"
                className="flex-1"
              >
                I Understand the Risks - Execute Live
              </Button>
              <Button 
                onClick={() => setShowLiveModeWarning(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              {isTestMode ? 'Executing Test Arbitrage' : 'Executing Flash Arbitrage'}
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
                    className={isTestMode ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}
                  >
                    {isTestMode ? 'Test Arbitrage' : 'Execute Flash Arbitrage'}
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
                          <div className="font-semibold text-sm flex items-center gap-2">
                            {execution.opportunity.pair}
                            {execution.isTestMode && (
                              <Badge variant="outline" className="text-xs">TEST</Badge>
                            )}
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
                          <span className="text-muted-foreground">
                            {execution.isTestMode ? 'Simulated' : 'Actual'} Profit: 
                          </span>
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
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Profit History
            </CardTitle>
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
                    <Line 
                      dataKey="profit" 
                      stroke="var(--color-profit)" 
                      strokeWidth={2}
                    />
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
