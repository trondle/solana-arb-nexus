import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Activity,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';

const UnifiedTradingDashboard = () => {
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
    stats,
    currentRpcEndpoint,
    rpcLatency
  } = useTradingStore();

  const [engine] = useState(() => UnifiedTradingEngine.getInstance());
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    initializeEngine();
    return () => {
      engine.shutdown();
    };
  }, [engine]);

  const initializeEngine = async () => {
    if (isWalletConnected) return;
    
    try {
      const connected = PhantomWalletService.isWalletConnected();
      if (connected) {
        setIsInitializing(true);
        await engine.initialize();
        setIsInitializing(false);
      }
    } catch (error) {
      console.error('Engine initialization failed:', error);
      setIsInitializing(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const result = await PhantomWalletService.connect();
      if (result.success) {
        setIsInitializing(true);
        await engine.initialize();
        setIsInitializing(false);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setIsInitializing(false);
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
    if (result.success) {
      console.log('✅ Opportunity executed successfully');
    } else {
      console.error('❌ Opportunity execution failed:', result.error);
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Unified Trading Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Phantom Wallet</h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to access the unified trading engine with arbitrage, flash loans, and Jito MEV bundles.
            </p>
            <Button 
              onClick={handleConnectWallet} 
              disabled={isInitializing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isInitializing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Connect & Initialize Engine
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engine Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Unified Trading Engine
            {isEngineActive && (
              <Badge variant="default" className="bg-green-500">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            {emergencyMode && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Emergency
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleScanning}
                variant={isScanning ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
              </Button>
              
              <div className="flex items-center gap-2 text-sm">
                {rpcLatency > 0 ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span>RPC: {rpcLatency}ms</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Active Positions: {activePositions.length} • 
              Total Trades: {stats.totalTrades} • 
              Success Rate: {stats.successRate.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)} • 
            Balance: ${walletBalance.totalUSD.toFixed(2)} • 
            RPC: {currentRpcEndpoint.split('/')[2]}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Total Profit</span>
            </div>
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${stats.totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Today's Profit</span>
            </div>
            <div className={`text-2xl font-bold ${stats.profitToday >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${stats.profitToday.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.successRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Opportunities</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {opportunities.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Trading Opportunities
            <Badge variant="outline">{opportunities.length} Available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({opportunities.length})</TabsTrigger>
              <TabsTrigger value="arbitrage">Arbitrage ({opportunities.filter(o => o.type === 'arbitrage').length})</TabsTrigger>
              <TabsTrigger value="flash-loan">Flash Loans ({opportunities.filter(o => o.type === 'flash-loan').length})</TabsTrigger>
              <TabsTrigger value="micro-mev">Micro-MEV ({opportunities.filter(o => o.type === 'micro-mev').length})</TabsTrigger>
              <TabsTrigger value="jito-bundle">Jito Bundles ({opportunities.filter(o => o.type === 'jito-bundle').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-3 mt-4">
              {opportunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <div>No opportunities found</div>
                  <div className="text-sm">Start scanning to find trading opportunities</div>
                </div>
              ) : (
                opportunities.slice(0, 10).map((opportunity) => (
                  <OpportunityCard 
                    key={opportunity.id} 
                    opportunity={opportunity} 
                    onExecute={executeOpportunity}
                    disabled={!isEngineActive || emergencyMode}
                  />
                ))
              )}
            </TabsContent>
            
            {/* Other tab contents would filter opportunities by type */}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Trades */}
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

// Opportunity Card Component
const OpportunityCard: React.FC<{
  opportunity: any;
  onExecute: (opportunity: any) => void;
  disabled: boolean;
}> = ({ opportunity, onExecute, disabled }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'arbitrage': return 'bg-blue-100 text-blue-700';
      case 'flash-loan': return 'bg-yellow-100 text-yellow-700';
      case 'micro-mev': return 'bg-green-100 text-green-700';
      case 'jito-bundle': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-gradient-to-r from-white to-green-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Badge className={getTypeColor(opportunity.type)}>
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
          <span className="text-muted-foreground">Token: </span>
          <span className="font-semibold">{opportunity.token}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Time: </span>
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
          onClick={() => onExecute(opportunity)}
          size="sm"
          className="bg-green-500 hover:bg-green-600"
          disabled={disabled}
        >
          Execute
        </Button>
      </div>
    </div>
  );
};

export default UnifiedTradingDashboard;
