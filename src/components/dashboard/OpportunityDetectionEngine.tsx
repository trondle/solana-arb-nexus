
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, AlertTriangle, TrendingUp, Zap, Clock, DollarSign } from 'lucide-react';

interface DetectionMetrics {
  totalScanned: number;
  opportunitiesFound: number;
  averageSpread: number;
  detectionAccuracy: number;
  averageLatency: number;
  successRate: number;
}

interface OpportunitySignal {
  id: string;
  pair: string;
  signal: 'strong' | 'moderate' | 'weak';
  confidence: number;
  predictedProfit: number;
  timeWindow: number;
  riskFactors: string[];
  detectionTime: string;
}

interface SpreadHistory {
  timestamp: string;
  spread: number;
  threshold: number;
  detected: boolean;
}

const OpportunityDetectionEngine = () => {
  const [metrics, setMetrics] = useState<DetectionMetrics>({
    totalScanned: 0,
    opportunitiesFound: 0,
    averageSpread: 0,
    detectionAccuracy: 0,
    averageLatency: 0,
    successRate: 0
  });

  const [signals, setSignals] = useState<OpportunitySignal[]>([]);
  const [spreadHistory, setSpreadHistory] = useState<SpreadHistory[]>([]);
  const [detectionThreshold, setDetectionThreshold] = useState(1.5);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const generateSignals = (): OpportunitySignal[] => {
      const pairs = ['SOL/USDC', 'SOL/USDT', 'ETH/SOL', 'RAY/SOL', 'BONK/SOL'];
      const signals: OpportunitySignal[] = [];

      for (let i = 0; i < 6; i++) {
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const confidence = 60 + Math.random() * 35;
        const spread = 0.8 + Math.random() * 2.5;
        
        let signal: 'strong' | 'moderate' | 'weak' = 'weak';
        if (confidence > 85 && spread > 2.0) signal = 'strong';
        else if (confidence > 75 && spread > 1.5) signal = 'moderate';

        const riskFactors = [];
        if (Math.random() > 0.7) riskFactors.push('High volatility detected');
        if (Math.random() > 0.8) riskFactors.push('Low liquidity pool');
        if (Math.random() > 0.9) riskFactors.push('Recent failed transactions');

        signals.push({
          id: `signal-${i}`,
          pair,
          signal,
          confidence,
          predictedProfit: spread * 50 + Math.random() * 100,
          timeWindow: 30 + Math.random() * 120,
          riskFactors,
          detectionTime: new Date().toLocaleTimeString()
        });
      }

      return signals.sort((a, b) => b.confidence - a.confidence);
    };

    const generateSpreadHistory = () => {
      const now = Date.now();
      const history: SpreadHistory[] = [];
      
      for (let i = 29; i >= 0; i--) {
        const timestamp = new Date(now - i * 2000);
        const spread = 0.5 + Math.sin(i * 0.2) * 0.8 + Math.random() * 0.5;
        history.push({
          timestamp: timestamp.toLocaleTimeString(),
          spread,
          threshold: detectionThreshold,
          detected: spread > detectionThreshold
        });
      }
      return history;
    };

    const updateMetrics = () => {
      const scanned = 1000 + Math.floor(Math.random() * 500);
      const found = Math.floor(scanned * (0.02 + Math.random() * 0.03));
      
      setMetrics({
        totalScanned: scanned,
        opportunitiesFound: found,
        averageSpread: 1.2 + Math.random() * 0.8,
        detectionAccuracy: 85 + Math.random() * 12,
        averageLatency: 2 + Math.random() * 3,
        successRate: 78 + Math.random() * 15
      });
    };

    setSignals(generateSignals());
    setSpreadHistory(generateSpreadHistory());
    updateMetrics();

    const interval = setInterval(() => {
      if (isScanning) {
        setSignals(generateSignals());
        setSpreadHistory(prev => {
          const newHistory = [...prev.slice(1)];
          const spread = 0.5 + Math.sin(Date.now() * 0.0002) * 0.8 + Math.random() * 0.5;
          newHistory.push({
            timestamp: new Date().toLocaleTimeString(),
            spread,
            threshold: detectionThreshold,
            detected: spread > detectionThreshold
          });
          return newHistory;
        });
        updateMetrics();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isScanning, detectionThreshold]);

  const chartConfig = {
    spread: {
      label: "Spread %",
      color: "hsl(var(--chart-1))",
    },
    threshold: {
      label: "Detection Threshold",
      color: "hsl(var(--chart-2))",
    },
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'strong':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-500';
    if (confidence >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Detection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Status</CardTitle>
            <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isScanning ? 'Active' : 'Paused'}
            </div>
            <p className="text-xs text-muted-foreground">
              Scanning {metrics.totalScanned} pairs/min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.detectionAccuracy.toFixed(1)}%</div>
            <Progress value={metrics.detectionAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageLatency.toFixed(1)}ms</div>
            <p className="text-xs text-muted-foreground">
              Target: &lt;5ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spread Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Real-time Spread Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spreadHistory}>
                <XAxis dataKey="timestamp" />
                <YAxis label={{ value: 'Spread %', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="spread" 
                  stroke="var(--color-spread)" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <ReferenceLine 
                  y={detectionThreshold} 
                  stroke="var(--color-threshold)" 
                  strokeDasharray="5 5" 
                  label="Detection Threshold"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Detection Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Active Detection Signals
            </div>
            <Badge variant="outline">
              {signals.filter(s => s.signal === 'strong').length} Strong Signals
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signals.map((signal) => (
              <div key={signal.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSignalColor(signal.signal)}`}></div>
                    <div>
                      <div className="font-semibold">{signal.pair}</div>
                      <div className="text-sm text-muted-foreground">
                        Signal: {signal.signal.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={signal.signal === 'strong' ? 'default' : 'secondary'}>
                    {signal.confidence.toFixed(0)}% Confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Predicted Profit</div>
                    <div className="font-semibold flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {signal.predictedProfit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Time Window</div>
                    <div className="font-semibold">
                      {signal.timeWindow.toFixed(0)}s
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Risk Factors</div>
                    <div className="font-semibold">
                      {signal.riskFactors.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Detected</div>
                    <div className="font-semibold text-xs">
                      {signal.detectionTime}
                    </div>
                  </div>
                </div>

                {signal.riskFactors.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Risk factors: {signal.riskFactors.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityDetectionEngine;
