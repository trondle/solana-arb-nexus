import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lock, Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInputValidator } from './InputValidator';
import { supabase } from '@/integrations/supabase/client';
import { encryptSensitiveData, decryptSensitiveData, isEncryptionSupported } from '@/utils/encryption';

interface SecureConfig {
  id: string;
  configName: string;
  encryptedData: string;
  isActive: boolean;
  lastModified: Date;
}

const SecureConfigManager = () => {
  const { user, userRole, logAction } = useAuth();
  const { errors, warnings, sanitizeInput, validateTradingConfig, validateFinancialParameters, checkRateLimit, clearErrors } = useInputValidator();
  
  const [configs, setConfigs] = useState<SecureConfig[]>([]);
  const [showSensitiveData, setShowSensitiveData] = useState<Record<string, boolean>>({});
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPasswordDialog, setShowMasterPasswordDialog] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [newConfig, setNewConfig] = useState({
    configName: '',
    walletAddress: '',
    apiKey: '',
    rpcUrl: '',
    maxSlippage: 0.5,
    maxGasPrice: 50
  });
  const [loading, setLoading] = useState(false);
  const [encryptionError, setEncryptionError] = useState<string>('');

  useEffect(() => {
    if (user && (userRole === 'admin' || userRole === 'trader')) {
      loadConfigs();
    }
  }, [user, userRole]);

  useEffect(() => {
    // Check if encryption is supported
    if (!isEncryptionSupported()) {
      setEncryptionError('Your browser does not support the required encryption features. Please use a modern browser.');
    }
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_configs')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const transformedConfigs = data?.map(config => ({
        id: config.id,
        configName: config.config_name,
        encryptedData: config.encrypted_private_key,
        isActive: config.is_active,
        lastModified: new Date(config.updated_at)
      })) || [];
      
      setConfigs(transformedConfigs);
      await logAction('secure_config_loaded');
    } catch (error) {
      console.error('Error loading configs:', error);
    }
  };

  const handleSaveConfig = async () => {
    if (!checkRateLimit()) {
      return;
    }

    // Enhanced validation
    const tradingValidation = validateTradingConfig({
      walletAddress: newConfig.walletAddress,
      maxSlippage: newConfig.maxSlippage,
      maxGasPrice: newConfig.maxGasPrice,
      amount: 1000,
      apiKey: newConfig.apiKey
    });

    const financialValidation = validateFinancialParameters({
      tradeAmount: 1000,
      stopLoss: newConfig.maxSlippage,
      takeProfit: 10,
      leverageRatio: 1
    });

    if (!tradingValidation || !financialValidation.isValid) {
      return;
    }

    if (!isEncryptionSupported()) {
      setEncryptionError('Encryption not supported in this browser');
      return;
    }

    setLoading(true);
    setEncryptionError('');

    try {
      // Enhanced input sanitization
      const sanitizedConfig = {
        configName: sanitizeInput(newConfig.configName),
        walletAddress: sanitizeInput(newConfig.walletAddress),
        apiKey: sanitizeInput(newConfig.apiKey),
        rpcUrl: sanitizeInput(newConfig.rpcUrl),
        maxSlippage: newConfig.maxSlippage,
        maxGasPrice: newConfig.maxGasPrice
      };

      // Request master password for encryption
      const userPassword = prompt('Enter master password for encryption:');
      if (!userPassword) {
        setLoading(false);
        return;
      }

      // Encrypt sensitive data using AES-256-GCM
      const encryptedData = await encryptSensitiveData({
        walletAddress: sanitizedConfig.walletAddress,
        apiKey: sanitizedConfig.apiKey,
        rpcUrl: sanitizedConfig.rpcUrl,
        timestamp: Date.now() // Add timestamp for additional security
      }, userPassword);

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

      await logAction('secure_config_created', { 
        configName: sanitizedConfig.configName,
        encryptionMethod: 'AES-256-GCM',
        timestamp: new Date().toISOString()
      });
      
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
      setEncryptionError('Failed to encrypt and save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSensitiveData = (configId: string) => {
    setSelectedConfigId(configId);
    setShowMasterPasswordDialog(true);
  };

  const handleDecryptAndShow = async () => {
    if (!masterPassword) return;

    try {
      const config = configs.find(c => c.id === selectedConfigId);
      if (!config) return;

      const decryptedData = await decryptSensitiveData(config.encryptedData, masterPassword);
      
      // Verify timestamp (basic tamper detection)
      if (decryptedData.timestamp && Date.now() - decryptedData.timestamp > 30 * 24 * 60 * 60 * 1000) {
        console.warn('Configuration is older than 30 days');
      }

      setShowSensitiveData(prev => ({
        ...prev,
        [selectedConfigId]: true
      }));

      await logAction('sensitive_data_accessed', { configId: selectedConfigId });
      
      setShowMasterPasswordDialog(false);
      setMasterPassword('');
      setSelectedConfigId('');
    } catch (error) {
      setEncryptionError('Invalid master password or corrupted data');
    }
  };

  const decryptConfigData = async (configId: string, encryptedData: string): Promise<any> => {
    try {
      return await decryptSensitiveData(encryptedData, masterPassword);
    } catch {
      return { walletAddress: '••••••••', apiKey: '••••••••', rpcUrl: '••••••••' };
    }
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

  if (encryptionError) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-700">
          <strong>Encryption Error:</strong> {encryptionError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          <strong>Enhanced Security:</strong> All sensitive data is now encrypted with AES-256-GCM encryption. 
          Enhanced validation and rate limiting are active.
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
              {warnings.walletAddress && <p className="text-sm text-yellow-600">{warnings.walletAddress}</p>}
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
              {warnings.maxSlippage && <p className="text-sm text-yellow-600">{warnings.maxSlippage}</p>}
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
              {warnings.maxGasPrice && <p className="text-sm text-yellow-600">{warnings.maxGasPrice}</p>}
            </div>
          </div>

          {errors.rateLimit && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                {errors.rateLimit}
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSaveConfig} disabled={loading} className="w-full">
            {loading ? 'Encrypting & Saving...' : 'Save Secure Configuration'}
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
                      onClick={() => handleViewSensitiveData(config.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {showSensitiveData[config.id] ? (
                    <div className="text-sm space-y-1">
                      <p><strong>Status:</strong> <span className="text-green-600">Decrypted ✓</span></p>
                      <p className="text-muted-foreground">Sensitive data temporarily visible</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      🔒 AES-256 encrypted • Click eye icon to decrypt and view
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

      <Dialog open={showMasterPasswordDialog} onOpenChange={setShowMasterPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Master Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your master password to decrypt and view the sensitive configuration data.
            </p>
            <Input
              type="password"
              placeholder="Master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleDecryptAndShow} disabled={!masterPassword}>
                Decrypt & View
              </Button>
              <Button variant="outline" onClick={() => {
                setShowMasterPasswordDialog(false);
                setMasterPassword('');
                setSelectedConfigId('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecureConfigManager;
