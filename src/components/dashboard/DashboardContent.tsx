
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Clock,
  AlertTriangle,
  Wallet,
  Lock
} from 'lucide-react';
import { PhantomWalletService } from '../../services/phantomWalletService';
import { LiveTradingEngine, TradingStats } from '../../services/liveTradingEngine';

const DashboardContent = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [tradingStats, setTradingStats] = useState<TradingStats>({
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
    totalPnL: 0,
    totalFees: 0,
    winRate: 0,
    averageProfit: 0,
    maxDrawdown: 0,
    currentBalance: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkWalletConnection();
    const interval = setInterval(updateTradingStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkWalletConnection = async () => {
    try {
      await PhantomWalletService.initialize();
      const connected = PhantomWalletService.isWalletConnected();
      setIsWalletConnected(connected);
      
      if (connected) {
        await updateTradingStats();
      }
    } catch (error) {
      console.error('Wallet check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTradingStats = async () => {
    if (!PhantomWalletService.isWalletConnected()) return;
    
    try {
      if (LiveTradingEngine.isEngineActive()) {
        const stats = LiveTradingEngine.getTradingStats();
        setTradingStats(stats);
      }
    } catch (error) {
      console.error('Failed to update trading stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isWalletConnected) {
    return (
      <div className="space-y-6">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <strong>Wallet Connection Required:</strong> Connect your Phantom wallet to access live trading features and view real-time statistics.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Connect Wallet to Access Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                To access live trading features, you need to:
              </div>
              <ul className="text-sm text-left max-w-md mx-auto space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Connect your Phantom wallet
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Maintain minimum balance of $10
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Enable live trading mode
                </li>
              </ul>
              <Button 
                onClick={() => window.location.href = '/wallet'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Go to Wallet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Preview Cards (Locked) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Total P&L", value: "***", icon: TrendingUp, color: "text-gray-400" },
            { title: "Active Positions", value: "***", icon: Activity, color: "text-gray-400" },
            { title: "Win Rate", value: "***", icon: DollarSign, color: "text-gray-400" },
            { title: "Trading Time", value: "***", icon: Clock, color: "text-gray-400" }
          ].map((stat, index) => (
            <Card key={index} className="relative">
              <div className="absolute inset-0 bg-gray-100 opacity-50 rounded-lg flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-gray-400">Wallet required</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Trading Status */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          <strong>Live Trading Active:</strong> All data and transactions are real. Current balance: ${tradingStats.currentBalance.toFixed(2)}
        </AlertDescription>
      </Alert>

      {/* Real Trading Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${tradingStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${tradingStats.totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {tradingStats.totalTrades} total trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tradingStats.winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {tradingStats.successfulTrades}/{tradingStats.totalTrades} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${tradingStats.averageProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per successful trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${tradingStats.maxDrawdown > 10 ? 'text-red-600' : 'text-orange-600'}`}>
              {tradingStats.maxDrawdown.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Risk management
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Live Trading Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Fees Paid:</span>
              <span className="font-semibold">${tradingStats.totalFees.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Net Profit:</span>
              <span className={`font-semibold ${tradingStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(tradingStats.totalPnL - tradingStats.totalFees).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Failed Trades:</span>
              <span className="font-semibold text-red-600">{tradingStats.failedTrades}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Trading Engine Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Trading Engine Status
            <Badge variant="default" className="bg-green-500">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Wallet Connected:</span>
              <Badge variant="default" className="bg-green-500">Yes</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Trading Engine:</span>
              <Badge variant={LiveTradingEngine.isEngineActive() ? "default" : "secondary"}>
                {LiveTradingEngine.isEngineActive() ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Current Balance:</span>
              <span className="font-semibold">${tradingStats.currentBalance.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;
