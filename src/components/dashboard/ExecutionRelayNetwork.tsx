
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Network, 
  Zap, 
  Shield, 
  Clock, 
  DollarSign, 
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Router,
  Globe,
  Server,
  Settings
} from 'lucide-react';

interface RelayProvider {
  id: string;
  name: string;
  network: string;
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  successRate: number;
  fee: number;
  mevProtection: boolean;
  features: string[];
  reputation: number;
}

interface NetworkStatus {
  provider: string;
  transactions: number;
  successRate: number;
  avgLatency: number;
  volume: number;
  lastUpdate: string;
}

interface ExecutionRequest {
  id: string;
  transaction: string;
  provider: string;
  status: 'pending' | 'routing' | 'executed' | 'failed';
  timestamp: string;
  fee: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface RelaySettings {
  autoRouting: boolean;
  prioritizeLatency: boolean;
  prioritizeCost: boolean;
  mevProtectionRequired: boolean;
  maxFee: number;
  maxLatency: number;
  fallbackEnabled: boolean;
}

const ExecutionRelayNetwork = () => {
  const [relayProviders, setRelayProviders] = useState<RelayProvider[]>([]);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus[]>([]);
  const [executionQueue, setExecutionQueue] = useState<ExecutionRequest[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  
  const [settings, setSettings] = useState<RelaySettings>({
    autoRouting: true,
    prioritizeLatency: true,
    prioritizeCost: false,
    mevProtectionRequired: true,
    maxFee: 0.05,
    maxLatency: 2000,
    fallbackEnabled: true
  });

  const [isRouting, setIsRouting] = useState(false);
  const [routingHistory, setRoutingHistory] = useState<any[]>([]);

  useEffect(() => {
    const generateProviders = (): RelayProvider[] => {
      return [
        {
          id: 'flashbots',
          name: 'Flashbots Protect',
          network: 'Ethereum',
          status: Math.random() > 0.1 ? 'online' : 'degraded',
          latency: 800 + Math.random() * 400,
          successRate: 95 + Math.random() * 4,
          fee: 0.01 + Math.random() * 0.02,
          mevProtection: true,
          features: ['MEV Protection', 'Private Mempool', 'Bundle Inclusion'],
          reputation: 98
        },
        {
          id: 'blocknative',
          name: 'Blocknative Mempool',
          network: 'Multi-chain',
          status: Math.random() > 0.05 ? 'online' : 'offline',
          latency: 600 + Math.random() * 300,
          successRate: 92 + Math.random() * 6,
          fee: 0.015 + Math.random() * 0.025,
          mevProtection: true,
          features: ['Real-time Monitoring', 'Gas Optimization', 'Cross-chain'],
          reputation: 94
        },
        {
          id: 'eden',
          name: 'Eden Network',
          network: 'Ethereum',
          status: Math.random() > 0.15 ? 'online' : 'degraded',
          latency: 900 + Math.random() * 500,
          successRate: 88 + Math.random() * 8,
          fee: 0.008 + Math.random() * 0.015,
          mevProtection: false,
          features: ['Priority Access', 'Slot Auctions'],
          reputation: 87
        },
        {
          id: 'cow-protocol',
          name: 'CoW Protocol',
          network: 'Ethereum',
          status: Math.random() > 0.08 ? 'online' : 'offline',
          latency: 1100 + Math.random() * 600,
          successRate: 90 + Math.random() * 7,
          fee: 0.012 + Math.random() * 0.018,
          mevProtection: true,
          features: ['Batch Auctions', 'MEV Capture', 'Gas Efficiency'],
          reputation: 91
        },
        {
          id: 'solana-jito',
          name: 'Jito Network',
          network: 'Solana',
          status: Math.random() > 0.12 ? 'online' : 'degraded',
          latency: 400 + Math.random() * 200,
          successRate: 96 + Math.random() * 3,
          fee: 0.005 + Math.random() * 0.01,
          mevProtection: true,
          features: ['Block Engine', 'Tip Routing', 'Bundle Processing'],
          reputation: 96
        }
      ];
    };

    const generateNetworkStatus = (): NetworkStatus[] => {
      return relayProviders.map(provider => ({
        provider: provider.name,
        transactions: Math.floor(1000 + Math.random() * 5000),
        successRate: provider.successRate,
        avgLatency: provider.latency,
        volume: Math.floor(50000 + Math.random() * 200000),
        lastUpdate: new Date().toLocaleTimeString()
      }));
    };

    const generateQueue = (): ExecutionRequest[] => {
      const statuses: Array<'pending' | 'routing' | 'executed' | 'failed'> = ['pending', 'routing', 'executed', 'failed'];
      const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
      
      return Array.from({ length: 5 }, (_, i) => ({
        id: `tx-${Date.now()}-${i}`,
        transaction: `0x${Math.random().toString(16).substr(2, 8)}...`,
        provider: relayProviders[Math.floor(Math.random() * relayProviders.length)]?.name || 'Unknown',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
        fee: Math.random() * 0.05,
        priority: priorities[Math.floor(Math.random() * priorities.length)]
      }));
    };

    setRelayProviders(generateProviders());
    
    const interval = setInterval(() => {
      const providers = generateProviders();
      setRelayProviders(providers);
      setNetworkStatus(generateNetworkStatus());
      setExecutionQueue(generateQueue());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const selectOptimalProvider = () => {
    if (!settings.autoRouting) return selectedProvider;

    let bestProvider = relayProviders[0];
    
    for (const provider of relayProviders) {
      if (provider.status === 'offline') continue;
      if (settings.mevProtectionRequired && !provider.mevProtection) continue;
      if (provider.fee > settings.maxFee) continue;
      if (provider.latency > settings.maxLatency) continue;

      const currentScore = calculateProviderScore(bestProvider);
      const providerScore = calculateProviderScore(provider);
      
      if (providerScore > currentScore) {
        bestProvider = provider;
      }
    }

    return bestProvider.id;
  };

  const calculateProviderScore = (provider: RelayProvider) => {
    let score = 0;
    
    // Base reputation score
    score += provider.reputation * 0.3;
    
    // Success rate
    score += provider.successRate * 0.25;
    
    // Latency (lower is better)
    score += (3000 - provider.latency) / 3000 * 100 * 0.2;
    
    // Fee (lower is better)
    score += (0.1 - provider.fee) / 0.1 * 100 * 0.15;
    
    // MEV protection bonus
    if (provider.mevProtection) score += 10;
    
    // Status penalty
    if (provider.status === 'degraded') score *= 0.8;
    if (provider.status === 'offline') score = 0;

    return score;
  };

  const executeTransaction = async () => {
    setIsRouting(true);
    
    const optimalProvider = selectOptimalProvider();
    const provider = relayProviders.find(p => p.id === optimalProvider);
    
    if (!provider) {
      setIsRouting(false);
      return;
    }

    // Simulate routing process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newExecution: ExecutionRequest = {
      id: `tx-${Date.now()}`,
      transaction: `0x${Math.random().toString(16).substr(2, 8)}...`,
      provider: provider.name,
      status: Math.random() > 0.1 ? 'executed' : 'failed',
      timestamp: new Date().toLocaleTimeString(),
      fee: provider.fee,
      priority: 'high'
    };

    setExecutionQueue(prev => [newExecution, ...prev.slice(0, 4)]);
    setRoutingHistory(prev => [...prev.slice(-4), {
      timestamp: new Date().toLocaleTimeString(),
      provider: provider.name,
      status: newExecution.status,
      fee: provider.fee
    }]);

    setIsRouting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'border-green-200 bg-green-50';
      case 'degraded':
        return 'border-yellow-200 bg-yellow-50';
      case 'offline':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Relays</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {relayProviders.filter(p => p.status === 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {relayProviders.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(relayProviders.reduce((sum, p) => sum + p.latency, 0) / relayProviders.length)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Network average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(relayProviders.reduce((sum, p) => sum + p.successRate, 0) / relayProviders.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Network average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${networkStatus.reduce((sum, n) => sum + n.volume, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              24h volume
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Relay Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="w-5 h-5" />
            Relay Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relayProviders.map((provider) => (
              <div 
                key={provider.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProvider === provider.id ? 'border-blue-500 bg-blue-50' : getStatusColor(provider.status)
                }`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(provider.status)}
                    <div>
                      <div className="font-semibold">{provider.name}</div>
                      <div className="text-sm text-muted-foreground">{provider.network}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.mevProtection && (
                      <Badge variant="secondary">
                        <Shield className="w-3 h-3 mr-1" />
                        MEV Protected
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {provider.reputation}% reputation
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Latency</div>
                    <div className="font-semibold">{Math.round(provider.latency)}ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Success Rate</div>
                    <div className="font-semibold">{provider.successRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Fee</div>
                    <div className="font-semibold">{provider.fee.toFixed(4)} SOL</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Features</div>
                    <div className="text-xs">{provider.features.slice(0, 2).join(', ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Routing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Routing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Auto Routing</label>
                  <p className="text-xs text-muted-foreground">Automatically select optimal provider</p>
                </div>
                <Switch 
                  checked={settings.autoRouting}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoRouting: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">MEV Protection Required</label>
                  <p className="text-xs text-muted-foreground">Only use MEV-protected relays</p>
                </div>
                <Switch 
                  checked={settings.mevProtectionRequired}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, mevProtectionRequired: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Fallback Enabled</label>
                  <p className="text-xs text-muted-foreground">Use backup providers if primary fails</p>
                </div>
                <Switch 
                  checked={settings.fallbackEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, fallbackEnabled: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Max Fee (SOL)</label>
                  <span className="text-sm text-muted-foreground">{settings.maxFee.toFixed(4)}</span>
                </div>
                <Slider
                  value={[settings.maxFee]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, maxFee: value[0] }))}
                  min={0.001}
                  max={0.1}
                  step={0.001}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Max Latency (ms)</label>
                  <span className="text-sm text-muted-foreground">{settings.maxLatency}</span>
                </div>
                <Slider
                  value={[settings.maxLatency]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, maxLatency: value[0] }))}
                  min={500}
                  max={5000}
                  step={100}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Execution Queue
            </CardTitle>
            <Button onClick={executeTransaction} disabled={isRouting}>
              {isRouting ? 'Routing...' : 'Execute Transaction'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {executionQueue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending executions</p>
          ) : (
            <div className="space-y-3">
              {executionQueue.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(request.priority)}`}></div>
                    <div>
                      <div className="font-mono text-sm">{request.transaction}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.provider} • {request.timestamp}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{request.fee.toFixed(4)} SOL</span>
                    <Badge 
                      variant={request.status === 'executed' ? 'default' : 
                               request.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Network Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {networkStatus.map((status, index) => (
              <div key={index} className="grid grid-cols-2 md:grid-cols-5 gap-4 p-3 border rounded-lg">
                <div>
                  <div className="text-sm font-medium">{status.provider}</div>
                  <div className="text-xs text-muted-foreground">Provider</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">{status.transactions.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Transactions</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">{status.successRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">${status.volume.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Volume</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">{status.lastUpdate}</div>
                  <div className="text-xs text-muted-foreground">Last Update</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Routing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Recent Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {routingHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent executions</p>
          ) : (
            <div className="space-y-2">
              {routingHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{entry.timestamp}</span>
                    <span className="text-sm font-medium">{entry.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{entry.fee.toFixed(4)} SOL</span>
                    <Badge variant={entry.status === 'executed' ? 'default' : 'destructive'}>
                      {entry.status}
                    </Badge>
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

export default ExecutionRelayNetwork;
