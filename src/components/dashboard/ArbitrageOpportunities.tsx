
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, DollarSign, Zap, WifiOff } from 'lucide-react';
import { useFreeLivePrices } from '../../hooks/useFreeLivePrices';

const ArbitrageOpportunities = () => {
  const { 
    arbitrageOpportunities, 
    isConnected, 
    lastUpdate,
    error 
  } = useFreeLivePrices(['SOL', 'ETH', 'USDC', 'USDT', 'FTM']);

  const [spreadData, setSpreadData] = useState<any[]>([]);

  // Generate spread data from live opportunities only
  useEffect(() => {
    if (arbitrageOpportunities.length > 0 && isConnected) {
      const tokenGroups = arbitrageOpportunities.reduce((acc, opp) => {
        const token = opp.token;
        if (!acc[token]) {
          acc[token] = [];
        }
        acc[token].push(opp.profitPercent);
        return acc;
      }, {} as Record<string, number[]>);

      const chartData = Object.entries(tokenGroups).map(([token, spreads]) => ({
        pair: `${token}/USDC`,
        currentSpread: Math.max(...spreads),
        avgSpread: spreads.reduce((sum, s) => sum + s, 0) / spreads.length,
        maxSpread: Math.max(...spreads)
      })).slice(0, 4);

      setSpreadData(chartData);
    } else {
      setSpreadData([]);
    }
  }, [arbitrageOpportunities, isConnected]);

  const chartConfig = {
    currentSpread: {
      label: "Current Spread",
      color: "hsl(var(--chart-1))",
    },
    avgSpread: {
      label: "Average Spread",
      color: "hsl(var(--chart-2))",
    },
    maxSpread: {
      label: "Max Spread",
      color: "hsl(var(--chart-3))",
    },
  };

  const getStatusColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-red-500" />
            Live Arbitrage Opportunities - Disconnected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <WifiOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <div>No live connection to price feeds</div>
            <div className="text-sm">Enable flash loan mode to connect to live data</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            Live Arbitrage Opportunities - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <div>Error loading live data: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Spread Analysis Chart - Only show if we have live data */}
      {spreadData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Live Spread Analysis by Trading Pair
              <Badge variant="default" className="bg-green-500">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spreadData}>
                  <XAxis dataKey="pair" />
                  <YAxis label={{ value: 'Spread %', angle: -90, position: 'insideLeft' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="currentSpread" fill="var(--color-currentSpread)" />
                  <Bar dataKey="avgSpread" fill="var(--color-avgSpread)" />
                  <Bar dataKey="maxSpread" fill="var(--color-maxSpread)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Live Opportunities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Live Arbitrage Opportunities
              <Badge variant="default" className="bg-green-500">LIVE</Badge>
            </div>
            <Badge variant="outline">
              {arbitrageOpportunities.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {arbitrageOpportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div>No live arbitrage opportunities found</div>
              <div className="text-sm">Monitoring live price feeds for profitable spreads...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {arbitrageOpportunities.slice(0, 8).map((opp, index) => (
                <div key={`live-${index}`} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(opp.confidence)}`}></div>
                      <div>
                        <div className="font-semibold">{opp.token}/USDC</div>
                        <div className="text-sm text-muted-foreground">
                          Chain {opp.buyChain} → Chain {opp.sellChain}
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      LIVE
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Spread</div>
                      <div className="font-semibold text-green-500">
                        {opp.profitPercent.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Profit Potential</div>
                      <div className="font-semibold flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {opp.estimatedProfit.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Risk Level</div>
                      <div className="font-semibold">
                        {opp.riskLevel}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Confidence</div>
                      <div className={`font-semibold ${getConfidenceColor(opp.confidence)}`}>
                        {opp.confidence.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Live data • Updated {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'now'}
                    </div>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      Execute Live Trade
                    </Button>
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

export default ArbitrageOpportunities;
