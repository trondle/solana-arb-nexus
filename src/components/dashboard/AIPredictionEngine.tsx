
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Brain, TrendingUp, Target, AlertTriangle, Sparkles } from 'lucide-react';

interface Prediction {
  id: string;
  pair: string;
  direction: 'up' | 'down';
  confidence: number;
  expectedReturn: number;
  timeframe: string;
  accuracy: number;
  signal: 'strong' | 'moderate' | 'weak';
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

const AIPredictionEngine = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>({
    accuracy: 89.3,
    precision: 91.2,
    recall: 87.5,
    f1Score: 89.3
  });
  
  const [predictionHistory, setPredictionHistory] = useState([
    { time: '09:00', accuracy: 85, volume: 120 },
    { time: '10:00', accuracy: 87, volume: 140 },
    { time: '11:00', accuracy: 91, volume: 180 },
    { time: '12:00', accuracy: 89, volume: 160 },
    { time: '13:00', accuracy: 93, volume: 200 },
    { time: '14:00', accuracy: 88, volume: 170 },
  ]);

  useEffect(() => {
    const generatePredictions = () => {
      const pairs = ['SOL/USDC', 'SOL/USDT', 'ETH/SOL', 'RAY/SOL', 'BONK/SOL'];
      const newPredictions: Prediction[] = [];

      for (let i = 0; i < 5; i++) {
        const confidence = 70 + Math.random() * 25;
        const direction = Math.random() > 0.5 ? 'up' : 'down';
        const expectedReturn = Math.random() * 5 + 1;
        
        let signal: 'strong' | 'moderate' | 'weak' = 'weak';
        if (confidence > 90) signal = 'strong';
        else if (confidence > 80) signal = 'moderate';

        newPredictions.push({
          id: `pred-${i}`,
          pair: pairs[i],
          direction,
          confidence,
          expectedReturn,
          timeframe: `${5 + Math.floor(Math.random() * 25)}min`,
          accuracy: 85 + Math.random() * 10,
          signal
        });
      }

      setPredictions(newPredictions.sort((a, b) => b.confidence - a.confidence));
    };

    generatePredictions();
    const interval = setInterval(generatePredictions, 10000);
    return () => clearInterval(interval);
  }, []);

  const chartConfig = {
    accuracy: {
      label: "Accuracy %",
      color: "hsl(var(--chart-1))",
    },
    volume: {
      label: "Prediction Volume",
      color: "hsl(var(--chart-2))",
    },
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'strong': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'up' ? '↗️' : '↘️';
  };

  return (
    <div className="space-y-6">
      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {modelMetrics.accuracy.toFixed(1)}%
            </div>
            <Progress value={modelMetrics.accuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precision</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelMetrics.precision.toFixed(1)}%
            </div>
            <Progress value={modelMetrics.precision} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recall</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelMetrics.recall.toFixed(1)}%
            </div>
            <Progress value={modelMetrics.recall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">F1 Score</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelMetrics.f1Score.toFixed(1)}%
            </div>
            <Progress value={modelMetrics.f1Score} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Prediction Accuracy Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Real-time Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionHistory}>
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="var(--color-accuracy)" 
                  fill="var(--color-accuracy)" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Active Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Active AI Predictions
            </div>
            <Badge variant="outline">
              {predictions.filter(p => p.signal === 'strong').length} High Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSignalColor(prediction.signal)}`}></div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {prediction.pair}
                        <span className="text-lg">{getDirectionIcon(prediction.direction)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Signal: {prediction.signal.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={prediction.confidence > 85 ? 'default' : 'secondary'}>
                    {prediction.confidence.toFixed(0)}% Confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Expected Return</div>
                    <div className="font-semibold text-green-500">
                      +{prediction.expectedReturn.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Timeframe</div>
                    <div className="font-semibold">
                      {prediction.timeframe}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Historical Accuracy</div>
                    <div className="font-semibold">
                      {prediction.accuracy.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Direction</div>
                    <div className={`font-semibold ${prediction.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {prediction.direction.toUpperCase()}
                    </div>
                  </div>
                </div>

                {prediction.signal === 'strong' && (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      High confidence prediction - Consider increasing position size
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Execute Trade
                  </Button>
                  <Button size="sm" variant="ghost">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPredictionEngine;
