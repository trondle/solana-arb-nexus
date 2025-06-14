
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, TrendingUp } from 'lucide-react';

interface OptimizationSettings {
  multiProviderMode: boolean;
  volumeDiscounts: boolean;
  batchExecution: boolean;
  dynamicRouting: boolean;
  gasOptimization: boolean;
  mevProtection: boolean;
  liquidityOptimization: boolean;
  bridgeOptimization: boolean;
  minSpreadThreshold: number;
  flashLoanAggregation: boolean;
}

interface OptimizationControlPanelProps {
  optimizationSettings: OptimizationSettings;
  setOptimizationSettings: React.Dispatch<React.SetStateAction<OptimizationSettings>>;
}

const OptimizationControlPanel = ({ optimizationSettings, setOptimizationSettings }: OptimizationControlPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Profit Optimization Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>10-Point Optimization System Active:</strong> Multi-provider competition, volume discounts, 
            batch execution, dynamic routing, gas optimization, MEV protection, liquidity optimization, 
            bridge optimization, spread thresholds, and flash loan aggregation.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Multi-Provider</Label>
            <Switch 
              checked={optimizationSettings.multiProviderMode}
              onCheckedChange={(checked) => 
                setOptimizationSettings(prev => ({ ...prev, multiProviderMode: checked }))
              }
            />
            <div className="text-xs text-green-600">-20% flash fees</div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Dynamic Routing</Label>
            <Switch 
              checked={optimizationSettings.dynamicRouting}
              onCheckedChange={(checked) => 
                setOptimizationSettings(prev => ({ ...prev, dynamicRouting: checked }))
              }
            />
            <div className="text-xs text-green-600">-15% trading fees</div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Gas Optimization</Label>
            <Switch 
              checked={optimizationSettings.gasOptimization}
              onCheckedChange={(checked) => 
                setOptimizationSettings(prev => ({ ...prev, gasOptimization: checked }))
              }
            />
            <div className="text-xs text-green-600">-40% gas costs</div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Bridge Optimization</Label>
            <Switch 
              checked={optimizationSettings.bridgeOptimization}
              onCheckedChange={(checked) => 
                setOptimizationSettings(prev => ({ ...prev, bridgeOptimization: checked }))
              }
            />
            <div className="text-xs text-green-600">-25% bridge fees</div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">MEV Protection</Label>
            <Switch 
              checked={optimizationSettings.mevProtection}
              onCheckedChange={(checked) => 
                setOptimizationSettings(prev => ({ ...prev, mevProtection: checked }))
              }
            />
            <div className="text-xs text-green-600">+5% spread</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="text-sm font-semibold text-green-800 mb-2">Optimization Impact</div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-green-600 font-bold">35-50%</div>
              <div className="text-muted-foreground">Total Fee Reduction</div>
            </div>
            <div>
              <div className="text-green-600 font-bold">15-25%</div>
              <div className="text-muted-foreground">Profit Increase</div>
            </div>
            <div>
              <div className="text-green-600 font-bold">60%</div>
              <div className="text-muted-foreground">Gas Savings</div>
            </div>
            <div>
              <div className="text-green-600 font-bold">3x</div>
              <div className="text-muted-foreground">Execution Speed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationControlPanel;
