
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Fuel, TrendingDown, Clock, Zap } from 'lucide-react';

interface GasData {
  current: number;
  optimal: number;
  priority: number;
  savings: number;
}

const GasOptimizer = () => {
  const [gasData, setGasData] = useState<GasData>({
    current: 45,
    optimal: 32,
    priority: 55,
    savings: 28.9
  });
  
  const [gasStrategy, setGasStrategy] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [dynamicPricing, setDynamicPricing] = useState(true);
  const [maxGasPrice, setMaxGasPrice] = useState([100]);
  const [gasLimit, setGasLimit] = useState([250000]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGasData(prev => ({
        current: 35 + Math.random() * 20,
        optimal: 25 + Math.random() * 15,
        priority: 45 + Math.random() * 25,
        savings: 20 + Math.random() * 20
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getGasColor = (price: number) => {
    if (price < 40) return 'text-green-500';
    if (price < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Gas Price Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Gas</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGasColor(gasData.current)}`}>
              {gasData.current.toFixed(1)} gwei
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimal Gas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {gasData.optimal.toFixed(1)} gwei
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority Fee</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGasColor(gasData.priority)}`}>
              {gasData.priority.toFixed(1)} gwei
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {gasData.savings.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gas Strategy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Gas Strategy Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dynamic Gas Pricing</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically adjust gas prices based on network conditions
                </p>
              </div>
              <Switch 
                checked={dynamicPricing}
                onCheckedChange={setDynamicPricing}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Gas Strategy</span>
                <Badge variant={gasStrategy === 'aggressive' ? 'destructive' : gasStrategy === 'balanced' ? 'default' : 'secondary'}>
                  {gasStrategy.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={gasStrategy === 'conservative' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setGasStrategy('conservative')}
                >
                  Conservative
                </Button>
                <Button 
                  variant={gasStrategy === 'balanced' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setGasStrategy('balanced')}
                >
                  Balanced
                </Button>
                <Button 
                  variant={gasStrategy === 'aggressive' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setGasStrategy('aggressive')}
                >
                  Aggressive
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Max Gas Price</span>
                <span className="text-sm text-muted-foreground">{maxGasPrice[0]} gwei</span>
              </div>
              <Slider
                value={maxGasPrice}
                onValueChange={setMaxGasPrice}
                max={200}
                min={20}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Gas Limit</span>
                <span className="text-sm text-muted-foreground">{gasLimit[0].toLocaleString()}</span>
              </div>
              <Slider
                value={gasLimit}
                onValueChange={setGasLimit}
                max={500000}
                min={100000}
                step={10000}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gas Price History */}
      <Card>
        <CardHeader>
          <CardTitle>Gas Optimization Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Saved (24h)</div>
                <div className="text-2xl font-bold text-green-500">$342.18</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Transactions Optimized</div>
                <div className="text-2xl font-bold">127</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Optimization Efficiency</div>
              <Progress value={87} className="h-2" />
              <div className="text-xs text-muted-foreground">87% of transactions optimized</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GasOptimizer;
