
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Zap, Shield, TrendingUp, Activity } from 'lucide-react';
import { useFreeLivePrices } from '../../hooks/useFreeLivePrices';

const ConfigurationPanel = () => {
  const [minProfitThreshold, setMinProfitThreshold] = useState([5]);
  const [maxRiskLevel, setMaxRiskLevel] = useState('medium');
  const [autoExecution, setAutoExecution] = useState(false);
  const [maxCapitalPerTrade, setMaxCapitalPerTrade] = useState('10000');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [slippageTolerance, setSlippageTolerance] = useState([0.5]);

  const { isConnected, error } = useFreeLivePrices();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Live Trading Configuration
          {isConnected && (
            <Badge variant="default" className="bg-green-500">
              <Activity className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Data Status */}
        <Alert className={isConnected ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <Activity className={`h-4 w-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
          <AlertDescription className={isConnected ? 'text-green-800' : 'text-red-800'}>
            {isConnected ? (
              <>
                <strong>Live Data Connected</strong><br />
                Real-time price feeds and arbitrage detection active
              </>
            ) : (
              <>
                <strong>Live Data Disconnected</strong><br />
                {error || 'Enable flash loan mode to connect to live data feeds'}
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Profit Threshold */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Minimum Profit Threshold
          </Label>
          <div className="px-2">
            <Slider
              value={minProfitThreshold}
              onValueChange={setMinProfitThreshold}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>$1</span>
            <span className="font-semibold">${minProfitThreshold[0]}</span>
            <span>$50</span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Maximum Risk Level
          </Label>
          <Select value={maxRiskLevel} onValueChange={setMaxRiskLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Risk (80%+ confidence)</SelectItem>
              <SelectItem value="medium">Medium Risk (60%+ confidence)</SelectItem>
              <SelectItem value="high">High Risk (40%+ confidence)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Slippage Tolerance */}
        <div className="space-y-2">
          <Label>Slippage Tolerance</Label>
          <div className="px-2">
            <Slider
              value={slippageTolerance}
              onValueChange={setSlippageTolerance}
              max={5}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0.1%</span>
            <span className="font-semibold">{slippageTolerance[0]}%</span>
            <span>5%</span>
          </div>
        </div>

        {/* Capital Limits */}
        <div className="space-y-2">
          <Label>Maximum Capital Per Trade</Label>
          <Input
            type="number"
            value={maxCapitalPerTrade}
            onChange={(e) => setMaxCapitalPerTrade(e.target.value)}
            placeholder="10000"
          />
          <div className="text-sm text-muted-foreground">
            Maximum amount to allocate for flash loan arbitrage
          </div>
        </div>

        {/* Auto Execution */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label htmlFor="auto-execution" className="font-semibold">
              Auto Execution (Live Data)
            </Label>
            <div className="text-sm text-muted-foreground">
              Automatically execute profitable opportunities
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              id="auto-execution"
              checked={autoExecution}
              onCheckedChange={setAutoExecution}
              disabled={!isConnected}
            />
            <Badge variant={autoExecution ? 'default' : 'secondary'}>
              {autoExecution ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label htmlFor="notifications">Live Opportunity Alerts</Label>
            <div className="text-sm text-muted-foreground">
              Get notified of profitable live opportunities
            </div>
          </div>
          <Switch 
            id="notifications"
            checked={enableNotifications}
            onCheckedChange={setEnableNotifications}
          />
        </div>

        {/* Live Configuration Actions */}
        <div className="space-y-2">
          <Button 
            className="w-full" 
            disabled={!isConnected}
            variant={isConnected ? "default" : "secondary"}
          >
            <Zap className="w-4 h-4 mr-2" />
            {isConnected ? 'Apply Live Configuration' : 'Connect to Live Data First'}
          </Button>
          
          {isConnected && (
            <div className="text-xs text-center text-green-600">
              Configuration will be applied to live trading engine
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationPanel;
