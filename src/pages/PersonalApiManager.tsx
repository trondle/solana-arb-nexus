
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Eye, EyeOff, Zap, Target } from 'lucide-react';
import { PersonalApiService } from '@/services/personalApiService';
import { SecureConfigManager } from '@/services/secureConfigManager';
import { useAuth } from '@/hooks/useAuth';

interface TokenPriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  marketCap?: number;
  lastUpdated: number;
  source: string;
  reliability: number;
}

interface ArbitrageOpportunity {
  tokenSymbol: string;
  buyChain: string;
  sellChain: string;
  buyPrice: number;
  sellPrice: number;
  profitPercent: number;
  estimatedProfit: number;
  riskScore: number;
  confidence: number;
  timestamp: number;
}

const PersonalApiManager = () => {
  const { user, userRole, logAction } = useAuth();
  const [apiKeys, setApiKeys] = useState({
    jupiterApiKey: '',
    oneInchApiKey: '',
    coinGeckoApiKey: ''
  });
  const [showKeys, setShowKeys] = useState({
    jupiter: false,
    oneInch: false,
    coinGecko: false
  });
  const [config, setConfig] = useState(PersonalApiService.getConfig());
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [priceData, setPriceData] = useState<TokenPriceData[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [securityStatus, setSecurityStatus] = useState<any>(null);

  // Only allow admin and trader access
  if (userRole !== 'admin' && userRole !== 'trader') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <strong>Access Denied:</strong> You need admin or trader privileges to access the Personal API Manager.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(updateDashboard, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      // Load saved configuration
      const savedConfig = SecureConfigManager.loadApiKeys();
      if (savedConfig.jupiterApiKey) setApiKeys(prev => ({ ...prev, jupiterApiKey: savedConfig.jupiterApiKey! }));
      if (savedConfig.oneInchApiKey) setApiKeys(prev => ({ ...prev, oneInchApiKey: savedConfig.oneInchApiKey! }));
      if (savedConfig.coinGeckoApiKey) setApiKeys(prev => ({ ...prev, coinGeckoApiKey: savedConfig.coinGeckoApiKey! }));

      // Get security status
      setSecurityStatus(SecureConfigManager.getSecurityStatus());
      
      // Initial dashboard update
      await updateDashboard();
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load initial data');
    }
  };

  const updateDashboard = async () => {
    try {
      // Get health status
      const health = await PersonalApiService.healthCheck();
      setHealthStatus(health);

      // Get cache statistics
      const stats = PersonalApiService.getCacheStats();
      setCacheStats(stats);

      // Load sample price data
      const tokens = ['SOL', 'ETH', 'USDC'];
      const prices: TokenPriceData[] = [];
      
      for (const token of tokens) {
        if (token === 'SOL') {
          const solPrice = await PersonalApiService.getSolanaPrice(token);
          if (solPrice) prices.push(solPrice);
        } else {
          const basePrice = await PersonalApiService.getEVMPrice(8453, token);
          if (basePrice) prices.push(basePrice);
        }
      }
      setPriceData(prices);

      // Find arbitrage opportunities
      const opps = await PersonalApiService.findArbitrageOpportunities();
      setOpportunities(opps);

    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  };

  const handleSaveApiKeys = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate API keys
      const validations = {
        jupiter: SecureConfigManager.validateApiKey(apiKeys.jupiterApiKey, 'jupiter'),
        oneInch: SecureConfigManager.validateApiKey(apiKeys.oneInchApiKey, 'oneInch'),
        coinGecko: SecureConfigManager.validateApiKey(apiKeys.coinGeckoApiKey, 'coinGecko')
      };

      if (!validations.jupiter && apiKeys.jupiterApiKey) {
        setError('Invalid Jupiter API key format');
        return;
      }
      if (!validations.oneInch && apiKeys.oneInchApiKey) {
        setError('Invalid 1inch API key format');
        return;
      }
      if (!validations.coinGecko && apiKeys.coinGeckoApiKey) {
        setError('Invalid CoinGecko API key format (should start with CG-)');
        return;
      }

      // Save securely
      const success = SecureConfigManager.setApiKeys(apiKeys);
      if (!success) {
        setError('Failed to save API keys securely');
        return;
      }

      // Update PersonalApiService configuration
      PersonalApiService.setConfig(apiKeys);

      // Update security status
      setSecurityStatus(SecureConfigManager.getSecurityStatus());

      // Log action
      await logAction('api_keys_configured', { 
        hasJupiter: !!apiKeys.jupiterApiKey,
        hasOneInch: !!apiKeys.oneInchApiKey,
        hasCoinGecko: !!apiKeys.coinGeckoApiKey
      });

      // Refresh dashboard
      await updateDashboard();

      setError('');
      console.log('✓ API keys saved and configured successfully');
    } catch (error) {
      console.error('Error saving API keys:', error);
      setError('Failed to save API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = (updates: any) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    PersonalApiService.setConfig(updates);
  };

  const handleClearCache = () => {
    PersonalApiService.clearCache();
    setCacheStats(PersonalApiService.getCacheStats());
    console.log('Cache cleared');
  };

  const performSecurityAudit = () => {
    const audit = SecureConfigManager.performSecurityAudit();
    console.log('Security Audit Results:', audit);
    return audit;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Personal API Manager</h1>
          <p className="text-slate-600">
            Secure, private API service for Fantom, Base & Solana • Low-risk, high-reward arbitrage detection
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">API Health</p>
                  <p className="text-2xl font-bold">
                    {healthStatus?.overall ? 'Online' : 'Offline'}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${healthStatus?.overall ? 'bg-green-100' : 'bg-red-100'}`}>
                  {healthStatus?.overall ? 
                    <CheckCircle className="h-6 w-6 text-green-600" /> : 
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-2xl font-bold">{healthStatus?.riskLevel || 'HIGH'}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Opportunities</p>
                  <p className="text-2xl font-bold">{opportunities.length}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cache Size</p>
                  <p className="text-2xl font-bold">{cacheStats?.size || 0}</p>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="configuration" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    API Keys Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="jupiterKey">Jupiter API Key (Solana)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="jupiterKey"
                          type={showKeys.jupiter ? "text" : "password"}
                          value={apiKeys.jupiterApiKey}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, jupiterApiKey: e.target.value }))}
                          placeholder="Enter Jupiter API key"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowKeys(prev => ({ ...prev, jupiter: !prev.jupiter }))}
                        >
                          {showKeys.jupiter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="oneInchKey">1inch API Key (EVM Chains)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="oneInchKey"
                          type={showKeys.oneInch ? "text" : "password"}
                          value={apiKeys.oneInchApiKey}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, oneInchApiKey: e.target.value }))}
                          placeholder="Enter 1inch API key"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowKeys(prev => ({ ...prev, oneInch: !prev.oneInch }))}
                        >
                          {showKeys.oneInch ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="coinGeckoKey">CoinGecko API Key (Backup Data)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="coinGeckoKey"
                          type={showKeys.coinGecko ? "text" : "password"}
                          value={apiKeys.coinGeckoApiKey}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, coinGeckoApiKey: e.target.value }))}
                          placeholder="CG-xxxxxxxxxx"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowKeys(prev => ({ ...prev, coinGecko: !prev.coinGecko }))}
                        >
                          {showKeys.coinGecko ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveApiKeys} disabled={loading} className="w-full">
                    {loading ? 'Saving...' : 'Save API Keys Securely'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Trading Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maxSlippage">Max Slippage (%)</Label>
                    <Input
                      id="maxSlippage"
                      type="number"
                      value={config.maxSlippage}
                      onChange={(e) => handleConfigUpdate({ maxSlippage: parseFloat(e.target.value) })}
                      min="0.1"
                      max="2"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Conservative: 0.5% or lower</p>
                  </div>

                  <div>
                    <Label htmlFor="maxTradeAmount">Max Trade Amount ($)</Label>
                    <Input
                      id="maxTradeAmount"
                      type="number"
                      value={config.maxTradeAmount}
                      onChange={(e) => handleConfigUpdate({ maxTradeAmount: parseFloat(e.target.value) })}
                      min="100"
                      max="10000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Start small: $1000 or less</p>
                  </div>

                  <div>
                    <Label htmlFor="minProfit">Min Profit Threshold (%)</Label>
                    <Input
                      id="minProfit"
                      type="number"
                      value={config.minProfitThreshold}
                      onChange={(e) => handleConfigUpdate({ minProfitThreshold: parseFloat(e.target.value) })}
                      min="0.1"
                      max="5"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Conservative: 0.3% minimum</p>
                  </div>

                  <div>
                    <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      value={config.rateLimitPerMinute}
                      onChange={(e) => handleConfigUpdate({ rateLimitPerMinute: parseInt(e.target.value) })}
                      min="10"
                      max="60"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Low-Risk Arbitrage Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {opportunities.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No opportunities detected</p>
                    <p className="text-sm text-muted-foreground">Configure API keys to start scanning</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {opportunities.map((opp, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{opp.tokenSymbol}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {opp.buyChain} → {opp.sellChain}
                            </span>
                          </div>
                          <Badge 
                            variant={opp.riskScore <= 20 ? "default" : opp.riskScore <= 40 ? "secondary" : "destructive"}
                          >
                            Risk: {opp.riskScore}/100
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Buy Price</p>
                            <p className="font-semibold">${opp.buyPrice.toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sell Price</p>
                            <p className="font-semibold">${opp.sellPrice.toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Profit %</p>
                            <p className="font-semibold text-green-600">+{opp.profitPercent.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Est. Profit</p>
                            <p className="font-semibold text-green-600">${opp.estimatedProfit.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Confidence: {(opp.confidence * 100).toFixed(0)}%</span>
                          <span>{new Date(opp.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Price Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {priceData.map((token, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-semibold">{token.symbol}</p>
                          <p className="text-sm text-muted-foreground">{token.source}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${token.price.toFixed(4)}</p>
                          <p className={`text-sm ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Jupiter API</span>
                      <Badge variant={healthStatus?.jupiter ? "default" : "destructive"}>
                        {healthStatus?.jupiter ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>1inch API</span>
                      <Badge variant={healthStatus?.oneInch ? "default" : "destructive"}>
                        {healthStatus?.oneInch ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>CoinGecko API</span>
                      <Badge variant={healthStatus?.coinGecko ? "default" : "destructive"}>
                        {healthStatus?.coinGecko ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span>Cache Statistics</span>
                        <Button variant="outline" size="sm" onClick={handleClearCache}>
                          Clear Cache
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Entries: {cacheStats?.size || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="font-semibold">Configuration Security</p>
                      <p className="text-sm text-muted-foreground">
                        API Keys: {securityStatus?.hasApiKeys ? '✓ Encrypted' : '⚠️ Not configured'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Session: {securityStatus?.sessionValid ? '✓ Active' : '⚠️ Expired'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Security Level: {securityStatus?.securityLevel}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-semibold">Risk Management</p>
                      <p className="text-sm text-muted-foreground">
                        Max Trade: ${config.maxTradeAmount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Max Slippage: {config.maxSlippage}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rate Limit: {config.rateLimitPerMinute}/min
                      </p>
                    </div>
                  </div>

                  <Button onClick={performSecurityAudit} variant="outline">
                    Run Security Audit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PersonalApiManager;
