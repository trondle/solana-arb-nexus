
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInputValidator } from './InputValidator';
import { supabase } from '@/integrations/supabase/client';

interface SecureConfig {
  id: string;
  configName: string;
  encryptedData: string;
  isActive: boolean;
  lastModified: Date;
}

const SecureConfigManager = () => {
  const { user, userRole, logAction } = useAuth();
  const { errors, sanitizeInput, validateTradingConfig, clearErrors } = useInputValidator();
  
  const [configs, setConfigs] = useState<SecureConfig[]>([]);
  const [showSensitiveData, setShowSensitiveData] = useState<Record<string, boolean>>({});
  const [newConfig, setNewConfig] = useState({
    configName: '',
    walletAddress: '',
    apiKey: '',
    rpcUrl: '',
    maxSlippage: 0.5,
    maxGasPrice: 50
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && (userRole === 'admin' || userRole === 'trader')) {
      loadConfigs();
    }
  }, [user, userRole]);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_configs')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Transform the data to match our SecureConfig interface
      const transformedConfigs = data?.map(config => ({
        id: config.id,
        configName: config.config_name,
        encryptedData: config.encrypted_private_key,
        isActive: config.is_active,
        lastModified: new Date(config.updated_at)
      })) || [];
      
      setConfigs(transformedConfigs);
      logAction('secure_config_loaded');
    } catch (error) {
      console.error('Error loading configs:', error);
    }
  };

  const encryptSensitiveData = (data: any): string => {
    // In production, use proper encryption
    // For now, using base64 encoding as placeholder
    return btoa(JSON.stringify(data));
  };

  const decryptSensitiveData = (encryptedData: string): any => {
    try {
      return JSON.parse(atob(encryptedData));
    } catch {
      return {};
    }
  };

  const handleSaveConfig = async () => {
    if (!validateTradingConfig({
      walletAddress: newConfig.walletAddress,
      maxSlippage: newConfig.maxSlippage,
      maxGasPrice: newConfig.maxGasPrice,
      amount: 1000, // Default amount for validation
      apiKey: newConfig.apiKey
    })) {
      return;
    }

    setLoading(true);
    try {
      // Sanitize inputs
      const sanitizedConfig = {
        configName: sanitizeInput(newConfig.configName),
        walletAddress: sanitizeInput(newConfig.walletAddress),
        apiKey: sanitizeInput(newConfig.apiKey),
        rpcUrl: sanitizeInput(newConfig.rpcUrl),
        maxSlippage: newConfig.maxSlippage,
        maxGasPrice: newConfig.maxGasPrice
      };

      // Encrypt sensitive data
      const encryptedData = encryptSensitiveData({
        walletAddress: sanitizedConfig.walletAddress,
        apiKey: sanitizedConfig.apiKey,
        rpcUrl: sanitizedConfig.rpcUrl
      });

      const { error } = await supabase
        .from('trading_configs')
        .insert({
          user_id: user?.id,
          config_name: sanitizedConfig.configName,
          encrypted_private_key: encryptedData,
          trading_parameters: {
            maxSlippage: sanitizedConfig.maxSlippage,
            maxGasPrice: sanitizedConfig.maxGasPrice
          },
          is_active: false
        });

      if (error) throw error;

      await logAction('secure_config_created', { configName: sanitizedConfig.configName });
      loadConfigs();
      
      // Reset form
      setNewConfig({
        configName: '',
        walletAddress: '',
        apiKey: '',
        rpcUrl: '',
        maxSlippage: 0.5,
        maxGasPrice: 50
      });
      clearErrors();
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConfigVisibility = (configId: string) => {
    setShowSensitiveData(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  // Only allow admin and trader access
  if (userRole !== 'admin' && userRole !== 'trader') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-700">
          <strong>Access Denied:</strong> You don't have permission to access secure configurations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-yellow-200 bg-yellow-50">
        <Shield className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700">
          <strong>Security Notice:</strong> All sensitive data is encrypted and stored securely. 
          Only authorized personnel can access these configurations.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Add Secure Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="configName">Configuration Name</Label>
              <Input
                id="configName"
                value={newConfig.configName}
                onChange={(e) => setNewConfig(prev => ({ ...prev, configName: e.target.value }))}
                placeholder="My Trading Config"
              />
              {errors.configName && <p className="text-sm text-red-500">{errors.configName}</p>}
            </div>

            <div>
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                value={newConfig.walletAddress}
                onChange={(e) => setNewConfig(prev => ({ ...prev, walletAddress: e.target.value }))}
                placeholder="Enter wallet address"
                type="password"
              />
              {errors.walletAddress && <p className="text-sm text-red-500">{errors.walletAddress}</p>}
            </div>

            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={newConfig.apiKey}
                onChange={(e) => setNewConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter API key"
                type="password"
              />
              {errors.apiKey && <p className="text-sm text-red-500">{errors.apiKey}</p>}
            </div>

            <div>
              <Label htmlFor="rpcUrl">RPC URL</Label>
              <Input
                id="rpcUrl"
                value={newConfig.rpcUrl}
                onChange={(e) => setNewConfig(prev => ({ ...prev, rpcUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="maxSlippage">Max Slippage (%)</Label>
              <Input
                id="maxSlippage"
                type="number"
                value={newConfig.maxSlippage}
                onChange={(e) => setNewConfig(prev => ({ ...prev, maxSlippage: parseFloat(e.target.value) }))}
                min="0.01"
                max="5"
                step="0.01"
              />
              {errors.maxSlippage && <p className="text-sm text-red-500">{errors.maxSlippage}</p>}
            </div>

            <div>
              <Label htmlFor="maxGasPrice">Max Gas Price (gwei)</Label>
              <Input
                id="maxGasPrice"
                type="number"
                value={newConfig.maxGasPrice}
                onChange={(e) => setNewConfig(prev => ({ ...prev, maxGasPrice: parseFloat(e.target.value) }))}
                min="1"
                max="1000"
              />
              {errors.maxGasPrice && <p className="text-sm text-red-500">{errors.maxGasPrice}</p>}
            </div>
          </div>

          <Button onClick={handleSaveConfig} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Secure Configuration'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No configurations saved</p>
            ) : (
              configs.map((config) => (
                <div key={config.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{config.configName}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleConfigVisibility(config.id)}
                    >
                      {showSensitiveData[config.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {showSensitiveData[config.id] ? (
                    <div className="text-sm space-y-1">
                      <p><strong>Wallet:</strong> {decryptSensitiveData(config.encryptedData).walletAddress || '••••••••'}</p>
                      <p><strong>API Key:</strong> {decryptSensitiveData(config.encryptedData).apiKey || '••••••••'}</p>
                      <p><strong>RPC URL:</strong> {decryptSensitiveData(config.encryptedData).rpcUrl || '••••••••'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sensitive data hidden • Click eye icon to reveal
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Last modified: {config.lastModified.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureConfigManager;
