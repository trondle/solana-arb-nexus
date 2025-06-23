
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Activity, 
  TrendingUp, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Zap,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2
} from 'lucide-react';
import { InternalApiService } from '@/services/internalApiService';
import { FreeMevApi } from '@/services/freeMevApi';
import { FreePriceService } from '@/services/freePriceService';

const FreeApiManager = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [systemOverview, setSystemOverview] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [priceServiceHealth, setPriceServiceHealth] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Initialize services
      FreeMevApi.initialize();
      
      // Load API keys
      setApiKeys(InternalApiService.getAllApiKeys());
      
      // Load system overview
      setSystemOverview(InternalApiService.getSystemOverview());
      
      // Load health status
      const health = await FreeMevApi.getHealthStatus();
      setHealthStatus(health);
      
      // Load price service health
      setPriceServiceHealth(FreePriceService.getHealthStatus());
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerateApiKey = () => {
    if (!newKeyName.trim()) return;
    
    const newKey = InternalApiService.generateApiKey(newKeyName, ['all']);
    setNewKeyName('');
    loadData();
    
    // Copy to clipboard
    navigator.clipboard.writeText(newKey);
    console.log(`✅ New API key generated and copied: ${newKey}`);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    console.log('API key copied to clipboard');
  };

  const handleToggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeactivateKey = (key: string) => {
    InternalApiService.deactivateApiKey(key);
    loadData();
  };

  const handleReactivateKey = (key: string) => {
    InternalApiService.reactivateApiKey(key);
    loadData();
  };

  const handleDeleteKey = (key: string) => {
    InternalApiService.deleteApiKey(key);
    loadData();
  };

  const testApiEndpoint = async () => {
    setLoading(true);
    setTestResults(null);
    
    try {
      const defaultKey = InternalApiService.getDefaultApiKey();
      const startTime = Date.now();
      
      const result = await FreeMevApi.getMevOpportunities(['SOL', 'ETH', 'USDC'], defaultKey || undefined);
      const responseTime = Date.now() - startTime;
      
      setTestResults({
        success: result.success,
        responseTime,
        dataCount: result.data.prices.length,
        arbitrageCount: result.data.arbitrageOpportunities?.length || 0,
        timestamp: new Date().toLocaleTimeString()
      });
      
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  const formatKey = (key: string, show: boolean) => {
    if (show) return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 8);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Free MEV API Service</h2>
          <p className="text-muted-foreground">
            Your own price streaming service - No external API costs!
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Keys</p>
                <p className="text-2xl font-bold">{systemOverview?.totalKeys || 0}</p>
              </div>
              <Key className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{systemOverview?.totalRequests || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {systemOverview?.successRate ? `${systemOverview.successRate.toFixed(1)}%` : '0%'}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">
                  {systemOverview?.averageResponseTime ? `${systemOverview.averageResponseTime.toFixed(0)}ms` : '0ms'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="test">Test API</TabsTrigger>
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
          <TabsTrigger value="docs">API Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Generate New API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="MEV Arbitrage Bot Key"
                  />
                </div>
                <Button onClick={handleGenerateApiKey} disabled={!newKeyName.trim()}>
                  Generate Key
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No API keys generated yet
                </p>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((keyData) => (
                    <div key={keyData.key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{keyData.name}</h4>
                          <Badge variant={keyData.active ? "default" : "destructive"}>
                            {keyData.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleKeyVisibility(keyData.key)}
                          >
                            {showKeys[keyData.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyKey(keyData.key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {keyData.active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivateKey(keyData.key)}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReactivateKey(keyData.key)}
                            >
                              Reactivate
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteKey(keyData.key)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm font-mono bg-muted p-2 rounded mb-2">
                        {formatKey(keyData.key, showKeys[keyData.key])}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p>{new Date(keyData.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Used</p>
                          <p>
                            {keyData.lastUsed > 0 
                              ? new Date(keyData.lastUsed).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Usage Count</p>
                          <p>{keyData.usageCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Permissions</p>
                          <p>{keyData.permissions.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test API Endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testApiEndpoint} disabled={loading}>
                {loading ? 'Testing...' : 'Test MEV API'}
              </Button>
              
              {testResults && (
                <Alert className={testResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-center gap-2">
                    {testResults.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      <strong>Test Result:</strong> {testResults.success ? 'Success' : 'Failed'}
                      {testResults.success && (
                        <div className="mt-2 text-sm">
                          Response Time: {testResults.responseTime}ms <br/>
                          Price Data: {testResults.dataCount} tokens <br/>
                          Arbitrage Opportunities: {testResults.arbitrageCount} <br/>
                          Timestamp: {testResults.timestamp}
                        </div>
                      )}
                      {!testResults.success && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {testResults.error}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Price Service Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={priceServiceHealth?.isActive ? "default" : "destructive"}>
                      {priceServiceHealth?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscriptions:</span>
                    <span>{priceServiceHealth?.subscriptions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Size:</span>
                    <span>{priceServiceHealth?.cacheSize || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sources:</span>
                    <span>{priceServiceHealth?.sources?.join(', ') || 'None'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={healthStatus?.status === 'healthy' ? "default" : "destructive"}>
                      {healthStatus?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span>{healthStatus?.version || '1.0.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Keys:</span>
                    <span>{systemOverview?.activeKeys || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Base URL</h4>
                <code className="bg-muted p-2 rounded block">
                  https://your-mev-api.com/api/v1
                </code>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Get Live Prices</h4>
                <code className="bg-muted p-2 rounded block text-sm">
                  POST /prices<br/>
                  Headers: Authorization: Bearer YOUR_API_KEY<br/>
                  Body: {JSON.stringify({ symbols: ['SOL', 'ETH', 'USDC'], includeArbitrage: true }, null, 2)}
                </code>
              </div>

              <div>
                <h4 className="font-semibold mb-2">WebSocket Streaming</h4>
                <code className="bg-muted p-2 rounded block text-sm">
                  ws://your-mev-api.com/ws/prices?apiKey=YOUR_API_KEY
                </code>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Free Service:</strong> This API uses free public endpoints and doesn't require paid API keys from Jupiter, 1inch, or CoinGecko. Perfect for your MEV arbitrage system!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FreeApiManager;
