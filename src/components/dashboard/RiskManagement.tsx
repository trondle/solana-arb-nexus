
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, TrendingDown, Zap, DollarSign, Clock } from 'lucide-react';

interface RiskMetrics {
  portfolioRisk: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  valueAtRisk: number;
  riskScore: number;
}

interface RiskLimit {
  type: string;
  current: number;
  limit: number;
  status: 'safe' | 'warning' | 'danger';
}

const RiskManagement = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    portfolioRisk: 23.5,
    maxDrawdown: 12.3,
    sharpeRatio: 2.1,
    volatility: 18.7,
    valueAtRisk: 8.9,
    riskScore: 75
  });

  const [riskLimits, setRiskLimits] = useState<RiskLimit[]>([
    { type: 'Position Size', current: 15, limit: 20, status: 'safe' },
    { type: 'Daily Loss', current: 8.5, limit: 10, status: 'warning' },
    { type: 'Correlation Risk', current: 45, limit: 60, status: 'safe' },
    { type: 'Liquidity Risk', current: 25, limit: 30, status: 'warning' },
  ]);

  const [autoStopLoss, setAutoStopLoss] = useState(true);
  const [positionSizing, setPositionSizing] = useState(true);
  const [maxPositionSize, setMaxPositionSize] = useState([15]);
  const [stopLossPercent, setStopLossPercent] = useState([5]);
  const [riskTolerance, setRiskTolerance] = useState([3]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRiskMetrics(prev => ({
        ...prev,
        portfolioRisk: 20 + Math.random() * 10,
        maxDrawdown: 10 + Math.random() * 8,
        volatility: 15 + Math.random() * 10,
        valueAtRisk: 5 + Math.random() * 8,
        riskScore: 60 + Math.random() * 30
      }));

      setRiskLimits(prev => prev.map(limit => ({
        ...limit,
        current: limit.current + (Math.random() - 0.5) * 2,
        status: limit.current > limit.limit * 0.8 ? 'warning' : 'safe'
      })));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'danger': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(riskMetrics.riskScore)}`}>
              {riskMetrics.riskScore.toFixed(0)}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {getRiskLevel(riskMetrics.riskScore)}
            </p>
            <Progress value={riskMetrics.riskScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              -{riskMetrics.maxDrawdown.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {riskMetrics.sharpeRatio.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted returns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Limits Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Limits Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskLimits.map((limit, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{limit.type}</span>
                  <Badge className={getStatusColor(limit.status)}>
                    {limit.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={(limit.current / limit.limit) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{limit.current.toFixed(1)}%</span>
                    <span>Limit: {limit.limit}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Management Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Management Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto Stop-Loss</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically close positions at loss threshold
                </p>
              </div>
              <Switch 
                checked={autoStopLoss}
                onCheckedChange={setAutoStopLoss}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Position Sizing</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically calculate optimal position sizes
                </p>
              </div>
              <Switch 
                checked={positionSizing}
                onCheckedChange={setPositionSizing}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Max Position Size</span>
                <span className="text-sm text-muted-foreground">{maxPositionSize[0]}% of portfolio</span>
              </div>
              <Slider
                value={maxPositionSize}
                onValueChange={setMaxPositionSize}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Stop-Loss Threshold</span>
                <span className="text-sm text-muted-foreground">{stopLossPercent[0]}%</span>
              </div>
              <Slider
                value={stopLossPercent}
                onValueChange={setStopLossPercent}
                max={20}
                min={1}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Risk Tolerance Level</span>
                <span className="text-sm text-muted-foreground">
                  {riskTolerance[0] === 1 ? 'Very Low' : 
                   riskTolerance[0] === 2 ? 'Low' :
                   riskTolerance[0] === 3 ? 'Medium' :
                   riskTolerance[0] === 4 ? 'High' : 'Very High'}
                </span>
              </div>
              <Slider
                value={riskTolerance}
                onValueChange={setRiskTolerance}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Risk Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Daily loss approaching limit (8.5/10%)
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Info:</strong> High correlation detected between SOL and ETH positions
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Portfolio Volatility</div>
              <div className="text-lg font-semibold">{riskMetrics.volatility.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Value at Risk (95%)</div>
              <div className="text-lg font-semibold text-red-500">${riskMetrics.valueAtRisk.toFixed(1)}K</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Portfolio Beta</div>
              <div className="text-lg font-semibold">1.23</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskManagement;
