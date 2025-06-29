
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMicroMevBot } from '../../hooks/useMicroMevBot';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Activity,
  Play,
  Pause,
  RefreshCw,
  Gauge
} from 'lucide-react';

const MicroMevDashboard = () => {
  const [isActive, setIsActive] = useState(false);
  
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
  } = useMicroMevBot(isActive);

  const handleToggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      scanForOpportunities();
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Micro-MEV Detection Engine
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
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
              {isActive ? 'Stop Detection' : 'Start Detection'}
            </Button>
            
            <Button
              onClick={scanForOpportunities}
              variant="outline"
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              Manual Scan
            </Button>

            <Button
              onClick={executeTopOpportunities}
              variant="outline"
              disabled={opportunities.length === 0}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Execute Top 3
            </Button>
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
              {executionStats.totalExecutions} total executions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Total Profit</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ${totalProfit.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">
              Micro-MEV profits
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

      {/* Micro-MEV Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Detected Micro-MEV Opportunities
            <Badge variant="outline">{opportunities.length} Found</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div>No micro-MEV opportunities detected</div>
              <div className="text-sm">Scanning for 0.01%+ profit opportunities...</div>
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
                    </div>
                    <Button
                      onClick={() => executeOpportunity(opportunity)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={!isActive}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Execute
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
