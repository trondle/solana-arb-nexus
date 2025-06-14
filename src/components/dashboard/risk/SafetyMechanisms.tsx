
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Zap,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Layers,
  Activity
} from 'lucide-react';

interface SafetyLayer {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: 'active' | 'triggered' | 'disabled';
  lastTriggered?: Date;
  triggerCount: number;
  priority: number;
}

interface EmergencyProtocol {
  id: string;
  name: string;
  trigger: string;
  action: string;
  autoExecute: boolean;
  executed: boolean;
  executedAt?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface WalletSecurity {
  multiSigEnabled: boolean;
  timeDelayHours: number;
  whitelistEnabled: boolean;
  maxDailyLimit: number;
  currentDailyUsage: number;
  emergencyFreezeActive: boolean;
}

const SafetyMechanisms = () => {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [masterKillSwitch, setMasterKillSwitch] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  
  const [walletSecurity, setWalletSecurity] = useState<WalletSecurity>({
    multiSigEnabled: true,
    timeDelayHours: 24,
    whitelistEnabled: true,
    maxDailyLimit: 100000,
    currentDailyUsage: 35000,
    emergencyFreezeActive: false
  });

  const [safetyLayers, setSafetyLayers] = useState<SafetyLayer[]>([
    {
      id: 'transaction_simulation',
      name: 'Transaction Simulation',
      description: 'Simulate all transactions before execution',
      enabled: true,
      status: 'active',
      triggerCount: 0,
      priority: 1
    },
    {
      id: 'slippage_protection',
      name: 'Dynamic Slippage Protection',
      description: 'Automatically adjust slippage limits based on market conditions',
      enabled: true,
      status: 'active',
      triggerCount: 3,
      priority: 2
    },
    {
      id: 'mev_protection',
      name: 'MEV Protection Layer',
      description: 'Use private mempools and flashbot protection',
      enabled: true,
      status: 'active',
      triggerCount: 0,
      priority: 1
    },
    {
      id: 'profit_validation',
      name: 'Profit Validation',
      description: 'Verify expected profit margins before execution',
      enabled: true,
      status: 'active',
      triggerCount: 1,
      priority: 2
    },
    {
      id: 'liquidity_check',
      name: 'Liquidity Depth Check',
      description: 'Ensure sufficient liquidity for safe execution',
      enabled: true,
      status: 'active',
      triggerCount: 5,
      priority: 3
    },
    {
      id: 'gas_optimization',
      name: 'Gas Price Optimization',
      description: 'Monitor and optimize gas prices for execution',
      enabled: true,
      status: 'active',
      triggerCount: 2,
      priority: 3
    },
    {
      id: 'timing_analysis',
      name: 'Execution Timing Analysis',
      description: 'Analyze optimal execution timing to minimize risks',
      enabled: true,
      status: 'active',
      triggerCount: 0,
      priority: 4
    },
    {
      id: 'portfolio_limits',
      name: 'Portfolio Exposure Limits',
      description: 'Enforce maximum exposure and concentration limits',
      enabled: true,
      status: 'active',
      triggerCount: 1,
      priority: 2
    }
  ]);

  const [emergencyProtocols, setEmergencyProtocols] = useState<EmergencyProtocol[]>([
    {
      id: 'stop_all_trading',
      name: 'Emergency Stop All Trading',
      trigger: 'Manual activation or critical system failure',
      action: 'Immediately halt all trading activities',
      autoExecute: true,
      executed: false,
      severity: 'critical'
    },
    {
      id: 'liquidate_positions',
      name: 'Emergency Position Liquidation',
      trigger: 'Portfolio loss exceeds 10%',
      action: 'Liquidate all open positions at market prices',
      autoExecute: false,
      executed: false,
      severity: 'high'
    },
    {
      id: 'freeze_wallet',
      name: 'Wallet Freeze Protocol',
      trigger: 'Suspicious activity detected',
      action: 'Freeze wallet and require manual authorization',
      autoExecute: true,
      executed: false,
      severity: 'high'
    },
    {
      id: 'backup_funds',
      name: 'Emergency Fund Backup',
      trigger: 'System security compromise',
      action: 'Transfer funds to backup cold storage wallet',
      autoExecute: false,
      executed: false,
      severity: 'critical'
    },
    {
      id: 'admin_notification',
      name: 'Admin Alert System',
      trigger: 'Any critical system event',
      action: 'Send immediate notifications via multiple channels',
      autoExecute: true,
      executed: false,
      severity: 'medium'
    }
  ]);

  // Monitor system health and trigger safety mechanisms
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random safety triggers for demonstration
      if (Math.random() > 0.95) {
        const randomLayer = safetyLayers[Math.floor(Math.random() * safetyLayers.length)];
        setSafetyLayers(prev => prev.map(layer => 
          layer.id === randomLayer.id 
            ? { 
                ...layer, 
                status: 'triggered', 
                triggerCount: layer.triggerCount + 1,
                lastTriggered: new Date() 
              }
            : layer
        ));
        
        // Reset after 5 seconds
        setTimeout(() => {
          setSafetyLayers(prev => prev.map(layer => 
            layer.id === randomLayer.id 
              ? { ...layer, status: 'active' }
              : layer
          ));
        }, 5000);
      }

      // Update wallet usage
      setWalletSecurity(prev => ({
        ...prev,
        currentDailyUsage: prev.currentDailyUsage + Math.random() * 100
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [safetyLayers]);

  const activateEmergencyProtocol = (protocolId: string) => {
    setEmergencyProtocols(prev => prev.map(protocol => 
      protocol.id === protocolId 
        ? { ...protocol, executed: true, executedAt: new Date() }
        : protocol
    ));

    if (protocolId === 'stop_all_trading') {
      setEmergencyMode(true);
      setMasterKillSwitch(true);
    }
  };

  const resetEmergencyProtocols = () => {
    setEmergencyMode(false);
    setMasterKillSwitch(false);
    setWalletSecurity(prev => ({ ...prev, emergencyFreezeActive: false }));
    setEmergencyProtocols(prev => prev.map(protocol => ({ 
      ...protocol, 
      executed: false, 
      executedAt: undefined 
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'triggered': return 'text-yellow-500';
      case 'disabled': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeLayers = safetyLayers.filter(layer => layer.enabled).length;
  const triggeredLayers = safetyLayers.filter(layer => layer.status === 'triggered').length;
  const safetyScore = ((activeLayers - triggeredLayers) / activeLayers) * 100;

  return (
    <div className="space-y-6">
      {/* Emergency Status */}
      {(emergencyMode || masterKillSwitch) && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-semibold">
            <strong>EMERGENCY MODE ACTIVE:</strong> All trading operations have been suspended. 
            Manual intervention required to resume normal operations.
          </AlertDescription>
        </Alert>
      )}

      {/* Safety Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Multi-Layered Safety System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-500">{safetyScore.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">System Safety Score</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{activeLayers}/{safetyLayers.length}</div>
              <div className="text-sm text-muted-foreground">Active Layers</div>
            </div>
          </div>

          <Progress value={safetyScore} className="h-3" />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Master Kill Switch</h4>
              <p className="text-sm text-muted-foreground">
                Immediately stop all trading activities
              </p>
            </div>
            <Button 
              onClick={() => setMasterKillSwitch(!masterKillSwitch)}
              variant={masterKillSwitch ? "destructive" : "outline"}
              className="min-w-[100px]"
            >
              {masterKillSwitch ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  STOPPED
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  ACTIVE
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Advanced Safety Mode</h4>
              <p className="text-sm text-muted-foreground">
                Enable additional safety checks and validations
              </p>
            </div>
            <Switch 
              checked={advancedMode}
              onCheckedChange={setAdvancedMode}
            />
          </div>

          {emergencyMode && (
            <Button onClick={resetEmergencyProtocols} className="w-full" variant="destructive">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Emergency Systems
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Wallet Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Wallet Security Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Multi-Signature Protection</h4>
                  <p className="text-sm text-muted-foreground">Require multiple confirmations</p>
                </div>
                <Switch 
                  checked={walletSecurity.multiSigEnabled}
                  onCheckedChange={(checked) => setWalletSecurity(prev => ({ ...prev, multiSigEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Whitelist Protection</h4>
                  <p className="text-sm text-muted-foreground">Only allow whitelisted addresses</p>
                </div>
                <Switch 
                  checked={walletSecurity.whitelistEnabled}
                  onCheckedChange={(checked) => setWalletSecurity(prev => ({ ...prev, whitelistEnabled: checked }))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Time Delay (hours)</span>
                  <span className="text-sm text-muted-foreground">{walletSecurity.timeDelayHours}h</span>
                </div>
                <Slider
                  value={[walletSecurity.timeDelayHours]}
                  onValueChange={(value) => setWalletSecurity(prev => ({ ...prev, timeDelayHours: value[0] }))}
                  max={72}
                  min={0}
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Daily Usage Limit</span>
                  <span className="text-sm">${walletSecurity.currentDailyUsage.toFixed(0)} / ${walletSecurity.maxDailyLimit.toLocaleString()}</span>
                </div>
                <Progress value={(walletSecurity.currentDailyUsage / walletSecurity.maxDailyLimit) * 100} className="mb-1" />
                <div className="text-xs text-muted-foreground">
                  {((walletSecurity.currentDailyUsage / walletSecurity.maxDailyLimit) * 100).toFixed(1)}% used
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyLimit">Max Daily Limit ($)</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  value={walletSecurity.maxDailyLimit}
                  onChange={(e) => setWalletSecurity(prev => ({ ...prev, maxDailyLimit: parseInt(e.target.value) }))}
                />
              </div>

              <Button 
                onClick={() => setWalletSecurity(prev => ({ ...prev, emergencyFreezeActive: !prev.emergencyFreezeActive }))}
                variant={walletSecurity.emergencyFreezeActive ? "destructive" : "outline"}
                className="w-full"
              >
                {walletSecurity.emergencyFreezeActive ? 'Unfreeze Wallet' : 'Emergency Freeze'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Layers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safety Layer Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safetyLayers
              .sort((a, b) => a.priority - b.priority)
              .map((layer) => (
                <div key={layer.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        layer.status === 'active' ? 'bg-green-500' :
                        layer.status === 'triggered' ? 'bg-yellow-500 animate-pulse' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <div className="font-semibold">{layer.name}</div>
                        <div className="text-sm text-muted-foreground">{layer.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Priority {layer.priority}</Badge>
                      <Switch 
                        checked={layer.enabled}
                        onCheckedChange={(checked) => {
                          setSafetyLayers(prev => prev.map(l => 
                            l.id === layer.id ? { ...l, enabled: checked } : l
                          ));
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className={`font-medium ${getStatusColor(layer.status)}`}>
                        {layer.status.toUpperCase()}
                      </span>
                      <span className="text-muted-foreground">
                        Triggered: {layer.triggerCount} times
                      </span>
                    </div>
                    
                    {layer.lastTriggered && (
                      <span className="text-muted-foreground">
                        Last: {layer.lastTriggered.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Emergency Response Protocols
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyProtocols.map((protocol) => (
              <div key={protocol.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{protocol.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">{protocol.trigger}</div>
                    <div className="text-xs text-gray-600">{protocol.action}</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(protocol.severity)}>
                      {protocol.severity.toUpperCase()}
                    </Badge>
                    {protocol.autoExecute && (
                      <Badge variant="outline">AUTO</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {protocol.executed ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">
                        Executed at {protocol.executedAt?.toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Ready</span>
                    </div>
                  )}
                  
                  {!protocol.executed && (
                    <Button 
                      size="sm"
                      onClick={() => activateEmergencyProtocol(protocol.id)}
                      variant={protocol.severity === 'critical' ? 'destructive' : 'outline'}
                    >
                      Execute Protocol
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

export default SafetyMechanisms;
