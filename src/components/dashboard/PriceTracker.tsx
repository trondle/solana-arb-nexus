
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Wifi, WifiOff } from 'lucide-react';
import { PriceAggregator } from '@/services/priceAggregator';
import { WebSocketManager } from '@/services/webSocketManager';

interface PriceData {
  dex: string;
  pair: string;
  price: number;
  change24h: number;
  volume: number;
  spread: number;
  lastUpdated: string;
  source: string;
}

interface ChartDataPoint {
  time: string;
  uniswap: number;
  sushiswap: number;
  curve: number;
  oneInch: number;
}

const PriceTracker = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Initialize WebSocket connection
    const wsManager = WebSocketManager.getInstance();
    
    const initializeRealTime = async () => {
      try {
        await wsManager.connect();
        setIsRealTimeActive(true);
        
        // Start mock data stream for development
        wsManager.startMockDataStream();
        
        // Subscribe to price updates
        const unsubscribe = wsManager.subscribe(
          'price_updates',
          (data) => {
            if (data.type === 'price_update') {
              updatePriceData();
              setLastUpdate(new Date());
            }
          },
          (data) => data.type === 'price_update'
        );

        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize real-time updates:', error);
        setIsRealTimeActive(false);
      }
    };

    // Start price aggregator
    PriceAggregator.startRealTimeUpdates();
    
    // Subscribe to price aggregator updates
    const priceUnsubscribe = PriceAggregator.subscribe((prices) => {
      setLastUpdate(new Date());
    });

    const updatePriceData = async () => {
      const pairs = ['SOL/USDC', 'SOL/USDT', 'ETH/SOL'];
      const dexes = ['Uniswap V3', 'SushiSwap', 'Curve', '1inch', 'Paraswap'];
      
      const newPriceData: PriceData[] = [];
      
      for (const pair of pairs) {
        for (const dex of dexes) {
          // Get real-time price from aggregator
          const tokenPrice = await PriceAggregator.getTokenPrice('SOL');
          const basePrice = tokenPrice?.price || 23.45;
          
          // Add some DEX-specific variance
          const dexVariance = {
            'Uniswap V3': 0,
            'SushiSwap': 0.02,
            'Curve': -0.01,
            '1inch': 0.01,
            'Paraswap': -0.005
          };
          
          const price = basePrice + (dexVariance[dex as keyof typeof dexVariance] || 0) + (Math.random() - 0.5) * 0.1;
          
          newPriceData.push({
            dex,
            pair,
            price,
            change24h: tokenPrice?.change24h || (Math.random() - 0.5) * 10,
            volume: tokenPrice?.volume24h || Math.random() * 1000000,
            spread: Math.random() * 0.02,
            lastUpdated: new Date().toLocaleTimeString(),
            source: tokenPrice?.source || 'aggregated'
          });
        }
      }
      
      setPriceData(newPriceData);
    };

    const updateChartData = () => {
      setChartData(prev => {
        const newData = [...prev.slice(-29)]; // Keep last 29 points
        const now = new Date();
        
        newData.push({
          time: now.toLocaleTimeString(),
          uniswap: 23.45 + Math.sin(Date.now() * 0.001) * 0.3 + (Math.random() - 0.5) * 0.05,
          sushiswap: 23.47 + Math.cos(Date.now() * 0.0015) * 0.25 + (Math.random() - 0.5) * 0.05,
          curve: 23.43 + Math.sin(Date.now() * 0.0012) * 0.2 + (Math.random() - 0.5) * 0.05,
          oneInch: 23.46 + Math.cos(Date.now() * 0.0008) * 0.15 + (Math.random() - 0.5) * 0.05
        });
        
        return newData;
      });
    };

    // Initial data load
    updatePriceData();
    
    // Generate initial chart data
    const initialChartData: ChartDataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 2000);
      initialChartData.push({
        time: timestamp.toLocaleTimeString(),
        uniswap: 23.45 + Math.sin(i * 0.1) * 0.3 + (Math.random() - 0.5) * 0.1,
        sushiswap: 23.47 + Math.cos(i * 0.15) * 0.25 + (Math.random() - 0.5) * 0.1,
        curve: 23.43 + Math.sin(i * 0.12) * 0.2 + (Math.random() - 0.5) * 0.1,
        oneInch: 23.46 + Math.cos(i * 0.08) * 0.15 + (Math.random() - 0.5) * 0.1
      });
    }
    setChartData(initialChartData);

    // Set up intervals
    const priceInterval = setInterval(updatePriceData, 3000);
    const chartInterval = setInterval(updateChartData, 2000);
    
    // Initialize real-time connection
    let cleanup: (() => void) | undefined;
    initializeRealTime().then(unsubscribe => {
      cleanup = unsubscribe;
    });

    return () => {
      clearInterval(priceInterval);
      clearInterval(chartInterval);
      priceUnsubscribe();
      if (cleanup) cleanup();
      wsManager.disconnect();
    };
  }, []);

  const chartConfig = {
    uniswap: {
      label: "Uniswap V3",
      color: "hsl(var(--chart-1))",
    },
    sushiswap: {
      label: "SushiSwap",
      color: "hsl(var(--chart-2))",
    },
    curve: {
      label: "Curve",
      color: "hsl(var(--chart-3))",
    },
    oneInch: {
      label: "1inch",
      color: "hsl(var(--chart-4))",
    },
  };

  const groupedData = priceData.reduce((acc, item) => {
    if (!acc[item.pair]) acc[item.pair] = [];
    acc[item.pair].push(item);
    return acc;
  }, {} as Record<string, PriceData[]>);

  return (
    <div className="space-y-6">
      {/* Real-time Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isRealTimeActive ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                {isRealTimeActive ? 'Live Price Streaming' : 'Real-time Disconnected'}
              </span>
              <Badge variant={isRealTimeActive ? 'default' : 'destructive'}>
                {isRealTimeActive ? 'Connected' : 'Offline'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Price Movement (SOL/USDC)
            {isRealTimeActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="uniswap" stroke="var(--color-uniswap)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sushiswap" stroke="var(--color-sushiswap)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="curve" stroke="var(--color-curve)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="oneInch" stroke="var(--color-oneInch)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Enhanced Price Tables */}
      {Object.entries(groupedData).map(([pair, prices]) => (
        <Card key={pair}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {pair} Prices Across DEXs
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {prices.map((price, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      price.dex === 'Uniswap V3' ? 'default' : 
                      price.dex === 'SushiSwap' ? 'secondary' : 
                      price.dex === 'Curve' ? 'outline' :
                      'default'
                    }>
                      {price.dex}
                    </Badge>
                    <div>
                      <div className="font-medium">${price.price.toFixed(4)}</div>
                      <div className="text-sm text-muted-foreground">
                        Vol: ${(price.volume / 1000).toFixed(0)}K | Source: {price.source}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${price.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {price.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(price.change24h).toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Spread: {(price.spread * 100).toFixed(2)}% | {price.lastUpdated}
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
