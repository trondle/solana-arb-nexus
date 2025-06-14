
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  ZapOff, 
  TrendingUp, 
  Activity,
  Brain,
  Target
} from 'lucide-react';

interface RiskFactor {
  id: string;
  name: string;
  weight: number;
  currentValue: number;
  threshold: number;
  status: 'safe' | 'warning' | 'critical';
  impact: string;
}

interface CircuitBreakerRule {
  id: string;
  name: string;
  enabled: boolean;
  threshold: number;
  cooldownPeriod: number;
  triggered: boolean;
  lastTriggered?: Date;
}

const DynamicRiskAssessment = () => {
  const [overallRiskScore, setOverallRiskScore] = useState(25);
  const [circuitBreakerActive, setCircuitBreakerActive] = useState(false);
  const [autoCircuitBreaker, setAutoCircuitBreaker] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState([70]);
  
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([
    {
      id: 'market_volatility',
      name: 'Market Volatility',
      weight: 0.3,
      currentValue: 15,
      threshold: 40,
      status: 'safe',
      impact: 'High volatility increases slippage risk'
    },
    {
      id: 'liquidity_depth',
      name: 'Liquidity Depth',
      weight: 0.25,
      currentValue: 85,
      threshold: 60,
      status: 'safe',
      impact: 'Low liquidity increases execution risk'
    },
    {
      id: 'gas_price_spike',
      name: 'Gas Price Volatility',
      weight: 0.2,
      currentValue: 30,
      threshold: 80,
      status: 'safe',
      impact: 'High gas prices reduce profitability'
    },
    {
      id: 'network_congestion',
      name: 'Network Congestion',
      weight: 0.15,
      currentValue: 25,
      threshold: 70,
      status: 'safe',
      impact: 'Congestion increases failure rates'
    },
    {
      id: 'execution_history',
      name: 'Recent Failure Rate',
      weight: 0.1,
      currentValue: 5,
      threshold: 20,
      status: 'safe',
      impact: 'High failure rate indicates systemic issues'
    }
  ]);

  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreakerRule[]>([
    {
      id: 'risk_score',
      name: 'Overall Risk Score',
      enabled: true,
      threshold: 70,
      cooldownPeriod: 300, // 5 minutes
      triggered: false
    },
    {
      id: 'consecutive_failures',
      name: 'Consecutive Failures',
      enabled: true,
      threshold: 3,
      cooldownPeriod: 600, // 10 minutes
      triggered: false
    },
    {
      id: 'profit_deviation',
      name: 'Profit Deviation',
      enabled: true,
      threshold: 50, // 50% below expected
      cooldownPeriod: 900, // 15 minutes
      triggered: false
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time risk factor updates
      setRiskFactors(prev => prev.map(factor => {
        const variation = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, Math.min(100, factor.currentValue + variation));
        
        let status: 'safe' | 'warning' | 'critical' = 'safe';
        if (newValue >= factor.threshold * 0.8) status = 'warning';
        if (newValue >= factor.threshold) status = 'critical';
        
        return { ...factor, currentValue: newValue, status };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate overall risk score
    const weightedScore = riskFactors.reduce((acc, factor) => {
      const normalizedValue = Math.min(factor.currentValue / factor.threshold, 1);
      return acc + (normalizedValue * factor.weight * 100);
    }, 0);
    
    setOverallRiskScore(Math.round(weightedScore));

    // Check circuit breaker conditions
    if (autoCircuitBreaker && weightedScore >= riskThreshold[0] && !circuitBreakerActive) {
      triggerCircuitBreaker('risk_score');
    }
  }, [riskFactors, riskThreshold, autoCircuitBreaker, circuitBreakerActive]);

  const triggerCircuitBreaker = (ruleId: string) => {
    setCircuitBreakerActive(true);
    setCircuitBreakers(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, triggered: true, lastTriggered: new Date() }
        : rule
    ));
    
    console.log(`Circuit breaker triggered: ${ruleId}`);
  };

  const resetCircuitBreaker = () => {
    setCircuitBreakerActive(false);
    setCircuitBreakers(prev => prev.map(rule => ({ 
      ...rule, 
      triggered: false, 
      lastTriggered: undefined 
    })));
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Circuit Breaker Status */}
      {circuitBreakerActive && (
        <Alert className="border-red-500 bg-red-50">
          <ZapOff className="h-4 w-4" />
          <AlertDescription className="font-semibold">
            <strong>CIRCUIT BREAKER ACTIVE:</strong> Trading suspended due to elevated risk conditions. 
            All arbitrage operations are halted for your protection.
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Risk Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Dynamic Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-3xl font-bold ${getRiskColor(overallRiskScore)}`}>
                {overallRiskScore}/100
              </div>
              <div className="text-sm text-muted-foreground">Overall Risk Score</div>
            </div>
            <div className="text-right">
              <Progress value={overallRiskScore} className="w-32 mb-2" />
              <Badge variant={overallRiskScore < 30 ? 'default' : overallRiskScore < 60 ? 'secondary' : 'destructive'}>
                {overallRiskScore < 30 ? 'LOW RISK' : overallRiskScore < 60 ? 'MEDIUM RISK' : 'HIGH RISK'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Circuit Breaker</h4>
              <p className="text-sm text-muted-foreground">
                Automatically halt trading when risk exceeds threshold
              </p>
            </div>
            <Switch 
              checked={autoCircuitBreaker}
              onCheckedChange={setAutoCircuitBreaker}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Risk Threshold</span>
              <span className="text-sm text-muted-foreground">{riskThreshold[0]}%</span>
            </div>
            <Slider
              value={riskThreshold}
              onValueChange={setRiskThreshold}
              max={90}
              min={30}
              step={5}
              className="w-full"
            />
          </div>

          {circuitBreakerActive && (
            <Button onClick={resetCircuitBreaker} className="w-full" variant="destructive">
              Reset Circuit Breaker
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Risk Factor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskFactors.map((factor) => (
              <div key={factor.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{factor.name}</div>
                    <div className="text-sm text-muted-foreground">Weight: {(factor.weight * 100).toFixed(0)}%</div>
                  </div>
                  <Badge className={getStatusColor(factor.status)}>
                    {factor.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: {factor.currentValue.toFixed(1)}</span>
                    <span>Threshold: {factor.threshold}</span>
                  </div>
                  <Progress 
                    value={(factor.currentValue / factor.threshold) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  {factor.impact}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Circuit Breaker Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Circuit Breaker Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {circuitBreakers.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={rule.enabled}
                    onCheckedChange={(checked) => {
                      setCircuitBreakers(prev => prev.map(r => 
                        r.id === rule.id ? { ...r, enabled: checked } : r
                      ));
                    }}
                  />
                  <div>
                    <div className="font-semibold">{rule.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Threshold: {rule.threshold} • Cooldown: {Math.floor(rule.cooldownPeriod / 60)}min
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rule.triggered ? (
                    <Badge variant="destructive">TRIGGERED</Badge>
                  ) : (
                    <Badge variant="outline">ACTIVE</Badge>
                  )}
                  {rule.lastTriggered && (
                    <div className="text-xs text-muted-foreground">
                      Last: {rule.lastTriggered.toLocaleTimeString()}
                    </div>
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

export default DynamicRiskAssessment;
