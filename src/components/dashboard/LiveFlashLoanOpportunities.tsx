
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  CreditCard, 
  Target, 
  TrendingUp, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { useFlashLoanArbitrage } from '../../hooks/useFlashLoanArbitrage';
import { calculateOptimizedFees } from '../../utils/flashLoanOptimizer';

const LiveFlashLoanOpportunities = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);

  const {
    opportunities,
    isScanning,
    totalProfit,
    isStreamActive,
    lastUpdate,
    error,
    flashLoanMode,
    isConnected,
    toggleStream,
    refreshOpportunities,
    setFlashLoanMode
  } = useFlashLoanArbitrage();

  const executeFlashLoanArbitrage = async (opportunity: any) => {
    setIsExecuting(true);
    setSelectedOpportunity(opportunity.id);
    
    try {
      console.log('🚀 Executing Flash Loan Arbitrage:', opportunity);
      
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✅ Flash Loan Arbitrage executed successfully!');
    } catch (error) {
      console.error('❌ Flash Loan execution failed:', error);
    } finally {
      setIsExecuting(false);
      setSelectedOpportunity(null);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Flash Loan Cross-Chain (Zero Capital) - Advanced Optimization Engine
            {isConnected && isStreamActive && (
              <Badge variant="default" className="bg-green-500">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="flash-loan-mode" className="text-sm">Flash Loan Mode</Label>
              <Switch 
                id="flash-loan-mode"
                checked={flashLoanMode} 
                onCheckedChange={setFlashLoanMode}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="live-stream" className="text-sm">Live Stream</Label>
              <Switch 
                id="live-stream"
                checked={isStreamActive} 
                onCheckedChange={toggleStream}
              />
              {isStreamActive ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <Button 
              onClick={refreshOpportunities}
              variant="outline" 
              size="sm"
              disabled={isScanning}
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!flashLoanMode ? (
          <div className="text-center py-6 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>Flash loan mode disabled</div>
            <div className="text-sm">Enable flash loans to see zero-capital opportunities</div>
          </div>
        ) : !isStreamActive ? (
          <div className="text-center py-6 text-muted-foreground">
            <WifiOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>Live stream disabled</div>
            <div className="text-sm">Enable live stream to see real-time opportunities</div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>Error loading opportunities</div>
            <div className="text-sm">{error}</div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>{isScanning ? 'Scanning for opportunities...' : 'No flash loan opportunities available'}</div>
            <div className="text-sm">
              {isScanning ? 'AI engine analyzing cross-chain arbitrage...' : 'Refresh to check for new opportunities'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live Summary Stats */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{opportunities.length}</div>
                <div className="text-xs text-muted-foreground">Live Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${totalProfit.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Total Net Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {opportunities.reduce((sum, opp) => sum + (opp.optimizedFees?.savings || 0), 0).toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Fee Savings ($)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  <Clock className="w-5 h-5 inline mr-1" />
                  {lastUpdate ? formatTimeAgo(lastUpdate) : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Last Update</div>
              </div>
            </div>

            {/* Live Opportunities */}
            <div className="space-y-3">
              {opportunities.slice(0, 8).map((opportunity) => {
                const isCurrentlyExecuting = selectedOpportunity === opportunity.id && isExecuting;
                
                return (
                  <div key={opportunity.id} className="border rounded-lg p-4 bg-gradient-to-r from-white to-blue-50/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-lg">{opportunity.pair}</div>
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          <Zap className="w-3 h-3 mr-1" />
                          Flash Loan
                        </Badge>
                        <Badge variant="secondary" className="text-green-600 bg-green-100">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Live Data
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {opportunity.fromChain} → {opportunity.toChain}
                      </div>
                    </div>

                    {/* Enhanced Fee Breakdown */}
                    <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-3 mb-3 border border-green-200">
                      <div className="text-xs font-semibold mb-2 text-green-800 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Live Optimized Analysis (${opportunity.actualAmount?.toLocaleString()} capital)
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Flash Loan Fee:</span>
                            <span className="font-semibold text-blue-600">${opportunity.optimizedFees?.flashLoan?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trading Fees:</span>
                            <span className="font-semibold text-blue-600">${opportunity.optimizedFees?.trading?.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Bridge + Gas:</span>
                            <span className="font-semibold text-blue-600">${(opportunity.optimizedFees?.bridge + opportunity.optimizedFees?.gas)?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-1">
                            <span className="text-green-600">Net Profit:</span>
                            <span className="text-green-600">${opportunity.netOptimizedProfit?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Provider: </span>
                        <span className="font-semibold">{opportunity.flashLoanProvider}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Spread: </span>
                        <span className="font-semibold text-green-600">{opportunity.spread?.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence: </span>
                        <span className="font-semibold">{opportunity.confidence?.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Risk: {opportunity.riskLevel} • 
                        Time: ~{(opportunity.executionTime / 1000)?.toFixed(1)}s • 
                        Fee Savings: ${opportunity.optimizedFees?.savings?.toFixed(2)}
                      </div>
                      <Button 
                        onClick={() => executeFlashLoanArbitrage(opportunity)}
                        disabled={isExecuting || (opportunity.netOptimizedProfit || 0) <= 0}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 shadow-lg min-w-[120px]"
                      >
                        {isCurrentlyExecuting ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 mr-1" />
                            Execute Live
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {opportunities.length > 8 && (
              <div className="text-center text-sm text-muted-foreground py-2">
                Showing top 8 opportunities • {opportunities.length - 8} more available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveFlashLoanOpportunities;
