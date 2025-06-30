
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMicroMevBot } from '../../hooks/useMicroMevBot';
import { PhantomWalletService } from '../../services/phantomWalletService';
import { LiveTradingEngine } from '../../services/liveTradingEngine';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Activity,
  Play,
  Pause,
  RefreshCw,
  Gauge,
  Wallet,
  Lock,
  AlertTriangle
} from 'lucide-react';

const MicroMevDashboard = () => {
  const [isActive, setIsActive] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const {
    opportunities,
    isScanning,
    totalProfit,
    executionStats,
    speedMetrics,
    detectionStats,
    scanForOpportunities,
    executeOpportunity,
    executeTopOpportunities,
    clearCache
  } = useMicroMevBot(isActive && isWalletConnected);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (isWalletConnected) {
      updateWalletBalance();
    }
  }, [isWalletConnected]);

  const checkWalletConnection = async () => {
    try {
      await PhantomWalletService.initialize();
      const connected = PhantomWalletService.isWalletConnected();
      setIsWalletConnected(connected);
    } catch (error) {
      console.error('Wallet check failed:', error);
      setError(error instanceof Error ? error.message : 'Wallet check failed');
    }
  };

  const updateWalletBalance = async () => {
    try {
      const balance = await PhantomWalletService.getBalance();
      setWalletBalance(balance.totalUSD);
    } catch (error) {
      console.error('Balance update failed:', error);
    }
  };

  const handleToggleActive = async () => {
    if (!isWalletConnected) {
      setError('Please connect your Phantom wallet first');
      return;
    }

    if (walletBalance < 10) {
      setError('Minimum balance of $10 required for micro-MEV trading');
      return;
    }

    if (!isActive) {
      try {
        const engineActive = LiveTradingEngine.isEngineActive();
        if (!engineActive) {
          await LiveTradingEngine.initialize();
        }
        setIsActive(true);
        setError(null);
        await scanForOpportunities();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to start micro-MEV engine');
      }
    } else {
      setIsActive(false);
    }
  };

  const handleExecuteOpportunity = async (opportunity: any) => {
    try {
      setError(null);
      await updateWalletBalance(); // Refresh balance before execution
      
      if (walletBalance < opportunity.requiredCapital) {
        setError(`Insufficient balance. Required: $${opportunity.requiredCapital.toFixed(2)}, Available: $${walletBalance.toFixed(2)}`);
        return;
      }

      await executeOpportunity(opportunity);
      await updateWalletBalance(); // Refresh balance after execution
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to execute opportunity');
    }
  };

  const handleExecuteTopOpportunities = async () => {
    try {
      setError(null);
      await updateWalletBalance();
      
      const totalRequired = opportunities
        .filter(opp => opp.confidence > 85)
        .slice(0, 3)
        .reduce((sum, opp) => sum + opp.requiredCapital, 0);

      if (walletBalance < totalRequired) {
        setError(`Insufficient balance for batch execution. Required: $${totalRequired.toFixed(2)}, Available: $${walletBalance.toFixed(2)}`);
        return;
      }

      await executeTopOpportunities();
      await updateWalletBalance();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to execute opportunities');
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="space-y-6">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <strong>Wallet Connection Required:</strong> Connect your Phantom wallet to access live micro-MEV trading.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-400" />
              Micro-MEV Detection Engine
              <Badge variant="secondary">Locked</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Wallet Required</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Phantom wallet to access real-time micro-MEV opportunities and execute trades.
            </p>
            <Button 
              onClick={() => window.location.href = '/wallet'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Live Micro-MEV Detection Engine
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Real Trading
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Wallet Balance: ${walletBalance.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  {walletBalance < 10 ? 'Minimum $10 required' : 'Ready for trading'}
                </div>
              </div>
              <Badge variant={walletBalance >= 10 ? "default" : "destructive"}>
                {walletBalance >= 10 ? 'Sufficient' : 'Insufficient'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleToggleActive}
                variant={isActive ? "destructive" : "default"}
                className="flex items-center gap-2"
                disabled={walletBalance < 10}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isActive ? 'Stop Detection' : 'Start Live Trading'}
              </Button>
              
              <Button
                onClick={scanForOpportunities}
                variant="outline"
                disabled={isScanning || !isActive}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                Manual Scan
              </Button>

              <Button
                onClick={handleExecuteTopOpportunities}
                variant="outline"
                disabled={opportunities.length === 0 || !isActive}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Execute Top 3
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Avg Latency</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {speedMetrics.averageLatency?.toFixed(1) || 0}ms
            </div>
            <div className="text-xs text-muted-foreground">
              Target: &lt;100ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {executionStats.totalExecutions > 0 
                ? ((executionStats.successfulExecutions / executionStats.totalExecutions) * 100).toFixed(1)
                : 0
              }%
            </div>
            <div className="text-xs text-muted-foreground">
              {executionStats.totalExecutions} live executions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Total Profit</span>
            </div>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalProfit.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">
              Real profits/losses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Detection Speed</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {detectionStats.lastDetectionLatency?.toFixed(1) || 0}ms
            </div>
            <div className="text-xs text-muted-foreground">
              Last scan time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Micro-MEV Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Live Micro-MEV Opportunities
            <Badge variant="outline">{opportunities.length} Found</Badge>
            {isActive && (
              <Badge variant="default" className="bg-green-500">Live</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div>No live micro-MEV opportunities detected</div>
              <div className="text-sm">
                {isActive ? 'Scanning for real 0.01%+ profit opportunities...' : 'Start trading to scan for opportunities'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="border rounded-lg p-4 bg-gradient-to-r from-white to-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        opportunity.type === 'pump-snipe' ? 'destructive' :
                        opportunity.type === 'sandwich' ? 'default' :
                        opportunity.type === 'bonding-curve' ? 'secondary' :
                        'outline'
                      }>
                        {opportunity.type}
                      </Badge>
                      <span className="text-sm font-medium">{opportunity.token}</span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        LIVE
                      </Badge>
                    </div>
                    <Badge variant={opportunity.riskLevel === 'ultra-low' ? 'default' : 'secondary'}>
                      {opportunity.confidence.toFixed(0)}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Profit: </span>
                      <span className="font-semibold text-green-600">
                        ${opportunity.profitAmount.toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capital: </span>
                      <span className="font-semibold">${opportunity.requiredCapital.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI: </span>
                      <span className="font-semibold text-blue-600">
                        {opportunity.profitPercentage.toFixed(3)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Window: </span>
                      <span className="font-semibold">{opportunity.executionWindow}ms</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-muted-foreground">
                        Risk: {opportunity.riskLevel}
                      </div>
                      <Progress 
                        value={opportunity.confidence} 
                        className="w-20 h-2"
                      />
                      {walletBalance < opportunity.requiredCapital && (
                        <Badge variant="destructive" className="text-xs">
                          Insufficient Balance
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleExecuteOpportunity(opportunity)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={!isActive || walletBalance < opportunity.requiredCapital}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Execute Live
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

export default MicroMevDashboard;
