
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, Zap, DollarSign, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingConfig {
  minSpread: number;
  maxTradeAmount: number;
  minLiquidity: number;
  gasLimit: number;
  slippageTolerance: number;
  enableAutoExecution: boolean;
  riskLevel: number;
  blacklistedTokens: string;
  whitelistedDexs: string[];
  maxConcurrentTrades: number;
}

const ConfigurationPanel = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<TradingConfig>({
    minSpread: 1.5,
    maxTradeAmount: 10000,
    minLiquidity: 50000,
    gasLimit: 200000,
    slippageTolerance: 0.5,
    enableAutoExecution: false,
    riskLevel: 3,
    blacklistedTokens: '',
    whitelistedDexs: ['raydium', 'orca', 'jupiter'],
    maxConcurrentTrades: 3
  });

  const [rpcUrls, setRpcUrls] = useState<string[]>([
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana'
  ]);

  const [newRpcUrl, setNewRpcUrl] = useState('');

  const handleConfigSave = () => {
    // Simulate saving configuration
    toast({
      title: "Configuration Saved",
      description: "Your trading parameters have been updated successfully.",
    });
  };

  const addRpcUrl = () => {
    if (newRpcUrl && !rpcUrls.includes(newRpcUrl)) {
      setRpcUrls([...rpcUrls, newRpcUrl]);
      setNewRpcUrl('');
      toast({
        title: "RPC URL Added",
        description: "New RPC endpoint has been added to the list.",
      });
    }
  };

  const removeRpcUrl = (url: string) => {
    setRpcUrls(rpcUrls.filter(u => u !== url));
  };

  const toggleDex = (dex: string) => {
    setConfig(prev => ({
      ...prev,
      whitelistedDexs: prev.whitelistedDexs.includes(dex)
        ? prev.whitelistedDexs.filter(d => d !== dex)
        : [...prev.whitelistedDexs, dex]
    }));
  };

  const getRiskLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Very Conservative';
      case 2: return 'Conservative';
      case 3: return 'Moderate';
      case 4: return 'Aggressive';
      case 5: return 'Very Aggressive';
      default: return 'Moderate';
    }
  };

  const getRiskLevelColor = (level: number) => {
    if (level <= 2) return 'text-green-500';
    if (level === 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Trading Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Trading Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minSpread">Minimum Spread (%)</Label>
                <Input
                  id="minSpread"
                  type="number"
                  step="0.1"
                  value={config.minSpread}
                  onChange={(e) => setConfig(prev => ({ ...prev, minSpread: parseFloat(e.target.value) }))}
                />
                <div className="text-sm text-muted-foreground">
                  Only execute trades with spreads above this threshold
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTradeAmount">Max Trade Amount (USD)</Label>
                <Input
                  id="maxTradeAmount"
                  type="number"
                  value={config.maxTradeAmount}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxTradeAmount: parseFloat(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minLiquidity">Minimum Liquidity (USD)</Label>
                <Input
                  id="minLiquidity"
                  type="number"
                  value={config.minLiquidity}
                  onChange={(e) => setConfig(prev => ({ ...prev, minLiquidity: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gasLimit">Gas Limit</Label>
                <Input
                  id="gasLimit"
                  type="number"
                  value={config.gasLimit}
                  onChange={(e) => setConfig(prev => ({ ...prev, gasLimit: parseInt(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
                <Input
                  id="slippage"
                  type="number"
                  step="0.1"
                  value={config.slippageTolerance}
                  onChange={(e) => setConfig(prev => ({ ...prev, slippageTolerance: parseFloat(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTrades">Max Concurrent Trades</Label>
                <Input
                  id="maxTrades"
                  type="number"
                  value={config.maxConcurrentTrades}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxConcurrentTrades: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoExecution">Auto Execution</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically execute profitable trades
                </div>
              </div>
              <Switch
                id="autoExecution"
                checked={config.enableAutoExecution}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableAutoExecution: checked }))}
              />
            </div>

            <div className="space-y-3">
              <Label>Risk Level: <span className={getRiskLevelColor(config.riskLevel)}>{getRiskLevelText(config.riskLevel)}</span></Label>
              <Slider
                value={[config.riskLevel]}
                onValueChange={(value) => setConfig(prev => ({ ...prev, riskLevel: value[0] }))}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DEX Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            DEX Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Whitelisted DEXs</Label>
            <div className="flex gap-2">
              {['raydium', 'orca', 'jupiter'].map((dex) => (
                <Badge
                  key={dex}
                  variant={config.whitelistedDexs.includes(dex) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleDex(dex)}
                >
                  {dex.charAt(0).toUpperCase() + dex.slice(1)}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Click to enable/disable DEXs for trading
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="blacklisted">Blacklisted Tokens</Label>
            <Textarea
              id="blacklisted"
              placeholder="Enter token addresses separated by commas"
              value={config.blacklistedTokens}
              onChange={(e) => setConfig(prev => ({ ...prev, blacklistedTokens: e.target.value }))}
            />
            <div className="text-sm text-muted-foreground">
              Tokens that should never be traded
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Network Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>RPC Endpoints</Label>
            <div className="space-y-2">
              {rpcUrls.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm font-mono">{url}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeRpcUrl(url)}
                    disabled={rpcUrls.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add new RPC URL"
              value={newRpcUrl}
              onChange={(e) => setNewRpcUrl(e.target.value)}
            />
            <Button onClick={addRpcUrl}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleConfigSave} className="w-full" size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationPanel;
