
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, DollarSign, Zap } from 'lucide-react';

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyDex: string;
  sellDex: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  profitPotential: number;
  volume: number;
  confidence: number;
  timeDetected: string;
  status: 'active' | 'executed' | 'expired';
}

const ArbitrageOpportunities = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [spreadData, setSpreadData] = useState<any[]>([]);

  useEffect(() => {
    const generateOpportunities = (): ArbitrageOpportunity[] => {
      const pairs = ['SOL/USDC', 'SOL/USDT', 'ETH/SOL', 'RAY/SOL'];
      const dexes = ['Raydium', 'Orca', 'Jupiter'];
      const opportunities: ArbitrageOpportunity[] = [];

      for (let i = 0; i < 8; i++) {
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const buyDex = dexes[Math.floor(Math.random() * dexes.length)];
        let sellDex = dexes[Math.floor(Math.random() * dexes.length)];
        while (sellDex === buyDex) {
          sellDex = dexes[Math.floor(Math.random() * dexes.length)];
        }

        const basePrice = 23.45;
        const spread = 0.015 + Math.random() * 0.02; // 1.5% to 3.5%
        const buyPrice = basePrice * (1 - spread / 2);
        const sellPrice = basePrice * (1 + spread / 2);

        opportunities.push({
          id: `opp-${i}`,
          pair,
          buyDex,
          sellDex,
          buyPrice,
          sellPrice,
          spread: spread * 100,
          profitPotential: spread * basePrice * (10 + Math.random() * 90),
          volume: 10000 + Math.random() * 90000,
          confidence: 75 + Math.random() * 20,
          timeDetected: new Date(Date.now() - Math.random() * 300000).toLocaleTimeString(),
          status: Math.random() > 0.7 ? 'executed' : Math.random() > 0.1 ? 'active' : 'expired'
        });
      }

      return opportunities.sort((a, b) => b.profitPotential - a.profitPotential);
    };

    const generateSpreadData = () => {
      const data = [];
      const pairs = ['SOL/USDC', 'SOL/USDT', 'ETH/SOL', 'RAY/SOL'];
      
      pairs.forEach(pair => {
        data.push({
          pair,
          currentSpread: 1.2 + Math.random() * 2,
          avgSpread: 0.8 + Math.random() * 1.5,
          maxSpread: 2.5 + Math.random() * 1.5
        });
      });
      
      return data;
    };

    setOpportunities(generateOpportunities());
    setSpreadData(generateSpreadData());

    const interval = setInterval(() => {
      setOpportunities(generateOpportunities());
      setSpreadData(generateSpreadData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'executed':
        return 'bg-blue-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Spread Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Spread Analysis by Trading Pair
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

      {/* Opportunities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Live Arbitrage Opportunities
            </div>
            <Badge variant="outline">
              {opportunities.filter(o => o.status === 'active').length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(opp.status)}`}></div>
                    <div>
                      <div className="font-semibold">{opp.pair}</div>
                      <div className="text-sm text-muted-foreground">
                        Buy on {opp.buyDex} → Sell on {opp.sellDex}
                      </div>
                    </div>
                  </div>
                  <Badge variant={opp.status === 'active' ? 'default' : 'secondary'}>
                    {opp.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Spread</div>
                    <div className="font-semibold text-green-500">
                      {opp.spread.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Profit Potential</div>
                    <div className="font-semibold flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {opp.profitPotential.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Volume</div>
                    <div className="font-semibold">
                      ${(opp.volume / 1000).toFixed(0)}K
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
                    Detected at {opp.timeDetected}
                  </div>
                  {opp.status === 'active' && (
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      Execute Trade
                    </Button>
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

export default ArbitrageOpportunities;
