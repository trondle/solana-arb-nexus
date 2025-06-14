
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  ZapOff, 
  Activity, 
  Clock, 
  TrendingDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface CircuitBreakerRule {
  id: string;
  name: string;
  threshold: number;
  timeWindow: number; // minutes
  currentValue: number;
  status: 'active' | 'triggered' | 'disabled';
  triggeredAt?: string;
  description: string;
}

interface EmergencyAction {
  id: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  autoExecute: boolean;
  executed: boolean;
  executedAt?: string;
}

const CircuitBreaker = () => {
  const [circuitBreakerEnabled, setCircuitBreakerEnabled] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [autoRecovery, setAutoRecovery] = useState(true);
  const [recoveryTime, setRecoveryTime] = useState([300]); // 5 minutes
  
  const [rules, setRules] = useState<CircuitBreakerRule[]>([
    {
      id: 'loss-threshold',
      name: 'Daily Loss Limit',
      threshold: 5, // 5%
      timeWindow: 1440, // 24 hours
      currentValue: 2.3,
      status: 'active',
      description: 'Triggers when daily losses exceed threshold'
    },
    {
      id: 'failed-trades',
      name: 'Failed Trade Rate',
      threshold: 25, // 25%
      timeWindow: 60, // 1 hour
      currentValue: 8.5,
      status: 'active',
      description: 'Triggers when trade failure rate is too high'
    },
    {
      id: 'gas-spike',
      name: 'Gas Price Spike',
      threshold: 150, // 150 gwei
      timeWindow: 30, // 30 minutes
      currentValue: 45,
      status: 'active',
      description: 'Triggers when gas prices spike unexpectedly'
    },
    {
      id: 'slippage-protection',
      name: 'High Slippage Events',
      threshold: 3, // 3%
      timeWindow: 15, // 15 minutes
      currentValue: 0.8,
      status: 'active',
      description: 'Triggers on consecutive high slippage trades'
    },
    {
      id: 'volume-anomaly',
      name: 'Volume Anomaly',
      threshold: 500, // 500% of normal
      timeWindow: 10, // 10 minutes
      currentValue: 120,
      status: 'active',
      description: 'Triggers on unusual trading volume patterns'
    }
  ]);

  const [emergencyActions, setEmergencyActions] = useState<EmergencyAction[]>([
    {
      id: 'stop-all-trades',
      action: 'Stop All Active Trades',
      priority: 'high',
      autoExecute: true,
      executed: false
    },
    {
      id: 'cancel-pending',
      action: 'Cancel Pending Orders',
      priority: 'high',
      autoExecute: true,
      executed: false
    },
    {
      id: 'liquidate-positions',
      action: 'Emergency Position Liquidation',
      priority: 'medium',
      autoExecute: false,
      executed: false
    },
    {
      id: 'notify-admin',
      action: 'Send Admin Notification',
      priority: 'high',
      autoExecute: true,
      executed: false
    },
    {
      id: 'backup-funds',
      action: 'Move Funds to Safe Wallet',
      priority: 'low',
      autoExecute: false,
      executed: false
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRules(prev => prev.map(rule => {
        const newValue = rule.currentValue + (Math.random() - 0.5) * 2;
        const status = newValue >= rule.threshold ? 'triggered' : 'active';
        
        return {
          ...rule,
          currentValue: Math.max(0, newValue),
          status: circuitBreakerEnabled ? status : 'disabled',
          triggeredAt: status === 'triggered' && rule.status !== 'triggered' 
            ? new Date().toLocaleTimeString() 
            : rule.triggeredAt
        };
      }));

      // Check if any critical rules are triggered
      const criticalTriggered = rules.some(rule => 
        rule.status === 'triggered' && ['loss-threshold', 'failed-trades'].includes(rule.id)
      );
      
      if (criticalTriggered && !emergencyMode && circuitBreakerEnabled) {
        setEmergencyMode(true);
        console.log('Circuit breaker triggered - entering emergency mode');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [rules, emergencyMode, circuitBreakerEnabled]);

  const executeEmergencyAction = async (actionId: string) => {
    setEmergencyActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, executed: true, executedAt: new Date().toLocaleTimeString() }
        : action
    ));
  };

  const resetCircuitBreaker = () => {
    setEmergencyMode(false);
    setRules(prev => prev.map(rule => ({ 
      ...rule, 
      status: 'active', 
      triggeredAt: undefined,
      currentValue: rule.currentValue * 0.5 // Reset to safer levels
    })));
    setEmergencyActions(prev => prev.map(action => ({ 
      ...action, 
      executed: false, 
      executedAt: undefined 
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'triggered': return 'text-red-500';
      case 'disabled': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Status */}
      {emergencyMode && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-semibold">
            <strong>EMERGENCY MODE ACTIVE:</strong> Circuit breaker has been triggered. All trading activities are suspended.
          </AlertDescription>
        </Alert>
      )}

      {/* Circuit Breaker Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Circuit Breaker System
            {emergencyMode && <ZapOff className="w-5 h-5 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Circuit Breaker Protection</h4>
              <p className="text-sm text-muted-foreground">
                Automatically halt trading when risk thresholds are exceeded
              </p>
            </div>
            <Switch 
              checked={circuitBreakerEnabled}
              onCheckedChange={setCircuitBreakerEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Recovery</h4>
              <p className="text-sm text-muted-foreground">
                Automatically resume trading after conditions normalize
              </p>
            </div>
            <Switch 
              checked={autoRecovery}
              onCheckedChange={setAutoRecovery}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Recovery Time</span>
              <span className="text-sm text-muted-foreground">{recoveryTime[0]} seconds</span>
            </div>
            <Slider
              value={recoveryTime}
              onValueChange={setRecoveryTime}
              max={1800}
              min={60}
              step={30}
              className="w-full"
            />
          </div>

          {emergencyMode && (
            <Button onClick={resetCircuitBreaker} className="w-full" variant="destructive">
              <RefreshCw className="w-4 h-4 mr-2" />
              Manual Reset Circuit Breaker
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Circuit Breaker Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Protection Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{rule.name}</div>
                    <div className="text-sm text-muted-foreground">{rule.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(rule.status)}>
                      {rule.status.toUpperCase()}
                    </Badge>
                    {rule.status === 'triggered' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: {rule.currentValue.toFixed(1)}</span>
                    <span>Threshold: {rule.threshold}</span>
                  </div>
                  <Progress 
                    value={(rule.currentValue / rule.threshold) * 100} 
                    className={`h-2 ${rule.currentValue >= rule.threshold ? 'bg-red-100' : ''}`}
                  />
                </div>

                {rule.triggeredAt && (
                  <div className="text-xs text-red-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Triggered at {rule.triggeredAt}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Emergency Response Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-semibold">{action.action}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority.toUpperCase()}
                      </Badge>
                      {action.autoExecute && (
                        <Badge variant="outline">Auto-Execute</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {action.executed ? (
                    <div className="text-sm text-green-600">
                      Executed at {action.executedAt}
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => executeEmergencyAction(action.id)}
                      disabled={!emergencyMode && action.autoExecute}
                      variant={action.priority === 'high' ? 'destructive' : 'outline'}
                    >
                      Execute
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CircuitBreaker;
