
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Brain } from 'lucide-react';

interface AITimingSectionProps {
  strategies: any[];
  marketConditions: any;
  performance: any;
  activeRecommendations: any[];
  toggleStrategy: (id: string) => void;
}

const AITimingSection = ({ 
  strategies, 
  marketConditions, 
  performance, 
  activeRecommendations, 
  toggleStrategy 
}: AITimingSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI-Powered Timing Optimization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Active Strategies</h4>
            {strategies.map((strategy) => (
              <div key={strategy.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{strategy.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Score: {strategy.currentScore.toFixed(1)} | Profit: +{strategy.profitIncrease.toFixed(1)}%
                  </div>
                </div>
                <Switch 
                  checked={strategy.enabled}
                  onCheckedChange={() => toggleStrategy(strategy.id)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Market Conditions</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Volatility</span>
                <span className="font-semibold">{marketConditions.volatility.toFixed(1)}%</span>
              </div>
              <Progress value={marketConditions.volatility} />
              
              <div className="flex justify-between text-sm">
                <span>Liquidity Index</span>
                <span className="font-semibold">{marketConditions.liquidityIndex.toFixed(1)}</span>
              </div>
              <Progress value={marketConditions.liquidityIndex} />
              
              <div className="flex justify-between text-sm">
                <span>Gas Efficiency</span>
                <span className="font-semibold">{marketConditions.gasOptimization.toFixed(1)}%</span>
              </div>
              <Progress value={marketConditions.gasOptimization} />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Performance</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">+{performance.profitIncrease.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Profit Increase</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">{performance.successRate.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-600">{performance.executedTrades}</div>
                <div className="text-xs text-muted-foreground">AI Trades</div>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <div className="text-lg font-bold text-orange-600">${performance.totalProfit.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Total Profit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Recommendations */}
        {activeRecommendations.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800">AI Recommendations</span>
            </div>
            <div className="space-y-2">
              {activeRecommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-semibold">{rec.action}</div>
                    <div className="text-muted-foreground">{rec.reason}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">+{rec.expectedProfit.toFixed(1)}%</Badge>
                    <Badge variant={rec.confidence > 80 ? 'default' : 'secondary'}>
                      {rec.confidence.toFixed(0)}% confidence
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AITimingSection;
