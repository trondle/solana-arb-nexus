
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PriceData {
  dex: string;
  pair: string;
  price: number;
  change24h: number;
  volume: number;
  spread: number;
  lastUpdated: string;
}

interface ChartDataPoint {
  time: string;
  raydium: number;
  orca: number;
  jupiter: number;
}

const PriceTracker = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Simulate real-time price updates
  useEffect(() => {
    const generateMockData = (): PriceData[] => {
      const pairs = ['SOL/USDC', 'SOL/USDT', 'ETH/SOL'];
      const dexes = ['Raydium', 'Orca', 'Jupiter'];
      const basePrice = 23.45;
      
      return pairs.flatMap(pair => 
        dexes.map(dex => ({
          dex,
          pair,
          price: basePrice + (Math.random() - 0.5) * 0.5,
          change24h: (Math.random() - 0.5) * 10,
          volume: Math.random() * 1000000,
          spread: Math.random() * 0.02,
          lastUpdated: new Date().toLocaleTimeString()
        }))
      );
    };

    const generateChartData = (): ChartDataPoint[] => {
      const data: ChartDataPoint[] = [];
      const now = Date.now();
      
      for (let i = 29; i >= 0; i--) {
        const timestamp = new Date(now - i * 1000);
        data.push({
          time: timestamp.toLocaleTimeString(),
          raydium: 23.45 + Math.sin(i * 0.1) * 0.3 + (Math.random() - 0.5) * 0.1,
          orca: 23.47 + Math.cos(i * 0.15) * 0.25 + (Math.random() - 0.5) * 0.1,
          jupiter: 23.43 + Math.sin(i * 0.12) * 0.2 + (Math.random() - 0.5) * 0.1
        });
      }
      return data;
    };

    setPriceData(generateMockData());
    setChartData(generateChartData());

    const interval = setInterval(() => {
      setPriceData(generateMockData());
      setChartData(prev => {
        const newData = [...prev.slice(1)];
        const lastTime = new Date();
        newData.push({
          time: lastTime.toLocaleTimeString(),
          raydium: 23.45 + Math.sin(Date.now() * 0.001) * 0.3 + (Math.random() - 0.5) * 0.1,
          orca: 23.47 + Math.cos(Date.now() * 0.0015) * 0.25 + (Math.random() - 0.5) * 0.1,
          jupiter: 23.43 + Math.sin(Date.now() * 0.0012) * 0.2 + (Math.random() - 0.5) * 0.1
        });
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const chartConfig = {
    raydium: {
      label: "Raydium",
      color: "hsl(var(--chart-1))",
    },
    orca: {
      label: "Orca",
      color: "hsl(var(--chart-2))",
    },
    jupiter: {
      label: "Jupiter",
      color: "hsl(var(--chart-3))",
    },
  };

  const groupedData = priceData.reduce((acc, item) => {
    if (!acc[item.pair]) acc[item.pair] = [];
    acc[item.pair].push(item);
    return acc;
  }, {} as Record<string, PriceData[]>);

  return (
    <div className="space-y-6">
      {/* Real-time Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-time Price Movement (SOL/USDC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="raydium" stroke="var(--color-raydium)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="orca" stroke="var(--color-orca)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="jupiter" stroke="var(--color-jupiter)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Price Tables by Pair */}
      {Object.entries(groupedData).map(([pair, prices]) => (
        <Card key={pair}>
          <CardHeader>
            <CardTitle>{pair} Prices Across DEXs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {prices.map((price, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={price.dex === 'Raydium' ? 'default' : price.dex === 'Orca' ? 'secondary' : 'outline'}>
                      {price.dex}
                    </Badge>
                    <div>
                      <div className="font-medium">${price.price.toFixed(4)}</div>
                      <div className="text-sm text-muted-foreground">
                        Vol: ${(price.volume / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${price.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {price.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(price.change24h).toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Spread: {(price.spread * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PriceTracker;
