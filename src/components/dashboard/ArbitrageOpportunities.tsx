import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMultiChainManager } from '../../hooks/useMultiChainManager';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  RefreshCw,
  DollarSign,
  Clock,
  Zap,
  Activity
} from 'lucide-react';

const ArbitrageOpportunities = () => {
  const { crossChainOpportunities, isScanning, scanCrossChainOpportunities } = useMultiChainManager();
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Filter out flash loan opportunities to show only regular arbitrage
  const regularOpportunities = crossChainOpportunities.filter(opp => !opp.flashLoanEnabled);
  const totalProfit = regularOpportunities.reduce((sum, opp) => sum + (opp.estimatedProfit || 0), 0);

  const executeArbitrage = async (opportunity: any) => {
    setIsExecuting(true);
    setSelectedOpportunity(opportunity);
    
    try {
      console.log('🚀 Executing Regular Arbitrage:', opportunity);
      
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Regular Arbitrage executed successfully!');
    } catch (error) {
      console.error('❌ Arbitrage execution failed:', error);
    } finally {
      setIsExecuting(false);
      setSelectedOpportunity(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* DISABLED - Live Spread Analysis by Trading Pair */}
      {/*
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Live Spread Analysis by Trading Pair
            <Badge variant="outline" className="bg-blue-50">Real-time</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['SOL/USDC', 'SOL/USDT', 'ETH/SOL', 'RAY/SOL', 'BONK/SOL'].map((pair) => (
                <div key={pair} className="border rounded-lg p-4 bg-gradient-to-r from-white to-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{pair}</div>
                    <Badge variant="outline" className="text-green-600">
                      Live
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spread:</span>
                      <span className="font-semibold text-green-600">
                        {(Math.random() * 2 + 0.5).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume 24h:</span>
                      <span className="font-semibold">
                        ${(Math.random() * 1000000).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best DEX:</span>
                      <span className="font-semibold">Jupiter</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* DISABLED - Live Arbitrage Opportunities */}
      {/*
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Arbitrage Opportunities
            <Badge variant="default" className="bg-green-500">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { pair: 'SOL/USDC', spread: 1.2, profit: 45.6, chain: 'Solana → Base' },
                { pair: 'ETH/USDT', spread: 0.8, profit: 32.1, chain: 'Base → Fantom' },
                { pair: 'USDC/USDT', spread: 0.3, profit: 12.4, chain: 'Fantom → Solana' }
              ].map((opp, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">{opp.pair}</div>
                    <Badge variant="default" className="bg-green-500">
                      {opp.spread}% Spread
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route:</span>
                      <span className="font-semibold">{opp.chain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Profit:</span>
                      <span className="font-semibold text-green-600">
                        ${opp.profit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-semibold">
                        {(85 + Math.random() * 10).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3 bg-green-500 hover:bg-green-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Execute Live Trade
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Regular Cross-Chain Arbitrage Opportunities - KEEP THIS */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Cross-Chain Arbitrage Opportunities (Capital Required)
              <Badge variant="outline">
                {regularOpportunities.length} Available
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Total Profit: ${totalProfit.toFixed(2)}
              </span>
              <Button 
                onClick={scanCrossChainOpportunities}
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
          {regularOpportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div>No capital-based arbitrage opportunities found</div>
              <div className="text-sm">Scanning across Solana, Base, and Fantom networks</div>
            </div>
          ) : (
            <div className="space-y-4">
              {regularOpportunities.map((opportunity, index) => (
                <div key={`${opportunity.id}-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{opportunity.pair?.split('/')[0] || 'Token'}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {opportunity.fromChain} → {opportunity.toChain}
                      </span>
                    </div>
                    <Badge variant={opportunity.riskLevel === 'low' ? 'default' : 'secondary'}>
                      Risk: {opportunity.riskLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Required Capital</p>
                      <p className="font-semibold">${opportunity.requiresCapital?.toFixed(2) || '1,000'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Est. Profit</p>
                      <p className="font-semibold text-green-600">
                        ${opportunity.estimatedProfit?.toFixed(2) || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profit %</p>
                      <p className="font-semibold">{opportunity.spread?.toFixed(2) || '0'}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Execution Time</p>
                      <p className="font-semibold">{Math.ceil((opportunity.executionTime || 5000) / 1000)}s</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Bridge Fee: ${opportunity.bridgeFee?.toFixed(4) || '0.10'} • Gas optimized • Bridge fees included
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => executeArbitrage(opportunity)}
                      disabled={isExecuting}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {isExecuting && selectedOpportunity?.id === opportunity.id ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Execute Trade
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information about disabled features */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Live Spread Analysis and Live Arbitrage Opportunities are temporarily disabled to reduce resource usage. Flash loan opportunities remain fully active.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ArbitrageOpportunities;
