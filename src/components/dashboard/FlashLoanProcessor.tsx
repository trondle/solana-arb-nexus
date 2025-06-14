
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Zap, DollarSign, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlashLoanProvider {
  name: string;
  maxAmount: number;
  fee: number;
  available: boolean;
  latency: number;
}

interface FlashLoanExecution {
  id: string;
  amount: number;
  provider: string;
  token: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  profit: number;
  fee: number;
  duration: number;
  timestamp: string;
}

interface LoanMetrics {
  totalExecuted: number;
  successRate: number;
  averageProfit: number;
  totalVolume: number;
  averageFee: number;
  averageDuration: number;
}

const FlashLoanProcessor = () => {
  const { toast } = useToast();
  
  const [providers] = useState<FlashLoanProvider[]>([
    { name: 'Solend', maxAmount: 1000000, fee: 0.09, available: true, latency: 150 },
    { name: 'Mango', maxAmount: 500000, fee: 0.05, available: true, latency: 120 },
    { name: 'Tulip', maxAmount: 750000, fee: 0.08, available: false, latency: 180 },
    { name: 'Francium', maxAmount: 300000, fee: 0.06, available: true, latency: 110 }
  ]);

  const [executions, setExecutions] = useState<FlashLoanExecution[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('solend');
  const [loanAmount, setLoanAmount] = useState(10000);
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoExecution, setAutoExecution] = useState(false);

  const [metrics, setMetrics] = useState<LoanMetrics>({
    totalExecuted: 0,
    successRate: 0,
    averageProfit: 0,
    totalVolume: 0,
    averageFee: 0,
    averageDuration: 0
  });

  useEffect(() => {
    // Generate sample executions
    const generateExecutions = () => {
      const tokens = ['USDC', 'SOL', 'USDT', 'ETH'];
      const providerNames = ['Solend', 'Mango', 'Francium'];
      const statuses: ('completed' | 'failed')[] = ['completed', 'failed'];
      
      const sampleExecutions: FlashLoanExecution[] = [];
      
      for (let i = 0; i < 8; i++) {
        const amount = 5000 + Math.random() * 50000;
        const provider = providerNames[Math.floor(Math.random() * providerNames.length)];
        const token = tokens[Math.floor(Math.random() * tokens.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const fee = amount * (0.05 + Math.random() * 0.04) / 100;
        const profit = status === 'completed' ? amount * (0.1 + Math.random() * 0.4) / 100 : 0;
        
        sampleExecutions.push({
          id: `loan-${i}`,
          amount,
          provider,
          token,
          status,
          profit: profit - fee,
          fee,
          duration: 2000 + Math.random() * 3000,
          timestamp: new Date(Date.now() - i * 3600000).toLocaleTimeString()
        });
      }
      
      return sampleExecutions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    };

    const updateMetrics = (executions: FlashLoanExecution[]) => {
      const completed = executions.filter(e => e.status === 'completed');
      const total = executions.length;
      
      setMetrics({
        totalExecuted: total,
        successRate: total > 0 ? (completed.length / total) * 100 : 0,
        averageProfit: completed.length > 0 ? completed.reduce((sum, e) => sum + e.profit, 0) / completed.length : 0,
        totalVolume: executions.reduce((sum, e) => sum + e.amount, 0),
        averageFee: executions.length > 0 ? executions.reduce((sum, e) => sum + e.fee, 0) / executions.length : 0,
        averageDuration: executions.length > 0 ? executions.reduce((sum, e) => sum + e.duration, 0) / executions.length : 0
      });
    };

    const initialExecutions = generateExecutions();
    setExecutions(initialExecutions);
    updateMetrics(initialExecutions);
  }, []);

  const executeFlashLoan = async () => {
    setIsProcessing(true);
    
    const newExecution: FlashLoanExecution = {
      id: `loan-${Date.now()}`,
      amount: loanAmount,
      provider: selectedProvider,
      token: selectedToken,
      status: 'pending',
      profit: 0,
      fee: loanAmount * (providers.find(p => p.name.toLowerCase() === selectedProvider)?.fee || 0.05) / 100,
      duration: 0,
      timestamp: new Date().toLocaleTimeString()
    };

    setExecutions(prev => [newExecution, ...prev]);

    // Simulate execution process
    setTimeout(() => {
      setExecutions(prev => 
        prev.map(e => 
          e.id === newExecution.id 
            ? { ...e, status: 'executing' }
            : e
        )
      );
    }, 500);

    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      const profit = success ? loanAmount * (0.15 + Math.random() * 0.3) / 100 : 0;
      const duration = 2000 + Math.random() * 2000;
      
      setExecutions(prev => 
        prev.map(e => 
          e.id === newExecution.id 
            ? { 
                ...e, 
                status: success ? 'completed' : 'failed',
                profit: profit - e.fee,
                duration
              }
            : e
        )
      );

      setIsProcessing(false);
      
      toast({
        title: success ? "Flash Loan Executed Successfully" : "Flash Loan Failed",
        description: success 
          ? `Profit: $${(profit - newExecution.fee).toFixed(2)}` 
          : "Execution failed due to market conditions",
        variant: success ? "default" : "destructive"
      });
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'executing':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'executing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const chartData = executions.slice(0, 6).map((exec, index) => ({
    name: `Loan ${index + 1}`,
    profit: exec.profit,
    fee: exec.fee
  }));

  const statusData = [
    { name: 'Completed', value: executions.filter(e => e.status === 'completed').length, color: '#22c55e' },
    { name: 'Failed', value: executions.filter(e => e.status === 'failed').length, color: '#ef4444' },
    { name: 'Processing', value: executions.filter(e => ['pending', 'executing'].includes(e.status)).length, color: '#3b82f6' }
  ];

  const chartConfig = {
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-1))",
    },
    fee: {
      label: "Fee",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalExecuted}</div>
            <p className="text-xs text-muted-foreground">
              Flash loans processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <Progress value={metrics.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per successful loan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.averageDuration / 1000).toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              Execution time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flash Loan Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Execute Flash Loan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
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
                <Label htmlFor="token">Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
                min="1000"
                max="1000000"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Fee: ${((loanAmount * (providers.find(p => p.name.toLowerCase() === selectedProvider)?.fee || 0.05)) / 100).toFixed(2)}
              </div>
            </div>

            <Button 
              onClick={executeFlashLoan} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Execute Flash Loan'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {providers.map(provider => (
                <div key={provider.name} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {provider.name}
                      <div className={`w-2 h-2 rounded-full ${provider.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Max: ${provider.maxAmount.toLocaleString()} | Fee: {provider.fee}%
                    </div>
                  </div>
                  <Badge variant={provider.available ? 'default' : 'secondary'}>
                    {provider.latency}ms
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit vs Fee Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="profit" fill="var(--color-profit)" />
                  <Bar dataKey="fee" fill="var(--color-fee)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Flash Loan Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {executions.slice(0, 6).map(execution => (
              <div key={execution.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="font-semibold">
                        ${execution.amount.toLocaleString()} {execution.token}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {execution.provider} • {execution.timestamp}
                      </div>
                    </div>
                  </div>
                  <Badge variant={execution.status === 'completed' ? 'default' : execution.status === 'failed' ? 'destructive' : 'secondary'}>
                    {execution.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Profit</div>
                    <div className={`font-semibold ${execution.profit > 0 ? 'text-green-500' : execution.profit < 0 ? 'text-red-500' : ''}`}>
                      ${execution.profit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Fee</div>
                    <div className="font-semibold">
                      ${execution.fee.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-semibold">
                      {execution.duration > 0 ? `${(execution.duration / 1000).toFixed(1)}s` : '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashLoanProcessor;
