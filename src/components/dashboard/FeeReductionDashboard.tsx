
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  Zap, 
  DollarSign, 
  Target,
  BarChart3,
  CheckCircle,
  ArrowDown
} from 'lucide-react';
import { OptimizedOpportunity, useFeeReductionStats } from '@/hooks/useFeeOptimizer';

interface Props {
  optimizedOpportunities: OptimizedOpportunity[];
  userVolume?: number;
}

const FeeReductionDashboard: React.FC<Props> = ({ 
  optimizedOpportunities, 
  userVolume = 0 
}) => {
  const stats = useFeeReductionStats(optimizedOpportunities);

  return (
    <div className="space-y-6">
      {/* Fee Optimization Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-500" />
            Fee Optimization Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                ${stats.totalSavings.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Fee Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {stats.averageFeeReduction.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Fee Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                ${stats.totalGasSavings.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Gas Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {stats.batchableCount}
              </div>
              <div className="text-sm text-muted-foreground">Batchable Ops</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Flash Loan Provider Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.bestProvider && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-semibold text-green-700">
                    Optimal Provider: {stats.bestProvider.name}
                  </div>
                  <div className="text-sm text-green-600">
                    Fee: {stats.bestProvider.fee.toFixed(3)}% • 
                    Reliability: {stats.bestProvider.reliability}% • 
                    Est. Time: {(stats.bestProvider.estimatedTime / 1000).toFixed(1)}s
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Optimized
                </Badge>
              </div>

              {/* Volume-based discount progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Volume Discount Progress</span>
                  <span>${userVolume.toLocaleString()} / $1,000,000</span>
                </div>
                <Progress value={Math.min((userVolume / 1000000) * 100, 100)} />
                <div className="text-xs text-muted-foreground">
                  {userVolume >= 1000000 ? (
                    <span className="text-green-600">✓ Maximum 20% discount applied</span>
                  ) : userVolume >= 500000 ? (
                    <span className="text-blue-600">✓ 10% discount applied - Trade $500K more for 20% discount</span>
                  ) : (
                    <span>Trade $500K+ to unlock volume discounts</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DEX Fee Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            DEX Fee Tier Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizedOpportunities.slice(0, 3).map((op, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{op.pair}</div>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-semibold">
                      -{((op.computedFees.savings / op.requiredCapital) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Buy DEX</div>
                    <div className="font-semibold">
                      {op.optimalBuyDex.name} ({op.optimalBuyDex.effectiveFee.toFixed(2)}%)
                    </div>
                    {op.optimalBuyDex.makerRebate > 0 && (
                      <div className="text-green-600">
                        +{op.optimalBuyDex.makerRebate.toFixed(2)}% rebate
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-muted-foreground">Sell DEX</div>
                    <div className="font-semibold">
                      {op.optimalSellDex.name} ({op.optimalSellDex.effectiveFee.toFixed(2)}%)
                    </div>
                    {op.optimalSellDex.makerRebate > 0 && (
                      <div className="text-green-600">
                        +{op.optimalSellDex.makerRebate.toFixed(2)}% rebate
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batch Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Batch Execution Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.batchableCount}
                </div>
                <div className="text-sm text-muted-foreground">Batchable Opportunities</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.batchableCount > 0 ? '60-70%' : '0%'}
                </div>
                <div className="text-sm text-muted-foreground">Potential Gas Savings</div>
              </div>
            </div>

            {stats.batchableCount > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-green-700">Batch Optimization Available</span>
                </div>
                <div className="text-sm text-green-600">
                  You can batch {stats.batchableCount} compatible opportunities to save approximately 
                  ${stats.totalGasSavings.toFixed(2)} in gas fees per execution.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeReductionDashboard;
