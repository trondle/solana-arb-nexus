
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  Server, 
  Copy, 
  Settings, 
  Activity, 
  Code, 
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { LiveFeedApiService } from '@/services/liveFeedApiService';
import { useToast } from '@/hooks/use-toast';

const LiveFeedApiPanel = () => {
  const [config, setConfig] = useState(LiveFeedApiService.getConfig());
  const [health, setHealth] = useState<any>(null);
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [customEndpoint, setCustomEndpoint] = useState(config.apiEndpoint);
  const { toast } = useToast();

  useEffect(() => {
    const checkHealth = async () => {
      const healthData = await LiveFeedApiService.healthCheck();
      setHealth(healthData);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = () => {
    LiveFeedApiService.configure({
      enableRemoteAccess: true,
      apiEndpoint: customEndpoint,
      apiKey: apiKey,
      rateLimitPerMinute: 60
    });
    
    setConfig(LiveFeedApiService.getConfig());
    toast({
      title: "Configuration Saved",
      description: "Live feed API is now configured for remote access",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} copied to clipboard`,
    });
  };

  const connectionGuide = LiveFeedApiService.getLocalConnectionGuide();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-500" />
          Live Feed API Service
          <Badge variant={health?.status === 'healthy' ? 'default' : 'destructive'}>
            {health?.status || 'Unknown'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="local-setup">Local Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {health?.uptime || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {health?.requestCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {health?.rateLimitRemaining || 60}
                </div>
                <div className="text-sm text-muted-foreground">Rate Limit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  <Activity className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-sm text-muted-foreground">Live Feed</div>
              </div>
            </div>

            {health && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-semibold mb-2">Service Health Status:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(health.services).map(([service, status]) => (
                    <div key={service} className={`flex items-center gap-2 ${status ? 'text-green-600' : 'text-red-600'}`}>
                      {status ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span className="capitalize">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <div className="flex gap-2">
                  <Input
                    id="endpoint"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="https://your-app.lovable.app/api/live-feed"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(customEndpoint, 'API Endpoint')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key for authentication"
                />
              </div>

              <Button onClick={handleSaveConfig} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2">Live Prices Endpoint</div>
                <div className="text-sm text-muted-foreground mb-2">POST /api/live-feed/prices</div>
                <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                  {JSON.stringify(connectionGuide.sampleRequests.prices, null, 2)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => copyToClipboard(JSON.stringify(connectionGuide.sampleRequests.prices, null, 2), 'Prices Request')}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2">Arbitrage Opportunities</div>
                <div className="text-sm text-muted-foreground mb-2">GET /api/live-feed/arbitrage</div>
                <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                  {JSON.stringify(connectionGuide.sampleRequests.arbitrage, null, 2)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => copyToClipboard(JSON.stringify(connectionGuide.sampleRequests.arbitrage, null, 2), 'Arbitrage Request')}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="local-setup" className="space-y-4">
            <Alert>
              <Server className="h-4 w-4" />
              <AlertDescription>
                <strong>Connect Your Local System:</strong> Use these endpoints to connect your local arbitrage system to this online live feed service.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2">Connection Details</div>
                <div className="space-y-2 text-sm">
                  <div><strong>Base URL:</strong> {config.apiEndpoint}</div>
                  <div><strong>Rate Limit:</strong> {config.rateLimitPerMinute} requests/minute</div>
                  <div><strong>Authentication:</strong> Optional API key</div>
                  <div><strong>CORS:</strong> Enabled for local development</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2">Sample Integration Code (Python)</div>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  {`import requests
import json

# Configuration
BASE_URL = "${config.apiEndpoint}"
API_KEY = "${apiKey || 'your-api-key'}"

# Get live prices
def get_live_prices(tokens):
    url = f"{BASE_URL}/prices"
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["X-API-Key"] = API_KEY
    
    response = requests.post(url, 
        json={"tokens": tokens}, 
        headers=headers)
    return response.json()

# Get arbitrage opportunities
def get_arbitrage_opportunities():
    url = f"{BASE_URL}/arbitrage"
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["X-API-Key"] = API_KEY
    
    response = requests.get(url, headers=headers)
    return response.json()

# Example usage
prices = get_live_prices(["SOL", "ETH", "USDC"])
opportunities = get_arbitrage_opportunities()`}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => copyToClipboard(`import requests
import json

# Configuration
BASE_URL = "${config.apiEndpoint}"
API_KEY = "${apiKey || 'your-api-key'}"

# Get live prices
def get_live_prices(tokens):
    url = f"{BASE_URL}/prices"
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["X-API-Key"] = API_KEY
    
    response = requests.post(url, 
        json={"tokens": tokens}, 
        headers=headers)
    return response.json()

# Get arbitrage opportunities
def get_arbitrage_opportunities():
    url = f"{BASE_URL}/arbitrage"
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["X-API-Key"] = API_KEY
    
    response = requests.get(url, headers=headers)
    return response.json()

# Example usage
prices = get_live_prices(["SOL", "ETH", "USDC"])
opportunities = get_arbitrage_opportunities()`, 'Python Integration Code')}
                >
                  <Code className="w-4 h-4 mr-1" />
                  Copy Python Code
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a 
                    href={`${config.apiEndpoint}/health`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test Health Endpoint
                  </a>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(config.apiEndpoint, 'API Base URL')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Base URL
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LiveFeedApiPanel;
