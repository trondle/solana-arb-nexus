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
  Globe,
  AlertCircle
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
  errors: string[];
}

const LocalServiceConnection = () => {
  const [config, setConfig] = useState<LocalServiceConfig>({
    enabled: false,
    baseUrl: 'http://localhost',
    port: '8080',
    testConnection: false
  });
  const [status, setStatus] = useState<ServiceStatus>({
    solana: false,
    base: false,
    fantom: false,
    marketData: false,
    lastChecked: null,
    errors: []
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
          port: savedConfig.localServiceConfig.port || '8080',
          testConnection: false
        });
      }
    } catch (error) {
      console.error('Failed to load local service configuration:', error);
    }
  };

  const testEndpointWithRetry = async (url: string, retries: number = 3, timeout: number = 10000): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Testing endpoint: ${url} (attempt ${i + 1}/${retries})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✓ Endpoint ${url} responded successfully`);
          return true;
        } else {
          console.log(`⚠ Endpoint ${url} returned status ${response.status}`);
          // For local services, even 4xx/5xx responses indicate the service is running
          if (response.status < 500) {
            return true; // Service is responding, just might need different parameters
          }
        }
      } catch (error) {
        console.log(`✗ Endpoint ${url} failed (attempt ${i + 1}): ${error}`);
        
        // If it's the last retry, return false
        if (i === retries - 1) {
          return false;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, i), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return false;
  };

  const testConnection = async () => {
    setTesting(true);
    const fullUrl = `${config.baseUrl}:${config.port}`;
    const errors: string[] = [];
    
    try {
      console.log(`Starting connection test for ${fullUrl}`);
      
      // Since this is the same application running locally, we'll test different endpoints
      // that would be available in a local instance
      const [healthTest, dashboardTest, apiTest] = await Promise.all([
        // Test if the app is running at all
        testEndpointWithRetry(`${fullUrl}/`)
          .catch(() => false),
        
        // Test dashboard route
        testEndpointWithRetry(`${fullUrl}/dashboard`)
          .catch(() => false),
        
        // Test if any API routes are available
        testEndpointWithRetry(`${fullUrl}/api/health`)
          .catch(() => testEndpointWithRetry(`${fullUrl}/health`))
          .catch(() => false),
        
        // Test basic connectivity
        testEndpointWithRetry(`${fullUrl}`)
          .catch(() => false)
      ]);

      const newStatus = {
        solana: healthTest || dashboardTest,
        base: healthTest || dashboardTest, 
        fantom: healthTest || dashboardTest,
        marketData: apiTest || healthTest,
        lastChecked: new Date(),
        errors
      };

      setStatus(newStatus);

      const connectedEndpoints = [healthTest, dashboardTest, apiTest].filter(Boolean).length;

      if (connectedEndpoints > 0) {
        toast({
          title: "Connection Successful",
          description: `Local application is accessible at ${fullUrl}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: `Cannot reach local application at ${fullUrl}. Make sure it's running.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Connection test failed:', error);
      setStatus(prev => ({
        ...prev,
        errors: [...prev.errors, `Connection test failed: ${error}`],
        lastChecked: new Date()
      }));
      
      toast({
        title: "Connection Test Error",
        description: "Unable to test connection. Check console for details.",
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
  const getConnectionStatus = () => {
    const connected = [status.solana, status.base, status.fantom, status.marketData].filter(Boolean).length;
    return `${connected}/4 endpoints`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          Local Application Connection
          {config.enabled && (
            <Badge variant="default">
              Connected ({getConnectionStatus()})
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Local Service */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">Use Local Application</div>
            <div className="text-sm text-muted-foreground">
              Connect to your locally running Arbitrage Nexus
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
                placeholder="8080"
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">Application URL</div>
            <div className="text-sm text-muted-foreground">{getServiceUrl()}</div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Application Status</h4>
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
              <span className="text-sm">Main App</span>
            </div>
            <div className="flex items-center gap-2">
              {status.base ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              {status.fantom ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Trading Engine</span>
            </div>
            <div className="flex items-center gap-2">
              {status.marketData ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">API Services</span>
            </div>
          </div>

          {status.lastChecked && (
            <div className="text-xs text-muted-foreground">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Local Application Info */}
        <Alert>
          <Globe className="w-4 h-4" />
          <AlertDescription>
            This connects to your locally running Arbitrage Nexus application. 
            Make sure your local instance is running on the specified port.
          </AlertDescription>
        </Alert>

        {/* Quick Access */}
        {config.baseUrl && config.port && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="font-medium text-sm">Quick Access:</div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>• Dashboard: <a href={`${getServiceUrl()}/dashboard`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{getServiceUrl()}/dashboard</a></div>
              <div>• Main App: <a href={getServiceUrl()} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{getServiceUrl()}</a></div>
            </div>
          </div>
        )}

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
