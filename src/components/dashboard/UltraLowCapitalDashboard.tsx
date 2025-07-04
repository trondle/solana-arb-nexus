
import React, { useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTradingStore } from '../../store/tradingStore';
import { UnifiedTradingEngine } from '../../services/unifiedTradingEngine';
import { PhantomWalletService } from '../../services/phantomWalletService';
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Target, 
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Layers,
  Bolt
} from 'lucide-react';

const UltraLowCapitalDashboard = () => {
  const {
    isWalletConnected,
    walletAddress,
    walletBalance,
    isEngineActive,
    isScanning,
    emergencyMode,
    opportunities,
    activePositions,
    tradeHistory,
    stats
  } = useTradingStore();

  const engine = UnifiedTradingEngine.getInstance();

  // Filter opportunities for ultra-low capital (under $100)
  const ultraLowOpportunities = opportunities.filter(
    opp => opp.requiredCapital <= 100 && (opp.riskLevel === 'ultra-low' || opp.riskLevel === 'low')
  );

  const handleConnectWallet = async () => {
    try {
      const result = await PhantomWalletService.connect();
      if (result.success) {
        await engine.initialize();
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const toggleScanning = async () => {
    if (isScanning) {
      await engine.stopScanning();
    } else {
      await engine.startScanning();
    }
  };

  const executeOpportunity = async (opportunity: any) => {
    const result = await engine.executeOpportunity(opportunity);
    if (!result.success) {
      console.error('Execution failed:', result.error);
    }
  };

  const executeBundledTrades = async (opportunities: any[]) => {
    console.log('Executing bundled trades:', opportunities.length);
    for (const opp of opportunities.slice(0, 3)) {
      await executeOpportunity(opp);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  // Calculate capital efficiency and daily ROI
  const capitalUsed = Math.max(walletBalance.totalUSD, 1);
  const capitalEfficiency = (stats.totalProfit / capitalUsed) * 100;
  const dailyROI = (stats.profitToday / capitalUsed) * 100;

  if (!isWalletConnected) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Ultra-Low Capital MEV Bot
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Alert className="mb-6 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Mode:</strong> Connect your Phantom wallet to access live trading with real opportunities and execute actual transactions.
              </AlertDescription>
            </Alert>
            
            <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Phantom Wallet</h3>
            <p className="text-muted-foreground mb-6">
              Access ultra-low capital MEV opportunities starting from just $10. Execute flash loans with minimal collateral requirements.
            </p>
            <Button 
              onClick={handleConnectWallet} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Connect Phantom Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Ultra-Low Capital MEV Bot
            {emergencyMode && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Emergency Mode
              </Badge>
            )}
            {isEngineActive && (
              <Badge variant="outline" className="border-green-500 text-green-600">
                Engine Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleScanning}
              variant={isScanning ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Active Positions: {activePositions.length}</span>
              <span>•</span>
              <span>Success Rate: {stats.successRate.toFixed(1)}%</span>
              <span>•</span>
              <span>Live Trading</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capital Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Current Capital</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${walletBalance.totalUSD.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Live wallet balance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total Profit</span>
            </div>
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${stats.totalProfit.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Capital Efficiency: {capitalEfficiency.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Daily ROI</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {dailyROI.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Today's Profit: ${stats.profitToday.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Total Trades</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalTrades}
            </div>
            <div className="text-xs text-muted-foreground">
              Avg: ${stats.avgProfitPerTrade.toFixed(3)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Micro-Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Ultra-Low Capital Opportunities
            <Badge variant="outline">{ultraLowOpportunities.length} Available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ultraLowOpportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div>No ultra-low capital opportunities found</div>
              <div className="text-sm">Start scanning to find opportunities under $100...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Bundle Execution */}
              {ultraLowOpportunities.length >= 2 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold">Bundle Execution Available</div>
                    <div className="text-sm text-muted-foreground">
                      Execute {Math.min(3, ultraLowOpportunities.length)} trades simultaneously
                    </div>
                  </div>
                  <Button
                    onClick={() => executeBundledTrades(ultraLowOpportunities)}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Execute Bundle
                  </Button>
                </div>
              )}

              {ultraLowOpportunities.slice(0, 10).map((opportunity) => (
                <div key={opportunity.id} className="border rounded-lg p-3 bg-gradient-to-r from-white to-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-green-600">
                        {opportunity.type}
                      </Badge>
                      <span className="text-sm font-medium">
                        ${opportunity.estimatedProfit.toFixed(4)} profit
                      </span>
                    </div>
                    <Badge variant={opportunity.riskLevel === 'ultra-low' ? 'default' : 'secondary'}>
                      {opportunity.riskLevel} risk
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Capital: </span>
                      <span className="font-semibold">${opportunity.requiredCapital.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Profit %: </span>
                      <span className="font-semibold text-green-600">
                        {((opportunity.estimatedProfit / opportunity.requiredCapital) * 100).toFixed(3)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Execution: </span>
                      <span className="font-semibold">{opportunity.executionTimeMs}ms</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-muted-foreground">
                        Success: {(opportunity.successProbability * 100).toFixed(0)}%
                      </div>
                      <Progress 
                        value={opportunity.successProbability * 100} 
                        className="w-20 h-2"
                      />
                    </div>
                    <Button
                      onClick={() => executeOpportunity(opportunity)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      disabled={!isEngineActive || emergencyMode}
                    >
                      Execute Trade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flash Loan Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bolt className="w-5 h-5 text-yellow-500" />
            Ultra-Low Capital Flash Loans
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              Starting $10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium mb-2">Flash Loan Strategy</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Unified engine automatically selects best flash loan provider</div>
                <div>• Dynamic RPC selection for fastest execution</div>
                <div>• Integrated with Jito bundles for MEV protection</div>
                <div>• Real-time opportunity scanning across all DEXs</div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The unified trading engine now handles all flash loan execution automatically. 
                Simply start scanning and the engine will find and execute the best opportunities.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trade History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {tradeHistory.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No trades executed yet
            </div>
          ) : (
            <div className="space-y-2">
              {tradeHistory.slice(-10).reverse().map((trade, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant={trade.status === 'closed' ? "default" : "destructive"}>
                      {trade.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm">{trade.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${trade.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${trade.realizedPnL.toFixed(4)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </span>
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

export default UltraLowCapitalDashboard;
