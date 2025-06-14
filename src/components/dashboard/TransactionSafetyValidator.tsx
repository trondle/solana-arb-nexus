
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Fuel, 
  Waves,
  Eye,
  Target,
  TrendingDown
} from 'lucide-react';

interface SafetyCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail' | 'checking';
  description: string;
  details?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface TransactionRisk {
  mevRisk: number;
  slippageRisk: number;
  liquidityRisk: number;
  gasRisk: number;
  overallRisk: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationSettings {
  maxSlippage: number;
  maxGasPrice: number;
  minLiquidity: number;
  mevProtection: boolean;
  frontrunProtection: boolean;
  sandwichProtection: boolean;
}

const TransactionSafetyValidator = () => {
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck[]>([]);
  const [transactionRisk, setTransactionRisk] = useState<TransactionRisk>({
    mevRisk: 0,
    slippageRisk: 0,
    liquidityRisk: 0,
    gasRisk: 0,
    overallRisk: 0,
    riskLevel: 'low'
  });
  
  const [settings, setSettings] = useState<ValidationSettings>({
    maxSlippage: 1.0,
    maxGasPrice: 50,
    minLiquidity: 100000,
    mevProtection: true,
    frontrunProtection: true,
    sandwichProtection: true
  });

  const [isValidating, setIsValidating] = useState(false);
  const [validationHistory, setValidationHistory] = useState<any[]>([]);

  useEffect(() => {
    const generateSafetyChecks = (): SafetyCheck[] => {
      const checks: SafetyCheck[] = [
        {
          id: 'slippage',
          name: 'Slippage Protection',
          status: Math.random() > 0.8 ? 'warning' : 'pass',
          description: 'Validates expected slippage against tolerance',
          details: `Expected: ${(Math.random() * 2).toFixed(2)}%, Max: ${settings.maxSlippage}%`,
          severity: 'medium'
        },
        {
          id: 'liquidity',
          name: 'Liquidity Check',
          status: Math.random() > 0.9 ? 'fail' : 'pass',
          description: 'Ensures sufficient liquidity for execution',
          details: `Available: $${(50000 + Math.random() * 200000).toFixed(0)}, Required: $${settings.minLiquidity.toFixed(0)}`,
          severity: 'high'
        },
        {
          id: 'gas',
          name: 'Gas Price Validation',
          status: Math.random() > 0.7 ? 'warning' : 'pass',
          description: 'Validates current gas prices against limits',
          details: `Current: ${(20 + Math.random() * 40).toFixed(1)} gwei, Max: ${settings.maxGasPrice} gwei`,
          severity: 'medium'
        },
        {
          id: 'mev',
          name: 'MEV Protection',
          status: settings.mevProtection ? (Math.random() > 0.85 ? 'warning' : 'pass') : 'fail',
          description: 'Protects against MEV attacks and frontrunning',
          details: settings.mevProtection ? 'Private mempool routing enabled' : 'MEV protection disabled',
          severity: 'critical'
        },
        {
          id: 'sandwich',
          name: 'Sandwich Attack Protection',
          status: settings.sandwichProtection ? 'pass' : 'warning',
          description: 'Prevents sandwich attacks on large trades',
          details: settings.sandwichProtection ? 'Active protection enabled' : 'Protection disabled',
          severity: 'high'
        },
        {
          id: 'timing',
          name: 'Timing Analysis',
          status: Math.random() > 0.6 ? 'pass' : 'warning',
          description: 'Analyzes optimal execution timing',
          details: `Network congestion: ${Math.random() > 0.5 ? 'Low' : 'Medium'}`,
          severity: 'low'
        }
      ];

      return checks;
    };

    const calculateRisk = (): TransactionRisk => {
      const mevRisk = settings.mevProtection ? 15 + Math.random() * 20 : 60 + Math.random() * 30;
      const slippageRisk = 10 + Math.random() * 40;
      const liquidityRisk = 5 + Math.random() * 30;
      const gasRisk = 20 + Math.random() * 35;
      
      const overallRisk = (mevRisk + slippageRisk + liquidityRisk + gasRisk) / 4;
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (overallRisk > 70) riskLevel = 'critical';
      else if (overallRisk > 50) riskLevel = 'high';
      else if (overallRisk > 30) riskLevel = 'medium';

      return {
        mevRisk,
        slippageRisk,
        liquidityRisk,
        gasRisk,
        overallRisk,
        riskLevel
      };
    };

    setSafetyChecks(generateSafetyChecks());
    setTransactionRisk(calculateRisk());

    const interval = setInterval(() => {
      setSafetyChecks(generateSafetyChecks());
      setTransactionRisk(calculateRisk());
    }, 5000);

    return () => clearInterval(interval);
  }, [settings]);

  const runValidation = async () => {
    setIsValidating(true);
    
    // Simulate validation process
    const steps = ['Analyzing transaction', 'Checking liquidity', 'Validating gas', 'MEV protection', 'Final assessment'];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSafetyChecks(prev => prev.map(check => ({ ...check, status: 'checking' })));
    }
    
    // Generate final results
    setSafetyChecks(prev => prev.map(check => ({
      ...check,
      status: Math.random() > 0.8 ? 'warning' : 'pass'
    })));
    
    setValidationHistory(prev => [...prev.slice(-4), {
      timestamp: new Date().toLocaleTimeString(),
      result: 'validated',
      riskLevel: transactionRisk.riskLevel
    }]);
    
    setIsValidating(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'fail':
        return 'border-red-200 bg-red-50';
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-orange-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(transactionRisk.riskLevel)}`}>
              {transactionRisk.riskLevel.toUpperCase()}
            </div>
            <Progress value={transactionRisk.overallRisk} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {transactionRisk.overallRisk.toFixed(1)}% risk score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MEV Risk</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionRisk.mevRisk.toFixed(0)}%</div>
            <Progress value={transactionRisk.mevRisk} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slippage Risk</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionRisk.slippageRisk.toFixed(0)}%</div>
            <Progress value={transactionRisk.slippageRisk} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Risk</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionRisk.gasRisk.toFixed(0)}%</div>
            <Progress value={transactionRisk.gasRisk} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Safety Checks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Safety Validation Checks
            </CardTitle>
            <Button onClick={runValidation} disabled={isValidating}>
              {isValidating ? 'Validating...' : 'Run Validation'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safetyChecks.map((check) => (
              <div key={check.id} className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-semibold">{check.name}</div>
                      <div className="text-sm text-muted-foreground">{check.description}</div>
                    </div>
                  </div>
                  <Badge variant={check.severity === 'critical' ? 'destructive' : check.severity === 'high' ? 'default' : 'secondary'}>
                    {check.severity}
                  </Badge>
                </div>
                {check.details && (
                  <div className="text-sm text-muted-foreground ml-7">
                    {check.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5" />
            Protection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">MEV Protection</label>
                <Switch 
                  checked={settings.mevProtection}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, mevProtection: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Frontrun Protection</label>
                <Switch 
                  checked={settings.frontrunProtection}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, frontrunProtection: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sandwich Protection</label>
                <Switch 
                  checked={settings.sandwichProtection}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sandwichProtection: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Max Slippage (%)</label>
                  <span className="text-sm text-muted-foreground">{settings.maxSlippage}%</span>
                </div>
                <Slider
                  value={[settings.maxSlippage]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, maxSlippage: value[0] }))}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Max Gas Price (gwei)</label>
                  <span className="text-sm text-muted-foreground">{settings.maxGasPrice}</span>
                </div>
                <Slider
                  value={[settings.maxGasPrice]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, maxGasPrice: value[0] }))}
                  min={10}
                  max={200}
                  step={5}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Min Liquidity ($)</label>
                  <span className="text-sm text-muted-foreground">${settings.minLiquidity.toLocaleString()}</span>
                </div>
                <Slider
                  value={[settings.minLiquidity]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, minLiquidity: value[0] }))}
                  min={10000}
                  max={1000000}
                  step={10000}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Recent Validations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validationHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent validations</p>
          ) : (
            <div className="space-y-2">
              {validationHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{entry.timestamp}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.riskLevel === 'low' ? 'default' : entry.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                      {entry.riskLevel}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{entry.result}</span>
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

export default TransactionSafetyValidator;
