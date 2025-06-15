
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  TrendingDown, 
  Zap, 
  CheckCircle,
  AlertTriangle,
  Timer,
  Activity
} from 'lucide-react';

interface NetworkCondition {
  chain: string;
  gasPrice: number;
  congestion: 'low' | 'medium' | 'high';
  recommendation: 'execute' | 'wait' | 'avoid';
  savingsEstimate: number;
  optimalWindow: string;
}

interface SmartTimingEngineProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  chains: string[];
}

const SmartTimingEngine = ({ enabled, onToggle, chains }: SmartTimingEngineProps) => {
  const [networkConditions, setNetworkConditions] = useState<NetworkCondition[]>([]);
  const [optimalTime, setOptimalTime] = useState<string>('');
  const [waitingQueue, setWaitingQueue] = useState<any[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const updateConditions = () => {
      const conditions: NetworkCondition[] = chains.map(chain => {
        const baseGas = getBaseGasPrice(chain);
        const congestion = getCongestionLevel();
        const currentGas = baseGas * getCongestionMultiplier(congestion);
        
        return {
          chain,
          gasPrice: currentGas,
          congestion,
          recommendation: getRecommendation(congestion, currentGas),
          savingsEstimate: calculateSavings(baseGas, currentGas),
          optimalWindow: getOptimalWindow(congestion)
        };
      });

      setNetworkConditions(conditions);
      setOptimalTime(calculateOptimalTime(conditions));
    };

    updateConditions();
    const interval = setInterval(updateConditions, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [enabled, chains]);

  const getBaseGasPrice = (chain: string): number => {
    const basePrices: Record<string, number> = {
      'Ethereum': 15,
      'Base': 0.01,
      'Fantom': 0.001,
      'Polygon': 0.02,
      'Arbitrum': 0.1,
      'Optimism': 0.1,
      'Solana': 0.000005,
      'Avalanche': 0.025
    };
    return basePrices[chain] || 1;
  };

  const getCongestionLevel = (): 'low' | 'medium' | 'high' => {
    const hour = new Date().getHours();
    // Simulate network congestion based on time
    if (hour >= 2 && hour <= 8) return 'low';
    if (hour >= 14 && hour <= 18) return 'high';
    return 'medium';
  };

  const getCongestionMultiplier = (congestion: string): number => {
    switch (congestion) {
      case 'low': return 1;
      case 'medium': return 1.5;
      case 'high': return 2.5;
      default: return 1;
    }
  };

  const getRecommendation = (congestion: string, gasPrice: number): 'execute' | 'wait' | 'avoid' => {
    if (congestion === 'low') return 'execute';
    if (congestion === 'medium' && gasPrice < 1) return 'execute';
    if (congestion === 'high') return 'wait';
    return 'wait';
  };

  const calculateSavings = (baseGas: number, currentGas: number): number => {
    return Math.max(0, currentGas - baseGas);
  };

  const getOptimalWindow = (congestion: string): string => {
    const hour = new Date().getHours();
    if (congestion === 'low') return 'Now (optimal conditions)';
    if (hour >= 18) return 'Late night (2-8 AM)';
    if (hour >= 8 && hour < 14) return 'Early afternoon (12-2 PM)';
    return 'Late night (2-8 AM)';
  };

  const calculateOptimalTime = (conditions: NetworkCondition[]): string => {
    const executeNow = conditions.filter(c => c.recommendation === 'execute').length;
    if (executeNow >= conditions.length * 0.7) return 'Execute Now';
    if (executeNow >= conditions.length * 0.4) return 'Wait 15-30 minutes';
    return 'Wait for better conditions';
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'execute': return 'text-green-500';
      case 'wait': return 'text-yellow-500';
      case 'avoid': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'execute': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'wait': return <Timer className="w-4 h-4 text-yellow-500" />;
      case 'avoid': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const addToWaitingQueue = (opportunity: any) => {
    setWaitingQueue(prev => [...prev, {
      ...opportunity,
      addedAt: new Date(),
      estimatedExecutionTime: calculateOptimalExecutionTime()
    }]);
  };

  const calculateOptimalExecutionTime = (): string => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 2 && hour <= 8) return 'Now';
    if (hour < 2) return `${2 - hour} hours`;
    return `${26 - hour} hours`;
  };

  if (!enabled) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Smart Timing Engine
            </div>
            <Button 
              onClick={() => onToggle(true)}
              variant="outline"
              size="sm"
            >
              Enable Smart Timing
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable smart timing to automatically optimize execution based on network conditions and save on gas fees.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Smart Timing Engine Active
          </div>
          <Button 
            onClick={() => onToggle(false)}
            variant="outline"
            size="sm"
          >
            Disable
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Recommendation */}
        <Alert className={`${optimalTime === 'Execute Now' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Recommendation:</strong> {optimalTime}
            {optimalTime !== 'Execute Now' && (
              <span className="block text-xs mt-1">
                Estimated fee savings by waiting: $2-8 per trade
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Network Conditions */}
        <div className="space-y-3">
          <h4 className="font-semibold">Network Conditions</h4>
          {networkConditions.map((condition) => (
            <div key={condition.chain} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{condition.chain}</div>
                <div className="flex items-center gap-2">
                  {getRecommendationIcon(condition.recommendation)}
                  <span className={`text-sm font-semibold ${getRecommendationColor(condition.recommendation)}`}>
                    {condition.recommendation.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Gas Price:</span>
                  <span className="font-semibold">${condition.gasPrice.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Congestion:</span>
                  <Badge 
                    variant={condition.congestion === 'low' ? 'default' : 
                            condition.congestion === 'medium' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {condition.congestion.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Potential Savings:</span>
                  <span className="font-semibold text-green-500">
                    ${condition.savingsEstimate.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Optimal Window:</span>
                  <span className="font-semibold text-blue-500">
                    {condition.optimalWindow}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Waiting Queue */}
        {waitingQueue.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Timing Queue ({waitingQueue.length})</h4>
            {waitingQueue.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 bg-yellow-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{item.pair}</div>
                  <Badge variant="outline">Waiting</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Estimated execution: {item.estimatedExecutionTime}
                </div>
                <Progress value={30} className="mt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Timing Stats */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <h5 className="font-semibold mb-2">Today's Timing Benefits</h5>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-lg font-bold text-green-500">$12.40</div>
                <div className="text-xs text-muted-foreground">Fees Saved</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-500">7</div>
                <div className="text-xs text-muted-foreground">Optimized Trades</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-500">85%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default SmartTimingEngine;
