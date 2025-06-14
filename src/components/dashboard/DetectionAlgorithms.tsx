
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Settings, Cpu, BarChart3, Zap } from 'lucide-react';

interface Algorithm {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  performance: number;
  accuracy: number;
  latency: number;
  parameters: {
    [key: string]: {
      value: number;
      min: number;
      max: number;
      step: number;
      label: string;
    };
  };
}

const DetectionAlgorithms = () => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([
    {
      id: 'momentum',
      name: 'Momentum Detection',
      description: 'Detects opportunities based on price momentum across DEXs',
      enabled: true,
      performance: 87,
      accuracy: 92,
      latency: 2.1,
      parameters: {
        threshold: { value: 1.5, min: 0.5, max: 5.0, step: 0.1, label: 'Spread Threshold (%)' },
        window: { value: 30, min: 10, max: 120, step: 5, label: 'Time Window (s)' },
        confidence: { value: 80, min: 60, max: 95, step: 1, label: 'Min Confidence (%)' }
      }
    },
    {
      id: 'statistical',
      name: 'Statistical Arbitrage',
      description: 'Uses statistical models to predict mean reversion opportunities',
      enabled: true,
      performance: 91,
      accuracy: 89,
      latency: 3.5,
      parameters: {
        zscore: { value: 2.0, min: 1.0, max: 4.0, step: 0.1, label: 'Z-Score Threshold' },
        lookback: { value: 100, min: 50, max: 500, step: 10, label: 'Lookback Period' },
        volatility: { value: 0.02, min: 0.01, max: 0.1, step: 0.001, label: 'Volatility Filter' }
      }
    },
    {
      id: 'ml_prediction',
      name: 'ML Prediction Model',
      description: 'Machine learning model trained on historical arbitrage patterns',
      enabled: false,
      performance: 95,
      accuracy: 94,
      latency: 5.8,
      parameters: {
        modelVersion: { value: 2.1, min: 1.0, max: 3.0, step: 0.1, label: 'Model Version' },
        features: { value: 12, min: 8, max: 20, step: 1, label: 'Feature Count' },
        threshold: { value: 0.85, min: 0.7, max: 0.99, step: 0.01, label: 'Prediction Threshold' }
      }
    },
    {
      id: 'volume_analysis',
      name: 'Volume Flow Analysis',
      description: 'Analyzes volume patterns to identify liquidity imbalances',
      enabled: true,
      performance: 83,
      accuracy: 86,
      latency: 1.9,
      parameters: {
        volumeRatio: { value: 1.5, min: 1.1, max: 3.0, step: 0.1, label: 'Volume Ratio' },
        timeframe: { value: 60, min: 30, max: 300, step: 10, label: 'Analysis Timeframe (s)' },
        minVolume: { value: 50000, min: 10000, max: 500000, step: 5000, label: 'Min Volume ($)' }
      }
    }
  ]);

  const toggleAlgorithm = (id: string) => {
    setAlgorithms(prev => prev.map(algo => 
      algo.id === id ? { ...algo, enabled: !algo.enabled } : algo
    ));
  };

  const updateParameter = (algoId: string, paramKey: string, value: number[]) => {
    setAlgorithms(prev => prev.map(algo => 
      algo.id === algoId 
        ? {
            ...algo,
            parameters: {
              ...algo.parameters,
              [paramKey]: { ...algo.parameters[paramKey], value: value[0] }
            }
          }
        : algo
    ));
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-500';
    if (performance >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Algorithm Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Algorithms</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {algorithms.filter(a => a.enabled).length}/{algorithms.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(algorithms.filter(a => a.enabled).reduce((sum, a) => sum + a.performance, 0) / 
                Math.max(algorithms.filter(a => a.enabled).length, 1)).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(algorithms.filter(a => a.enabled).reduce((sum, a) => sum + a.accuracy, 0) / 
                Math.max(algorithms.filter(a => a.enabled).length, 1)).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(algorithms.filter(a => a.enabled).reduce((sum, a) => sum + a.latency, 0) / 
                Math.max(algorithms.filter(a => a.enabled).length, 1)).toFixed(1)}ms
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Algorithm Configuration */}
      <div className="space-y-4">
        {algorithms.map((algorithm) => (
          <Card key={algorithm.id} className={`${algorithm.enabled ? 'border-green-200' : 'border-gray-200'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={algorithm.enabled}
                    onCheckedChange={() => toggleAlgorithm(algorithm.id)}
                  />
                  <div>
                    <CardTitle className="text-lg">{algorithm.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {algorithm.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getPerformanceColor(algorithm.performance)}>
                    {algorithm.performance}% Performance
                  </Badge>
                  <Badge variant="outline">
                    {algorithm.latency}ms
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            {algorithm.enabled && (
              <CardContent className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Performance</div>
                    <Progress value={algorithm.performance} className="mb-1" />
                    <div className="text-xs text-muted-foreground">{algorithm.performance}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Accuracy</div>
                    <Progress value={algorithm.accuracy} className="mb-1" />
                    <div className="text-xs text-muted-foreground">{algorithm.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Latency Target</div>
                    <Progress value={Math.max(0, 100 - algorithm.latency * 10)} className="mb-1" />
                    <div className="text-xs text-muted-foreground">{algorithm.latency}ms</div>
                  </div>
                </div>

                {/* Parameter Controls */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Algorithm Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(algorithm.parameters).map(([key, param]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">{param.label}</label>
                          <span className="text-sm text-muted-foreground">
                            {param.value.toFixed(param.step < 1 ? 2 : 0)}
                          </span>
                        </div>
                        <Slider
                          value={[param.value]}
                          onValueChange={(value) => updateParameter(algorithm.id, key, value)}
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{param.min}</span>
                          <span>{param.max}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Test Algorithm
                  </Button>
                  <Button size="sm" variant="outline">
                    View Logs
                  </Button>
                  <Button size="sm" variant="outline">
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DetectionAlgorithms;
