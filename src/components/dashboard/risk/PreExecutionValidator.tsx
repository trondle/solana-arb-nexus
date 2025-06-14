
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Target,
  Zap,
  Shield,
  Eye
} from 'lucide-react';

interface ValidationCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail' | 'checking';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  threshold?: number;
  currentValue?: number;
  enabled: boolean;
}

interface ValidationSettings {
  minProfitMargin: number;
  maxSlippageTolerance: number;
  minLiquidityDepth: number;
  maxGasPriceGwei: number;
  minConfidenceScore: number;
  enableStrictMode: boolean;
  enableMEVProtection: boolean;
  enableSandwichProtection: boolean;
}

const PreExecutionValidator = () => {
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [validationScore, setValidationScore] = useState(0);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  
  const [settings, setSettings] = useState<ValidationSettings>({
    minProfitMargin: 0.8,
    maxSlippageTolerance: 1.5,
    minLiquidityDepth: 50000,
    maxGasPriceGwei: 80,
    minConfidenceScore: 75,
    enableStrictMode: true,
    enableMEVProtection: true,
    enableSandwichProtection: true
  });

  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>([
    {
      id: 'profit_margin',
      name: 'Profit Margin Validation',
      status: 'pass',
      severity: 'critical',
      message: 'Expected profit margin exceeds minimum threshold',
      threshold: settings.minProfitMargin,
      currentValue: 1.2,
      enabled: true
    },
    {
      id: 'slippage_analysis',
      name: 'Slippage Impact Analysis',
      status: 'pass',
      severity: 'high',
      message: 'Estimated slippage within acceptable range',
      threshold: settings.maxSlippageTolerance,
      currentValue: 0.8,
      enabled: true
    },
    {
      id: 'liquidity_depth',
      name: 'Liquidity Depth Check',
      status: 'warning',
      severity: 'high',
      message: 'Liquidity depth adequate but close to threshold',
      threshold: settings.minLiquidityDepth,
      currentValue: 55000,
      enabled: true
    },
    {
      id: 'gas_price_check',
      name: 'Gas Price Validation',
      status: 'pass',
      severity: 'medium',
      message: 'Current gas prices within acceptable range',
      threshold: settings.maxGasPriceGwei,
      currentValue: 45,
      enabled: true
    },
    {
      id: 'market_conditions',
      name: 'Market Condition Analysis',
      status: 'pass',
      severity: 'medium',
      message: 'Market conditions favorable for execution',
      enabled: true
    },
    {
      id: 'mev_protection',
      name: 'MEV Protection Status',
      status: settings.enableMEVProtection ? 'pass' : 'warning',
      severity: 'critical',
      message: settings.enableMEVProtection ? 'MEV protection enabled' : 'MEV protection disabled',
      enabled: true
    },
    {
      id: 'sandwich_protection',
      name: 'Sandwich Attack Protection',
      status: settings.enableSandwichProtection ? 'pass' : 'warning',
      severity: 'high',
      message: settings.enableSandwichProtection ? 'Sandwich protection active' : 'Sandwich protection disabled',
      enabled: true
    },
    {
      id: 'timing_analysis',
      name: 'Execution Timing Analysis',
      status: 'pass',
      severity: 'low',
      message: 'Optimal execution timing window identified',
      enabled: true
    },
    {
      id: 'confidence_score',
      name: 'AI Confidence Score',
      status: 'pass',
      severity: 'medium',
      message: 'High confidence in successful execution',
      threshold: settings.minConfidenceScore,
      currentValue: 85,
      enabled: true
    }
  ]);

  useEffect(() => {
    // Update validation checks based on settings
    setValidationChecks(prev => prev.map(check => {
      let newStatus = check.status;
      let newMessage = check.message;

      switch (check.id) {
        case 'profit_margin':
          if (check.currentValue && check.currentValue < settings.minProfitMargin) {
            newStatus = 'fail';
            newMessage = `Profit margin ${check.currentValue}% below minimum ${settings.minProfitMargin}%`;
          } else {
            newStatus = 'pass';
            newMessage = 'Expected profit margin exceeds minimum threshold';
          }
          break;
        case 'slippage_analysis':
          if (check.currentValue && check.currentValue > settings.maxSlippageTolerance) {
            newStatus = 'warning';
            newMessage = `Slippage ${check.currentValue}% above tolerance ${settings.maxSlippageTolerance}%`;
          } else {
            newStatus = 'pass';
            newMessage = 'Estimated slippage within acceptable range';
          }
          break;
        case 'mev_protection':
          newStatus = settings.enableMEVProtection ? 'pass' : 'warning';
          newMessage = settings.enableMEVProtection ? 'MEV protection enabled' : 'MEV protection disabled';
          break;
        case 'sandwich_protection':
          newStatus = settings.enableSandwichProtection ? 'pass' : 'warning';
          newMessage = settings.enableSandwichProtection ? 'Sandwich protection active' : 'Sandwich protection disabled';
          break;
      }

      return { ...check, status: newStatus, message: newMessage };
    }));
  }, [settings]);

  useEffect(() => {
    // Calculate validation score
    const enabledChecks = validationChecks.filter(check => check.enabled);
    const passedChecks = enabledChecks.filter(check => check.status === 'pass').length;
    const warningChecks = enabledChecks.filter(check => check.status === 'warning').length;
    
    const score = ((passedChecks + warningChecks * 0.5) / enabledChecks.length) * 100;
    setValidationScore(Math.round(score));
  }, [validationChecks]);

  const runValidation = async () => {
    setValidationInProgress(true);
    
    // Simulate validation process
    for (let i = 0; i < validationChecks.length; i++) {
      if (!validationChecks[i].enabled) continue;
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setValidationChecks(prev => prev.map((check, index) => 
        index === i ? { ...check, status: 'checking' } : check
      ));
    }
    
    // Simulate final results with some randomness
    setValidationChecks(prev => prev.map(check => {
      if (!check.enabled) return check;
      
      const random = Math.random();
      let newStatus: 'pass' | 'warning' | 'fail' = 'pass';
      
      if (check.severity === 'critical' && random > 0.9) newStatus = 'fail';
      else if (check.severity === 'high' && random > 0.8) newStatus = 'warning';
      else if (random > 0.85) newStatus = 'warning';
      
      return { ...check, status: newStatus };
    }));
    
    setValidationInProgress(false);
    setLastValidation(new Date());
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canExecute = validationScore >= (settings.enableStrictMode ? 90 : 75) && 
                    !validationChecks.some(check => check.enabled && check.status === 'fail');

  return (
    <div className="space-y-6">
      {/* Validation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Pre-Execution Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-500">{validationScore}%</div>
              <div className="text-sm text-muted-foreground">Validation Score</div>
            </div>
            <div className="text-right">
              <Progress value={validationScore} className="w-32 mb-2" />
              <Badge variant={canExecute ? 'default' : 'destructive'}>
                {canExecute ? 'READY TO EXECUTE' : 'EXECUTION BLOCKED'}
              </Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={runValidation} 
              disabled={validationInProgress}
              className="flex-1"
            >
              {validationInProgress ? 'Validating...' : 'Run Validation'}
            </Button>
            {lastValidation && (
              <div className="text-xs text-muted-foreground self-center">
                Last run: {lastValidation.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Min Profit Margin (%)</label>
                  <span className="text-sm text-muted-foreground">{settings.minProfitMargin}%</span>
                </div>
                <Slider
                  value={[settings.minProfitMargin]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, minProfitMargin: value[0] }))}
                  min={0.1}
                  max={3.0}
                  step={0.1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Max Slippage Tolerance (%)</label>
                  <span className="text-sm text-muted-foreground">{settings.maxSlippageTolerance}%</span>
                </div>
                <Slider
                  value={[settings.maxSlippageTolerance]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, maxSlippageTolerance: value[0] }))}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Min Confidence Score (%)</label>
                  <span className="text-sm text-muted-foreground">{settings.minConfidenceScore}%</span>
                </div>
                <Slider
                  value={[settings.minConfidenceScore]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, minConfidenceScore: value[0] }))}
                  min={50}
                  max={95}
                  step={5}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Strict Mode</h4>
                  <p className="text-sm text-muted-foreground">Require 90%+ validation score</p>
                </div>
                <Switch 
                  checked={settings.enableStrictMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableStrictMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">MEV Protection</h4>
                  <p className="text-sm text-muted-foreground">Enable MEV attack protection</p>
                </div>
                <Switch 
                  checked={settings.enableMEVProtection}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableMEVProtection: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sandwich Protection</h4>
                  <p className="text-sm text-muted-foreground">Prevent sandwich attacks</p>
                </div>
                <Switch 
                  checked={settings.enableSandwichProtection}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSandwichProtection: checked }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationChecks.map((check) => (
              <div key={check.id} className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-semibold">{check.name}</div>
                      <div className="text-sm text-muted-foreground">{check.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(check.severity)}>
                      {check.severity.toUpperCase()}
                    </Badge>
                    <Switch 
                      checked={check.enabled}
                      onCheckedChange={(checked) => {
                        setValidationChecks(prev => prev.map(c => 
                          c.id === check.id ? { ...c, enabled: checked } : c
                        ));
                      }}
                      size="sm"
                    />
                  </div>
                </div>
                
                {check.threshold && check.currentValue && (
                  <div className="text-sm space-y-1 ml-7">
                    <div className="flex justify-between">
                      <span>Current: {check.currentValue}</span>
                      <span>Threshold: {check.threshold}</span>
                    </div>
                    <Progress 
                      value={Math.min((check.currentValue / check.threshold) * 100, 100)} 
                      className="h-1"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Readiness */}
      {!canExecute && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Execution Blocked:</strong> Resolve failed validations or lower strict mode requirements to proceed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PreExecutionValidator;
