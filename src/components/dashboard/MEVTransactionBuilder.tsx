
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Hammer, 
  Route, 
  Shield, 
  Zap, 
  DollarSign, 
  Clock, 
  Eye,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Settings,
  Code,
  TrendingUp
} from 'lucide-react';

interface TransactionStep {
  id: string;
  type: 'swap' | 'liquidity' | 'bridge' | 'flashloan';
  protocol: string;
  from: string;
  to: string;
  amount: number;
  estimatedGas: number;
  priority: number;
}

interface RouteOption {
  id: string;
  path: string[];
  totalGas: number;
  expectedProfit: number;
  mevRisk: number;
  successProbability: number;
  estimatedTime: number;
  protocolFees: number;
}

interface TransactionBundle {
  id: string;
  steps: TransactionStep[];
  totalValue: number;
  estimatedProfit: number;
  gasLimit: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  mevProtection: boolean;
  status: 'draft' | 'ready' | 'building' | 'completed';
}

interface MEVProtectionSettings {
  privateMempool: boolean;
  flashbotsRelay: boolean;
  priorityFee: number;
  maxSlippage: number;
  frontrunProtection: boolean;
  sandwichProtection: boolean;
  commitReveal: boolean;
}

const MEVTransactionBuilder = () => {
  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>([]);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [transactionBundle, setTransactionBundle] = useState<TransactionBundle | null>(null);
  
  const [mevSettings, setMEVSettings] = useState<MEVProtectionSettings>({
    privateMempool: true,
    flashbotsRelay: true,
    priorityFee: 0.01,
    maxSlippage: 1.0,
    frontrunProtection: true,
    sandwichProtection: true,
    commitReveal: false
  });

  const [buildingProgress, setBuildingProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildHistory, setBuildHistory] = useState<any[]>([]);

  // Form inputs
  const [inputToken, setInputToken] = useState('SOL');
  const [outputToken, setOutputToken] = useState('USDC');
  const [amount, setAmount] = useState('100');
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    const generateRouteOptions = (): RouteOption[] => {
      const routes = [
        {
          id: 'route-1',
          path: ['Raydium', 'Orca'],
          totalGas: 0.005,
          expectedProfit: 2.5,
          mevRisk: 15,
          successProbability: 92,
          estimatedTime: 2.1,
          protocolFees: 0.003
        },
        {
          id: 'route-2',
          path: ['Jupiter', 'Serum'],
          totalGas: 0.007,
          expectedProfit: 2.1,
          mevRisk: 25,
          successProbability: 88,
          estimatedTime: 1.8,
          protocolFees: 0.0025
        },
        {
          id: 'route-3',
          path: ['Orca', 'Saber', 'Raydium'],
          totalGas: 0.009,
          expectedProfit: 3.2,
          mevRisk: 35,
          successProbability: 85,
          estimatedTime: 3.5,
          protocolFees: 0.005
        },
        {
          id: 'route-4',
          path: ['Direct', 'Whirlpool'],
          totalGas: 0.004,
          expectedProfit: 1.8,
          mevRisk: 10,
          successProbability: 95,
          estimatedTime: 1.2,
          protocolFees: 0.002
        }
      ];

      return routes.sort((a, b) => b.expectedProfit - a.expectedProfit);
    };

    const generateTransactionSteps = (routeId: string): TransactionStep[] => {
      if (!routeId) return [];

      const route = routeOptions.find(r => r.id === routeId);
      if (!route) return [];

      return route.path.map((protocol, index) => ({
        id: `step-${index}`,
        type: index === 0 ? 'flashloan' : 'swap',
        protocol,
        from: index === 0 ? inputToken : 'intermediate',
        to: index === route.path.length - 1 ? outputToken : 'intermediate',
        amount: parseFloat(amount) || 100,
        estimatedGas: 0.002 + Math.random() * 0.003,
        priority: index
      }));
    };

    setRouteOptions(generateRouteOptions());
    if (selectedRoute) {
      setTransactionSteps(generateTransactionSteps(selectedRoute));
    }
  }, [selectedRoute, inputToken, outputToken, amount]);

  const buildTransaction = async () => {
    if (!selectedRoute || transactionSteps.length === 0) return;

    setIsBuilding(true);
    setBuildingProgress(0);

    const steps = ['Analyzing route', 'Building instructions', 'Applying MEV protection', 'Optimizing gas', 'Finalizing bundle'];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBuildingProgress((i + 1) * 20);
    }

    const route = routeOptions.find(r => r.id === selectedRoute)!;
    const bundle: TransactionBundle = {
      id: `bundle-${Date.now()}`,
      steps: transactionSteps,
      totalValue: parseFloat(amount) || 100,
      estimatedProfit: route.expectedProfit,
      gasLimit: Math.ceil(route.totalGas * 1000000),
      priority: route.mevRisk > 30 ? 'urgent' : route.mevRisk > 20 ? 'high' : 'medium',
      mevProtection: mevSettings.privateMempool,
      status: 'ready'
    };

    setTransactionBundle(bundle);
    setBuildHistory(prev => [...prev.slice(-4), {
      timestamp: new Date().toLocaleTimeString(),
      bundle: bundle.id,
      profit: bundle.estimatedProfit,
      status: 'completed'
    }]);

    setIsBuilding(false);
  };

  const executeTransaction = async () => {
    if (!transactionBundle) return;

    setTransactionBundle(prev => prev ? { ...prev, status: 'building' } : null);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setTransactionBundle(prev => prev ? { ...prev, status: 'completed' } : null);
  };

  const getRiskColor = (risk: number) => {
    if (risk < 20) return 'text-green-500';
    if (risk < 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Transaction Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hammer className="w-5 h-5" />
            Transaction Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="input-token">Input Token</Label>
              <Input
                id="input-token"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="SOL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output-token">Output Token</Label>
              <Input
                id="output-token"
                value={outputToken}
                onChange={(e) => setOutputToken(e.target.value)}
                placeholder="USDC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                type="number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Add custom transaction logic or constraints..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Route Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Route Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routeOptions.map((route) => (
              <div 
                key={route.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedRoute === route.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRoute(route.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedRoute === route.id ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className="font-semibold">
                      {route.path.join(' → ')}
                    </div>
                  </div>
                  <Badge variant={route.expectedProfit > 2.5 ? 'default' : 'secondary'}>
                    ${route.expectedProfit.toFixed(2)} profit
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">MEV Risk</div>
                    <div className={`font-semibold ${getRiskColor(route.mevRisk)}`}>
                      {route.mevRisk}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Success Rate</div>
                    <div className="font-semibold">{route.successProbability}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Est. Time</div>
                    <div className="font-semibold">{route.estimatedTime}s</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Gas</div>
                    <div className="font-semibold">{route.totalGas.toFixed(4)} SOL</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MEV Protection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            MEV Protection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Private Mempool</label>
                  <p className="text-xs text-muted-foreground">Route through private mempool</p>
                </div>
                <Switch 
                  checked={mevSettings.privateMempool}
                  onCheckedChange={(checked) => setMEVSettings(prev => ({ ...prev, privateMempool: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Flashbots Relay</label>
                  <p className="text-xs text-muted-foreground">Use Flashbots for submission</p>
                </div>
                <Switch 
                  checked={mevSettings.flashbotsRelay}
                  onCheckedChange={(checked) => setMEVSettings(prev => ({ ...prev, flashbotsRelay: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Frontrun Protection</label>
                  <p className="text-xs text-muted-foreground">Prevent frontrunning attacks</p>
                </div>
                <Switch 
                  checked={mevSettings.frontrunProtection}
                  onCheckedChange={(checked) => setMEVSettings(prev => ({ ...prev, frontrunProtection: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Priority Fee (SOL)</label>
                  <span className="text-sm text-muted-foreground">{mevSettings.priorityFee.toFixed(4)}</span>
                </div>
                <Slider
                  value={[mevSettings.priorityFee]}
                  onValueChange={(value) => setMEVSettings(prev => ({ ...prev, priorityFee: value[0] }))}
                  min={0.001}
                  max={0.1}
                  step={0.001}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Max Slippage (%)</label>
                  <span className="text-sm text-muted-foreground">{mevSettings.maxSlippage}%</span>
                </div>
                <Slider
                  value={[mevSettings.maxSlippage]}
                  onValueChange={(value) => setMEVSettings(prev => ({ ...prev, maxSlippage: value[0] }))}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Steps */}
      {transactionSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Transaction Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactionSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{step.protocol}</div>
                    <div className="text-sm text-muted-foreground">
                      {step.type.toUpperCase()}: {step.from} → {step.to}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">${step.amount.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      Gas: {step.estimatedGas.toFixed(4)} SOL
                    </div>
                  </div>
                  {index < transactionSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Build Transaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Transaction Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBuilding && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Building transaction...</span>
                <span>{buildingProgress}%</span>
              </div>
              <Progress value={buildingProgress} />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={buildTransaction}
              disabled={!selectedRoute || isBuilding}
              className="flex-1"
            >
              {isBuilding ? 'Building...' : 'Build Transaction'}
            </Button>
            
            {transactionBundle && (
              <Button 
                onClick={executeTransaction}
                disabled={transactionBundle.status === 'building'}
                variant={transactionBundle.status === 'ready' ? 'default' : 'secondary'}
              >
                {transactionBundle.status === 'building' ? 'Executing...' : 'Execute'}
              </Button>
            )}
          </div>

          {transactionBundle && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Transaction bundle ready! Expected profit: ${transactionBundle.estimatedProfit.toFixed(2)}, 
                Gas limit: {transactionBundle.gasLimit.toLocaleString()}, 
                Priority: {transactionBundle.priority}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Build History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Build History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {buildHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transaction builds yet</p>
          ) : (
            <div className="space-y-2">
              {buildHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono">{entry.bundle}</div>
                    <Badge variant="outline">{entry.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{entry.timestamp}</span>
                    <span className="font-semibold text-green-600">+${entry.profit.toFixed(2)}</span>
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

export default MEVTransactionBuilder;
