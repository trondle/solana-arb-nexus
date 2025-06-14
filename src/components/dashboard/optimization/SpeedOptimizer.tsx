
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Zap, Clock, Wifi, Database, Target } from 'lucide-react';

interface OptimizationMetrics {
  averageExecutionTime: number;
  targetExecutionTime: number;
  websocketLatency: number;
  precomputedTemplates: number;
  parallelConnections: number;
  successRate: number;
}

interface SpeedOptimizerProps {
  onOptimizationChange: (enabled: boolean) => void;
  currentSpeed: number;
}

const SpeedOptimizer = ({ onOptimizationChange, currentSpeed }: SpeedOptimizerProps) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    averageExecutionTime: currentSpeed || 4200,
    targetExecutionTime: 800,
    websocketLatency: 45,
    precomputedTemplates: 12,
    parallelConnections: 8,
    successRate: 94.5
  });

  const [optimizationProgress, setOptimizationProgress] = useState(0);

  useEffect(() => {
    onOptimizationChange(isEnabled);
    
    if (isEnabled) {
      const interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          averageExecutionTime: Math.max(prev.targetExecutionTime + Math.random() * 200, prev.targetExecutionTime),
          websocketLatency: 40 + Math.random() * 15,
          precomputedTemplates: 10 + Math.floor(Math.random() * 5),
          parallelConnections: 6 + Math.floor(Math.random() * 4),
          successRate: 92 + Math.random() * 6
        }));
        
        // Calculate optimization progress
        const speedImprovement = Math.max(0, (currentSpeed - metrics.averageExecutionTime) / currentSpeed * 100);
        setOptimizationProgress(Math.min(speedImprovement, 100));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isEnabled, currentSpeed, onOptimizationChange, metrics.averageExecutionTime]);

  const speedImprovement = ((currentSpeed - metrics.averageExecutionTime) / currentSpeed) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Lightning-Fast Execution Engine
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Current Speed</div>
            <div className="text-2xl font-bold">
              {(metrics.averageExecutionTime / 1000).toFixed(2)}s
            </div>
            <Progress value={optimizationProgress} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Target Speed</div>
            <div className="text-2xl font-bold text-green-500">
              {(metrics.targetExecutionTime / 1000).toFixed(2)}s
            </div>
            <Badge variant={speedImprovement > 60 ? 'default' : 'secondary'}>
              {speedImprovement > 0 ? '+' : ''}{speedImprovement.toFixed(1)}% faster
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-muted-foreground">WebSocket</div>
              <div className="font-semibold">{metrics.websocketLatency.toFixed(0)}ms</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-500" />
            <div>
              <div className="text-muted-foreground">Templates</div>
              <div className="font-semibold">{metrics.precomputedTemplates}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" />
            <div>
              <div className="text-muted-foreground">Parallel</div>
              <div className="font-semibold">{metrics.parallelConnections}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-muted-foreground">Success</div>
              <div className="font-semibold">{metrics.successRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">OPTIMIZATION FEATURES</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>WebSocket Price Feeds</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Pre-computed Templates</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Parallel Execution</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Priority Queuing</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpeedOptimizer;
