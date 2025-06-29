
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUltraLowCapital } from '../../hooks/useUltraLowCapital';
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Target, 
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Layers
} from 'lucide-react';

const UltraLowCapitalDashboard = () => {
  const [isActive, setIsActive] = useState(false);
  const [initialCapital] = useState(20); // $20 starting capital
  
  const {
    opportunities,
    currentCapital,
    totalProfit,
    activePositions,
    isScanning,
    emergencyMode,
    stats,
    tradeHistory,
    capitalEfficiency,
    dailyROI,
    scanMicroOpportunities,
    executeMicroTrade,
    executeBundledTrades
  } = useUltraLowCapital(initialCapital);

  const handleToggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      scanMicroOpportunities();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Ultra-Low Capital MEV Bot ($20 Minimum)
            {emergencyMode && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Emergency Mode
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleToggleActive}
              variant={isActive ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isActive ? 'Stop Bot' : 'Start Bot'}
            </Button>
            
            <Button
              onClick={scanMicroOpportunities}
              variant="outline"
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              Scan Opportunities
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Active Positions: {activePositions}</span>
              <span>•</span>
              <span>Success Rate: {stats.successRate.toFixed(1)}%</span>
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
              ${currentCapital.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Started with ${initialCapital}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total Profit</span>
            </div>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalProfit.toFixed(2)}
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
            Micro-MEV Opportunities
            <Badge variant="outline">{opportunities.length} Available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div>No micro-opportunities found</div>
              <div className="text-sm">Scanning for $0.10+ profit opportunities...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Bundle Execution */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold">Bundle Execution Available</div>
                  <div className="text-sm text-muted-foreground">
                    Execute {Math.min(3, opportunities.length)} trades simultaneously
                  </div>
                </div>
                <Button
                  onClick={() => executeBundledTrades(opportunities.slice(0, 3))}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Execute Bundle
                </Button>
              </div>

              {opportunities.slice(0, 10).map((opportunity) => (
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
                      <span className="font-semibold">${opportunity.requiredCapital}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Profit %: </span>
                      <span className="font-semibold text-green-600">
                        {opportunity.profitPercentage.toFixed(3)}%
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
                      onClick={() => executeMicroTrade(opportunity)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      disabled={!isActive || emergencyMode}
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
                    <Badge variant={trade.success ? "default" : "destructive"}>
                      {trade.success ? "SUCCESS" : "FAILED"}
                    </Badge>
                    <span className="text-sm">{trade.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${trade.profit.toFixed(4)}
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
