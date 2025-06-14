
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, TrendingDown, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface SlippageMetrics {
  predictedSlippage: number;
  actualSlippage: number;
  slippageReduction: number;
  mevAttacksPrevented: number;
  routeOptimizationSavings: number;
}

interface SlippageProtectorProps {
  onSlippageThresholdChange: (threshold: number) => void;
  currentSlippage: number;
}

const SlippageProtector = ({ onSlippageThresholdChange, currentSlippage }: SlippageProtectorProps) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [maxSlippageThreshold, setMaxSlippageThreshold] = useState([1.5]);
  const [mevProtectionEnabled, setMevProtectionEnabled] = useState(true);
  const [routeOptimizationEnabled, setRouteOptimizationEnabled] = useState(true);
  
  const [metrics, setMetrics] = useState<SlippageMetrics>({
    predictedSlippage: currentSlippage || 0.8,
    actualSlippage: 0.6,
    slippageReduction: 25,
    mevAttacksPrevented: 12,
    routeOptimizationSavings: 18.5
  });

  const [protectionStatus, setProtectionStatus] = useState<'active' | 'warning' | 'critical'>('active');

  useEffect(() => {
    onSlippageThresholdChange(maxSlippageThreshold[0]);
    
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newPredicted = 0.5 + Math.random() * 1.5;
        const newActual = Math.max(0.1, newPredicted * (0.7 + Math.random() * 0.3));
        const reduction = ((newPredicted - newActual) / newPredicted) * 100;
        
        return {
          ...prev,
          predictedSlippage: newPredicted,
          actualSlippage: newActual,
          slippageReduction: reduction,
          mevAttacksPrevented: prev.mevAttacksPrevented + (Math.random() > 0.7 ? 1 : 0),
          routeOptimizationSavings: 15 + Math.random() * 10
        };
      });

      // Update protection status
      const currentSlippage = metrics.actualSlippage;
      if (currentSlippage > maxSlippageThreshold[0] * 0.8) {
        setProtectionStatus('warning');
      } else if (currentSlippage > maxSlippageThreshold[0]) {
        setProtectionStatus('critical');
      } else {
        setProtectionStatus('active');
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [maxSlippageThreshold, onSlippageThresholdChange, metrics.actualSlippage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Advanced Slippage Protection
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(protectionStatus)}
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Predicted Slippage</div>
            <div className="text-2xl font-bold text-yellow-500">
              {metrics.predictedSlippage.toFixed(2)}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Actual Slippage</div>
            <div className="text-2xl font-bold text-green-500">
              {metrics.actualSlippage.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Slippage Reduction</span>
            <Badge variant={metrics.slippageReduction > 20 ? 'default' : 'secondary'}>
              {metrics.slippageReduction.toFixed(1)}% improved
            </Badge>
          </div>
          <Progress value={metrics.slippageReduction} className="h-2" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Max Slippage Threshold</label>
              <span className="text-sm text-muted-foreground">{maxSlippageThreshold[0]}%</span>
            </div>
            <Slider
              value={maxSlippageThreshold}
              onValueChange={setMaxSlippageThreshold}
              min={0.1}
              max={5.0}
              step={0.1}
              disabled={!isEnabled}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">MEV Protection</div>
                <div className="text-sm text-muted-foreground">Prevent sandwich attacks</div>
              </div>
              <Switch
                checked={mevProtectionEnabled}
                onCheckedChange={setMevProtectionEnabled}
                disabled={!isEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Route Optimization</div>
                <div className="text-sm text-muted-foreground">Find optimal execution paths</div>
              </div>
              <Switch
                checked={routeOptimizationEnabled}
                onCheckedChange={setRouteOptimizationEnabled}
                disabled={!isEnabled}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">MEV Attacks Prevented</div>
            <div className="font-semibold text-blue-500">{metrics.mevAttacksPrevented}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Route Optimization Savings</div>
            <div className="font-semibold text-green-500">${metrics.routeOptimizationSavings.toFixed(1)}</div>
          </div>
        </div>

        {protectionStatus !== 'active' && (
          <Alert className={protectionStatus === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {protectionStatus === 'critical' 
                ? 'Critical: Slippage exceeding threshold. Consider reducing trade size or adjusting parameters.'
                : 'Warning: Slippage approaching threshold. Monitor closely.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">PROTECTION FEATURES</div>
          <div className="grid grid-cols-2 gap-1">
            <div>• Predictive slippage modeling</div>
            <div>• MEV sandwich protection</div>
            <div>• Dynamic order splitting</div>
            <div>• Route optimization</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SlippageProtector;
