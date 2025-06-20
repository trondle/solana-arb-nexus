
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Server, 
  CheckCircle, 
  XCircle,
  Activity,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfigurationService } from '@/services/configurationService';

interface LocalServiceConfig {
  enabled: boolean;
  baseUrl: string;
  port: string;
  testConnection: boolean;
}

interface ServiceStatus {
  solana: boolean;
  base: boolean;
  fantom: boolean;
  marketData: boolean;
  lastChecked: Date | null;
}

const LocalServiceConnection = () => {
  const [config, setConfig] = useState<LocalServiceConfig>({
    enabled: false,
    baseUrl: 'http://localhost',
    port: '3000',
    testConnection: false
  });
  const [status, setStatus] = useState<ServiceStatus>({
    solana: false,
    base: false,
    fantom: false,
    marketData: false,
    lastChecked: null
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const savedConfig = await ConfigurationService.loadConfiguration();
      if (savedConfig.localServiceConfig) {
        setConfig({
          enabled: savedConfig.localServiceConfig.enabled || false,
          baseUrl: savedConfig.localServiceConfig.baseUrl || 'http://localhost',
          port: savedConfig.localServiceConfig.port || '3000',
          testConnection: false
        });
      }
    } catch (error) {
      console.error('Failed to load local service configuration:', error);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    const fullUrl = `${config.baseUrl}:${config.port}`;
    
    try {
      // Test Solana endpoint
      const solanaTest = await fetch(`${fullUrl}/solana/price?ids=So11111111111111111111111111111111111111112`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.ok).catch(() => false);

      // Test Base (EVM chain 8453)
      const baseTest = await fetch(`${fullUrl}/evm/8453/gas-price`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.ok).catch(() => false);

      // Test Fantom (EVM chain 250)
      const fantomTest = await fetch(`${fullUrl}/evm/250/gas-price`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.ok).catch(() => false);

      // Test Market Data
      const marketTest = await fetch(`${fullUrl}/prices/simple?ids=solana&vs_currencies=usd`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.ok).catch(() => false);

      const newStatus = {
        solana: solanaTest,
        base: baseTest,
        fantom: fantomTest,
        marketData: marketTest,
        lastChecked: new Date()
      };

      setStatus(newStatus);

      const allConnected = solanaTest && baseTest && fantomTest && marketTest;
      toast({
        title: allConnected ? "Connection Successful" : "Partial Connection",
        description: allConnected 
          ? "All endpoints are responding correctly" 
          : "Some endpoints are not responding. Check your local service.",
        variant: allConnected ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to local service. Make sure Docker is running.",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      await ConfigurationService.updateConfig({
        localServiceConfig: config,
        enableLocalService: config.enabled
      });
      
      toast({
        title: "Configuration Saved",
        description: "Local service configuration has been updated.",
      });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceUrl = () => `${config.baseUrl}:${config.port}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          Local Trading Service
          {config.enabled && (
            <Badge variant="default">
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Local Service */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">Use Local Service</div>
            <div className="text-sm text-muted-foreground">
              Connect to your Docker-based trading API
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => setConfig(prev => ({ ...prev, enabled }))}
          />
        </div>

        {/* Service Configuration */}
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base-url">Base URL</Label>
              <Input
                id="base-url"
                value={config.baseUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="http://localhost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={config.port}
                onChange={(e) => setConfig(prev => ({ ...prev, port: e.target.value }))}
                placeholder="3000"
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">Service URL</div>
            <div className="text-sm text-muted-foreground">{getServiceUrl()}</div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Endpoint Status</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={testing}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              {testing ? "Testing..." : "Test Connection"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {status.solana ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Solana API</span>
            </div>
            <div className="flex items-center gap-2">
              {status.base ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Base API</span>
            </div>
            <div className="flex items-center gap-2">
              {status.fantom ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Fantom API</span>
            </div>
            <div className="flex items-center gap-2">
              {status.marketData ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Market Data</span>
            </div>
          </div>

          {status.lastChecked && (
            <div className="text-xs text-muted-foreground">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Information Alert */}
        <Alert>
          <Globe className="w-4 h-4" />
          <AlertDescription>
            Your local service provides the same functionality as Jupiter, 1inch, and CoinGecko APIs 
            but runs locally on Docker. Make sure your Docker container is running on the configured port.
          </AlertDescription>
        </Alert>

        {/* Available Endpoints Info */}
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <div className="font-medium text-sm">Available Endpoints:</div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>• Solana: /solana/price, /solana/quote, /solana/swap</div>
            <div>• Base: /evm/8453/price, /evm/8453/quote, /evm/8453/gas-price</div>
            <div>• Fantom: /evm/250/price, /evm/250/quote, /evm/250/gas-price</div>
            <div>• Market: /prices/simple, /prices/trending</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={saveConfiguration} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
          <Button 
            variant="outline" 
            onClick={loadConfiguration}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalServiceConnection;
