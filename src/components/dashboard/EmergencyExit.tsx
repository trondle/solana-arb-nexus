
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Zap, TrendingDown, Clock, Shield, Target } from 'lucide-react';

interface EmergencyStrategy {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
  targetPercentage: number;
}

interface PortfolioPosition {
  token: string;
  value: number;
  percentage: number;
  liquidityRisk: 'low' | 'medium' | 'high';
}

const EmergencyExit = () => {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [liquidationProgress, setLiquidationProgress] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const [emergencyStrategies, setEmergencyStrategies] = useState<EmergencyStrategy[]>([
    {
      id: 'partial-liquidation',
      name: 'Partial Position Liquidation',
      description: 'Liquidate 50% of highest-risk positions first',
      estimatedTime: '2-5 minutes',
      priority: 'high',
      enabled: true,
      targetPercentage: 50
    },
    {
      id: 'stable-conversion',
      name: 'Convert to Stablecoins',
      description: 'Convert all volatile assets to USDC/USDT',
      estimatedTime: '3-8 minutes',
      priority: 'high',
      enabled: true,
      targetPercentage: 100
    },
    {
      id: 'gradual-exit',
      name: 'Gradual Exit Strategy',
      description: 'Systematically exit positions over 30 minutes',
      estimatedTime: '15-30 minutes',
      priority: 'medium',
      enabled: false,
      targetPercentage: 100
    },
    {
      id: 'safe-haven',
      name: 'Safe Haven Assets',
      description: 'Move funds to BTC/ETH as safe haven',
      estimatedTime: '5-10 minutes',
      priority: 'low',
      enabled: false,
      targetPercentage: 80
    }
  ]);

  const [portfolioPositions] = useState<PortfolioPosition[]>([
    { token: 'SOL', value: 15420, percentage: 35, liquidityRisk: 'low' },
    { token: 'RAY', value: 8900, percentage: 20, liquidityRisk: 'medium' },
    { token: 'USDC', value: 7600, percentage: 17, liquidityRisk: 'low' },
    { token: 'ORCA', value: 5200, percentage: 12, liquidityRisk: 'medium' },
    { token: 'SRM', value: 3800, percentage: 9, liquidityRisk: 'high' },
    { token: 'MNGO', value: 3080, percentage: 7, liquidityRisk: 'high' }
  ]);

  const totalPortfolioValue = portfolioPositions.reduce((sum, pos) => sum + pos.value, 0);

  const executeEmergencyExit = async (strategyId: string) => {
    setIsExecuting(true);
    setEmergencyMode(true);
    setLiquidationProgress(0);

    const strategy = emergencyStrategies.find(s => s.id === strategyId);
    console.log(`Executing emergency strategy: ${strategy?.name}`);

    // Simulate liquidation progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLiquidationProgress(i);
    }

    setIsExecuting(false);
  };

  const cancelEmergencyExit = () => {
    setEmergencyMode(false);
    setLiquidationProgress(0);
    setIsExecuting(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Status */}
      {emergencyMode && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-semibold">
            <strong>EMERGENCY EXIT IN PROGRESS:</strong> Portfolio liquidation is active.
          </AlertDescription>
        </Alert>
      )}

      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">6</div>
                <div className="text-sm text-muted-foreground">Active Positions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {portfolioPositions.filter(p => p.liquidityRisk === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">High Risk Assets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">95%</div>
                <div className="text-sm text-muted-foreground">Liquidity Score</div>
              </div>
            </div>

            <div className="space-y-2">
              {portfolioPositions.map((position) => (
                <div key={position.token} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">{position.token}</div>
                    <Badge className={getRiskColor(position.liquidityRisk)}>
                      {position.liquidityRisk} risk
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${position.value.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{position.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Emergency Exit Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emergencyStrategies.map((strategy) => (
              <div key={strategy.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{strategy.name}</div>
                    <div className="text-sm text-muted-foreground">{strategy.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(strategy.priority)}>
                      {strategy.priority.toUpperCase()}
                    </Badge>
                    {strategy.enabled && (
                      <Badge variant="outline">ENABLED</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <div className="font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {strategy.estimatedTime}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Liquidation:</span>
                    <div className="font-semibold">{strategy.targetPercentage}%</div>
                  </div>
                </div>

                {strategy.enabled && !emergencyMode && (
                  <Button 
                    onClick={() => executeEmergencyExit(strategy.id)}
                    variant={strategy.priority === 'high' ? 'destructive' : 'outline'}
                    className="w-full"
                    disabled={isExecuting}
                  >
                    Execute Emergency Exit
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Progress */}
      {emergencyMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Emergency Exit Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Liquidation Progress</span>
                <span>{liquidationProgress}%</span>
              </div>
              <Progress value={liquidationProgress} className="h-3" />
            </div>

            <div className="text-sm text-muted-foreground">
              {liquidationProgress < 100 ? 'Liquidating positions...' : 'Emergency exit completed'}
            </div>

            {liquidationProgress < 100 && (
              <Button 
                onClick={cancelEmergencyExit}
                variant="outline"
                className="w-full"
              >
                Cancel Emergency Exit
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Risk Warnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Warnings & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>High Risk Assets:</strong> SRM and MNGO have limited liquidity during market stress
              </AlertDescription>
            </Alert>
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Timing Risk:</strong> Emergency exits during high volatility may incur significant slippage
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyExit;
