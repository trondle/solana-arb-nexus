
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, RefreshCw, Activity, WifiOff } from 'lucide-react';
import { useFreeLivePrices } from '../../hooks/useFreeLivePrices';

const PriceTracker = () => {
  const { 
    prices, 
    isConnected, 
    lastUpdate, 
    error,
    refreshPrices 
  } = useFreeLivePrices(['SOL', 'ETH', 'USDC', 'USDT', 'FTM']);

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(0)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-red-500" />
            Live Price Tracker - Disconnected
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
            <Activity className="w-5 h-5 text-red-500" />
            Live Price Tracker - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <div>Error loading live prices: {error}</div>
            <Button onClick={refreshPrices} className="mt-4" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const livePrices = Object.values(prices);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Live Price Tracker
            <Badge variant="default" className="bg-green-500">
              <Activity className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {lastUpdate ? `Updated ${new Date(lastUpdate).toLocaleTimeString()}` : 'Live'}
            </span>
            <Button onClick={refreshPrices} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {livePrices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <div>Loading live price data...</div>
            <div className="text-sm">Connecting to real-time price feeds</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live Price Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {livePrices.map((priceData, index) => (
                <div key={`${priceData.symbol}-${index}`} className="border rounded-lg p-3 bg-gradient-to-r from-white to-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{priceData.symbol}</div>
                    {getChangeIcon(priceData.change24h)}
                  </div>
                  <div className="text-lg font-bold">{formatPrice(priceData.price)}</div>
                  <div className={`text-sm ${getChangeColor(priceData.change24h)}`}>
                    {formatChange(priceData.change24h)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Vol: ${(priceData.volume24h / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {priceData.chain || 'Multi-chain'}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Data Status */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <Activity className="w-4 h-4" />
                <span className="font-semibold">Live Data Active</span>
              </div>
              <div className="text-sm text-green-700 mt-1">
                Real-time prices from {livePrices[0]?.source || 'live feeds'} • 
                Last update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'now'} • 
                {livePrices.length} tokens tracked
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceTracker;
