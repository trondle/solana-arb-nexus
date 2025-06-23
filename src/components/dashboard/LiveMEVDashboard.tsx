
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLivePrices } from '@/hooks/useLivePrices';
import { PersonalApiService } from '@/services/personalApiService';
import { 
  Zap, 
  TrendingUp, 
  Activity, 
  Target, 
  DollarSign, 
  Wifi, 
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';

const LiveMEVDashboard = () => {
  const { 
    prices, 
    arbitragePrices, 
    bestOpportunities, 
    isConnected, 
    lastUpdate, 
    error, 
    refreshPrices 
  } = useLivePrices(['SOL', 'USDC', 'USDT', 'ETH']);

  const [autoExecute, setAutoExecute] = useState(false);
  const [profitThreshold, setProfitThreshold] = useState(0.3);
  const [totalProfit, setTotalProfit] = useState(0);
  const [executedTrades, setExecutedTrades] = useState(0);

  // Simulate MEV execution for demo
  const executeTrade = async (opportunity: any) => {
    console.log('Executing MEV trade:', opportunity);
    
    // Simulate trade execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const profit = (opportunity.profitOpportunity / 100) * 1000; // Simulate $1000 trade
    setTotalProfit(prev => prev + profit);
    setExecutedTrades(prev => prev + 1);
    
    console.log(`✓ Trade executed: ${profit.toFixed(2)} profit`);
  };

  useEffect(() => {
    if (autoExecute && bestOpportunities.length > 0) {
      const topOpportunity = bestOpportunities[0];
      if (topOpportunity.profitOpportunity && topOpportunity.profitOpportunity >= profitThreshold) {
        executeTrade(topOpportunity);
      }
    }
  }, [bestOpportunities, autoExecute, profitThreshold]);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                Live MEV Arbitrage System
              </span>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Activity className="w-4 h-4" />
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={refreshPrices}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>Connection Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* MEV Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold text-green-600">${totalProfit.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Executed Trades</p>
                <p className="text-2xl font-bold">{executedTrades}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Opportunities</p>
                <p className="text-2xl font-bold">{bestOpportunities.length}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {executedTrades > 0 ? '100%' : '0%'}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Arbitrage Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Live MEV Arbitrage Opportunities
            {bestOpportunities.length > 0 && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No profitable opportunities detected</p>
              <p className="text-sm text-muted-foreground">Scanning Jupiter, Base, and Fantom...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bestOpportunities.map((opp, index) => (
                <div key={`${opp.token}-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{opp.token}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Buy: {opp.bestBuy?.chain} → Sell: {opp.bestSell?.chain}
                      </span>
                    </div>
                    <Badge variant={
                      (opp.profitOpportunity || 0) > 1 ? 'default' : 
                      (opp.profitOpportunity || 0) > 0.5 ? 'secondary' : 'outline'
                    }>
                      +{opp.profitOpportunity?.toFixed(2)}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Buy Price</p>
                      <p className="font-semibold">${opp.bestBuy?.price.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sell Price</p>
                      <p className="font-semibold">${opp.bestSell?.price.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Est. Profit</p>
                      <p className="font-semibold text-green-600">
                        ${((opp.profitOpportunity || 0) * 10).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volume Check</p>
                      <p className="font-semibold">
                        {opp.solanaPrice?.volume24h || opp.basePrice?.volume24h ? '✓' : '⚠️'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => executeTrade(opp)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Execute MEV Trade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chain Price Monitor */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Chain Price Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {arbitragePrices.map((tokenData) => (
              <div key={tokenData.token} className="border rounded p-3">
                <h4 className="font-semibold mb-2">{tokenData.token}</h4>
                <div className="space-y-2 text-sm">
                  {tokenData.solanaPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Solana:</span>
                      <span>${tokenData.solanaPrice.price.toFixed(4)}</span>
                    </div>
                  )}
                  {tokenData.basePrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base:</span>
                      <span>${tokenData.basePrice.price.toFixed(4)}</span>
                    </div>
                  )}
                  {tokenData.fantomPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fantom:</span>
                      <span>${tokenData.fantomPrice.price.toFixed(4)}</span>
                    </div>
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

export default LiveMEVDashboard;
