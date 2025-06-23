
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFreeLivePrices } from '@/hooks/useFreeLivePrices';
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
  CheckCircle,
  Key
} from 'lucide-react';

const LiveMEVDashboard = () => {
  const { 
    prices, 
    arbitrageOpportunities, 
    bestOpportunities, 
    isConnected, 
    lastUpdate, 
    error, 
    refreshPrices,
    apiKey
  } = useFreeLivePrices(['SOL', 'USDC', 'USDT', 'ETH']);

  const [autoExecute, setAutoExecute] = useState(false);
  const [profitThreshold, setProfitThreshold] = useState(0.3);
  const [totalProfit, setTotalProfit] = useState(0);
  const [executedTrades, setExecutedTrades] = useState(0);

  // Simulate MEV execution for demo
  const executeTrade = async (opportunity: any) => {
    console.log('Executing FREE MEV trade:', opportunity);
    
    // Simulate trade execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const profit = (opportunity.profitPercent / 100) * 1000; // Simulate $1000 trade
    setTotalProfit(prev => prev + profit);
    setExecutedTrades(prev => prev + 1);
    
    console.log(`✅ FREE API Trade executed: $${profit.toFixed(2)} profit`);
  };

  useEffect(() => {
    if (autoExecute && bestOpportunities.length > 0) {
      const topOpportunity = bestOpportunities[0];
      if (topOpportunity.profitPercent >= profitThreshold) {
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
                FREE MEV Arbitrage System
              </span>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Key className="w-4 h-4" />
                {apiKey || 'No API Key'}
              </div>
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

      {/* Free Service Banner */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          <strong>FREE SERVICE:</strong> This system uses your own price API - No Jupiter, 1inch, or CoinGecko fees! 
          Live data from Binance, Coinbase, and DexScreener public endpoints.
        </AlertDescription>
      </Alert>

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
                <p className="text-sm text-muted-foreground">FREE Trades</p>
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
            FREE Live MEV Arbitrage Opportunities
            {bestOpportunities.length > 0 && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
            <Badge variant="outline" className="ml-auto">
              No API Costs!
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No profitable opportunities detected</p>
              <p className="text-sm text-muted-foreground">Scanning Solana, Base, and Fantom with FREE APIs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bestOpportunities.map((opp, index) => (
                <div key={`${opp.token}-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{opp.token}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Buy: {opp.buyChain} → Sell: {opp.sellChain}
                      </span>
                      <Badge variant="outline" className="text-green-600">
                        FREE API
                      </Badge>
                    </div>
                    <Badge variant={
                      opp.profitPercent > 1 ? 'default' : 
                      opp.profitPercent > 0.5 ? 'secondary' : 'outline'
                    }>
                      +{opp.profitPercent.toFixed(2)}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Buy Price</p>
                      <p className="font-semibold">${opp.buyPrice.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sell Price</p>
                      <p className="font-semibold">${opp.sellPrice.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Est. Profit</p>
                      <p className="font-semibold text-green-600">
                        ${opp.estimatedProfit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk Level</p>
                      <Badge variant={
                        opp.riskLevel === 'LOW' ? 'default' :
                        opp.riskLevel === 'MEDIUM' ? 'secondary' : 'destructive'
                      }>
                        {opp.riskLevel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confidence</p>
                      <p className="font-semibold">{(opp.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Last updated: {lastUpdate.toLocaleTimeString()} • FREE API Service
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => executeTrade(opp)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Execute FREE MEV Trade
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
          <CardTitle>Multi-Chain Price Monitor (FREE)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(prices).map(([key, priceData]) => (
              <div key={key} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{priceData.symbol}</h4>
                  <Badge variant="outline">{priceData.chain?.toUpperCase()}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">${priceData.price.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Change:</span>
                    <span className={priceData.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="text-xs">{priceData.source}</span>
                  </div>
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
