
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Zap, 
  Activity, 
  Clock,
  TrendingUp,
  Target,
  Bot,
  Skull
} from 'lucide-react';

interface ThreatAlert {
  id: string;
  type: 'sandwich' | 'frontrun' | 'backrun' | 'liquidation' | 'rug_pull' | 'whale_movement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  status: 'active' | 'resolved' | 'monitoring';
  affectedTokens?: string[];
  recommendedAction: string;
}

interface NetworkThreat {
  type: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  severity: number;
}

const ThreatDetection = () => {
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [networkThreats, setNetworkThreats] = useState<NetworkThreat[]>([]);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [alertsCount, setAlertsCount] = useState({ critical: 0, high: 0, medium: 0, low: 0 });

  useEffect(() => {
    const generateThreats = (): ThreatAlert[] => {
      const threatTypes = [
        {
          type: 'sandwich' as const,
          title: 'Sandwich Attack Detected',
          description: 'Large transaction detected that could be sandwiched',
          baseConfidence: 85
        },
        {
          type: 'frontrun' as const,
          title: 'Frontrunning Activity',
          description: 'Bot detected copying transaction with higher gas',
          baseConfidence: 75
        },
        {
          type: 'whale_movement' as const,
          title: 'Whale Movement Alert',
          description: 'Large holder transferring significant amounts',
          baseConfidence: 90
        },
        {
          type: 'liquidation' as const,
          title: 'Liquidation Risk',
          description: 'Position at risk of liquidation detected',
          baseConfidence: 80
        },
        {
          type: 'rug_pull' as const,
          title: 'Potential Rug Pull',
          description: 'Suspicious contract behavior detected',
          baseConfidence: 70
        }
      ];

      const alerts: ThreatAlert[] = [];
      const numAlerts = Math.floor(Math.random() * 5) + 2;

      for (let i = 0; i < numAlerts; i++) {
        const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
        const severity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as ThreatAlert['severity'];
        
        alerts.push({
          id: `threat-${i}`,
          type: threat.type,
          severity,
          title: threat.title,
          description: threat.description,
          confidence: threat.baseConfidence + Math.random() * 10,
          timestamp: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
          status: Math.random() > 0.7 ? 'resolved' : Math.random() > 0.3 ? 'active' : 'monitoring',
          affectedTokens: ['SOL', 'USDC', 'RAY'].slice(0, Math.floor(Math.random() * 3) + 1),
          recommendedAction: getRecommendedAction(threat.type, severity)
        });
      }

      return alerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    };

    const generateNetworkThreats = (): NetworkThreat[] => {
      return [
        {
          type: 'Sandwich Attacks',
          count: Math.floor(Math.random() * 50) + 10,
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          severity: Math.random() * 100
        },
        {
          type: 'MEV Bots',
          count: Math.floor(Math.random() * 200) + 50,
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          severity: Math.random() * 100
        },
        {
          type: 'Flash Loans',
          count: Math.floor(Math.random() * 30) + 5,
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          severity: Math.random() * 100
        },
        {
          type: 'Liquidations',
          count: Math.floor(Math.random() * 80) + 20,
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          severity: Math.random() * 100
        }
      ];
    };

    const updateThreats = () => {
      if (!monitoringEnabled) return;
      
      const newThreats = generateThreats();
      setThreats(newThreats);
      setNetworkThreats(generateNetworkThreats());
      
      // Count alerts by severity
      const counts = { critical: 0, high: 0, medium: 0, low: 0 };
      newThreats.forEach(threat => {
        if (threat.status === 'active') {
          counts[threat.severity]++;
        }
      });
      setAlertsCount(counts);
    };

    updateThreats();
    const interval = setInterval(updateThreats, 8000);
    return () => clearInterval(interval);
  }, [monitoringEnabled]);

  const getRecommendedAction = (type: string, severity: string): string => {
    const actions = {
      sandwich: 'Use private mempool or adjust slippage tolerance',
      frontrun: 'Increase gas price or use MEV protection',
      whale_movement: 'Monitor for potential market impact',
      liquidation: 'Add collateral or close position',
      rug_pull: 'Avoid interacting with suspicious contracts'
    };
    
    return actions[type as keyof typeof actions] || 'Monitor situation closely';
  };

  const getThreatIcon = (type: string) => {
    const icons = {
      sandwich: <Target className="w-4 h-4" />,
      frontrun: <Zap className="w-4 h-4" />,
      backrun: <Activity className="w-4 h-4" />,
      whale_movement: <TrendingUp className="w-4 h-4" />,
      liquidation: <AlertTriangle className="w-4 h-4" />,
      rug_pull: <Skull className="w-4 h-4" />
    };
    
    return icons[type as keyof typeof icons] || <Eye className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const resolveAlert = (alertId: string) => {
    setThreats(prev => prev.map(threat => 
      threat.id === alertId 
        ? { ...threat, status: 'resolved' as const }
        : threat
    ));
  };

  return (
    <div className="space-y-6">
      {/* Threat Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{alertsCount.critical}</div>
            <p className="text-xs text-muted-foreground">Immediate attention required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{alertsCount.high}</div>
            <p className="text-xs text-muted-foreground">Needs attention soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <Eye className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{alertsCount.medium}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{alertsCount.low}</div>
            <p className="text-xs text-muted-foreground">Informational</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Threat Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Network Threat Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {networkThreats.map((threat, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">{threat.type}</div>
                  <span className="text-lg">{getTrendIcon(threat.trend)}</span>
                </div>
                <div className="text-2xl font-bold mb-1">{threat.count}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Severity: {threat.severity.toFixed(0)}%
                </div>
                <Progress value={threat.severity} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Threats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Active Threat Alerts
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={monitoringEnabled ? 'default' : 'secondary'}>
                Monitoring {monitoringEnabled ? 'ON' : 'OFF'}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setMonitoringEnabled(!monitoringEnabled)}
              >
                {monitoringEnabled ? 'Disable' : 'Enable'} Monitoring
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active threats detected
              </div>
            ) : (
              threats.map((threat) => (
                <div key={threat.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getThreatIcon(threat.type)}
                      <div>
                        <div className="font-semibold">{threat.title}</div>
                        <div className="text-sm text-muted-foreground">{threat.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Confidence</div>
                      <div className="font-semibold">{threat.confidence.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Detected</div>
                      <div className="font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {threat.timestamp}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Affected Tokens</div>
                      <div className="font-semibold">
                        {threat.affectedTokens?.join(', ') || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Recommended Action:</strong> {threat.recommendedAction}
                    </AlertDescription>
                  </Alert>

                  {threat.status === 'active' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => resolveAlert(threat.id)}
                      >
                        Mark as Resolved
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreatDetection;
