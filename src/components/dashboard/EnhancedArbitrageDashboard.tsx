
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  Clock, 
  DollarSign, 
  BarChart3,
  Network,
  Target,
  Sparkles
} from 'lucide-react';
import { EnhancedFlashLoanOptimizer } from '../../utils/enhancedFlashLoanOptimizer';

const EnhancedArbitrageDashboard = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [executionAdvantages, setExecutionAdvantages] = useState<any>(null);
  const [tradingStats, setTradingStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const opps = await EnhancedFlashLoanOptimizer.findAllOpportunities();
        const advantages = EnhancedFlashLoanOptimizer.getExecutionAdvantages();
        const stats = EnhancedFlashLoanOptimizer.getTradingStats();
        
        setOpportunities(opps);
        setExecutionAdvantages(advantages);
        setTradingStats(stats);
      } catch (error) {
        console.error('Error loading enhanced data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    const colors = {
      'bridge': 'bg-blue-500',
      'multihop': 'bg-purple-500',
      'triangle': 'bg-green-500',
      'yield': 'bg-yellow-500',
      'regular': 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'bridge': <Network className="w-4 h-4" />,
      'multihop': <BarChart3 className="w-4 h-4" />,
      'triangle': <Target className="w-4 h-4" />,
      'yield': <Sparkles className="w-4 h-4" />,
      'regular': <TrendingUp className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <TrendingUp className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div>Loading enhanced arbitrage opportunities...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Execution Advantages Overview */}
      {executionAdvantages && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Private Execution Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {executionAdvantages.latencyImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Faster Execution</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {executionAdvantages.mevProtection}%
                </div>
                <div className="text-sm text-muted-foreground">MEV Protection</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  +{executionAdvantages.estimatedProfitBoost}%
                </div>
                <div className="text-sm text-muted-foreground">Profit Boost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {executionAdvantages.successRateImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Higher Success</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trading Statistics */}
      {tradingStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Your Trading Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
                <div className="text-lg font-semibold">
                  ${(tradingStats.totalVolume / 1000000).toFixed(1)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
                <div className="text-lg font-semibold text-green-500">
                  {(tradingStats.successRate * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Profit Generated</div>
                <div className="text-lg font-semibold text-green-500">
                  ${tradingStats.profitGenerated.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Win Streak</div>
                <div className="text-lg font-semibold text-blue-500">
                  {tradingStats.consecutiveSuccesses}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Enhanced Arbitrage Opportunities
            </div>
            <Badge variant="default" className="bg-green-500">
              {opportunities.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bridge">Bridge</TabsTrigger>
              <TabsTrigger value="multihop">Multi-hop</TabsTrigger>
              <TabsTrigger value="triangle">Triangle</TabsTrigger>
              <TabsTrigger value="yield">Yield</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {opportunities.slice(0, 10).map((opp, index) => (
                <div key={opp.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getTypeColor(opp.type)} text-white`}>
                        {getTypeIcon(opp.type)}
                        {opp.type.toUpperCase()}
                      </Badge>
                      <div>
                        <div className="font-semibold">
                          {opp.type === 'bridge' ? `${opp.data.token} Bridge Arbitrage` :
                           opp.type === 'multihop' ? `${opp.data.hops}-Hop Cross-Chain` :
                           opp.type === 'triangle' ? `${opp.data.tokenA}→${opp.data.tokenB}→${opp.data.tokenC}` :
                           opp.type === 'yield' ? `${opp.data.protocol} Yield + Arbitrage` :
                           'Regular Arbitrage'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {opp.type === 'bridge' ? `${opp.data.fromChain} → ${opp.data.toChain}` :
                           opp.type === 'multihop' ? opp.data.chains.join(' → ') :
                           opp.type === 'triangle' ? `${opp.data.chain} • ${opp.data.dexes.join(', ')}` :
                           opp.type === 'yield' ? `${opp.data.chain} • ${opp.data.combinedYield.toFixed(1)}% APY` :
                           'Cross-chain opportunity'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-500">
                        ${opp.netProfit.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {opp.confidence.toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Gross Profit</div>
                      <div className="font-semibold">${opp.estimatedProfit.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Execution Time</div>
                      <div className="font-semibold">
                        {opp.executionPlan?.estimatedExecutionTime ? 
                          `${(opp.executionPlan.estimatedExecutionTime / 1000).toFixed(1)}s` : 
                          '~3s'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-semibold">
                        {opp.executionPlan?.estimatedSuccessRate?.toFixed(1) || '95.0'}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Priority Score</div>
                      <div className="font-semibold">{opp.priority?.toFixed(1) || '80.0'}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {opp.executionPlan?.mevProtected && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <Shield className="w-3 h-3 mr-1" />
                          MEV Protected
                        </Badge>
                      )}
                      {opp.feeOptimization?.savings > 20 && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {opp.feeOptimization.savings.toFixed(0)}% Fee Savings
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      <Zap className="w-4 h-4 mr-2" />
                      Execute Enhanced
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Individual type tabs would show filtered opportunities */}
            {['bridge', 'multihop', 'triangle', 'yield'].map(type => (
              <TabsContent key={type} value={type} className="space-y-4">
                {opportunities
                  .filter(opp => opp.type === type)
                  .slice(0, 5)
                  .map(opp => (
                    <div key={opp.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">
                          ${opp.netProfit.toFixed(2)} Net Profit
                        </div>
                        <Badge className={`${getTypeColor(opp.type)} text-white`}>
                          {type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedArbitrageDashboard;
