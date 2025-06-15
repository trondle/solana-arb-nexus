
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Wifi, 
  WifiOff, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Radio
} from 'lucide-react';
import { ConfigurationService } from '@/services/configurationService';
import { PriceAggregator } from '@/services/priceAggregator';
import { WebSocketManager } from '@/services/webSocketManager';
import ApiConfigurationDialog from './ApiConfigurationDialog';

const LiveModeControl = () => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const config = await ConfigurationService.loadConfiguration();
    const status = PriceAggregator.getLiveModeStatus();
    
    setIsLiveMode(config.enableRealTimeMode);
    setHasApiKeys(status.hasApiKeys);
    setIsConnected(status.isLive);
  };

  const toggleLiveMode = async () => {
    setLoading(true);
    
    try {
      const newMode = !isLiveMode;
      
      await ConfigurationService.updateConfig({
        enableRealTimeMode: newMode,
        enableLiveTrading: newMode
      });
      
      // Update services
      const wsManager = WebSocketManager.getInstance();
      wsManager.setRealConnection(newMode);
      
      if (newMode) {
        await wsManager.connect('wss://api.example.com/realtime');
        await PriceAggregator.initialize();
      } else {
        wsManager.disconnect();
      }
      
      setIsLiveMode(newMode);
      setIsConnected(newMode);
    } catch (error) {
      console.error('Failed to toggle live mode:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Live Trading Mode
          </div>
          <Badge variant={isLiveMode ? 'default' : 'secondary'}>
            {isLiveMode ? 'LIVE' : 'DEMO'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasApiKeys ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Key className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-sm">
              {hasApiKeys ? 'API Keys Set' : 'No API Keys'}
            </span>
          </div>
        </div>

        {/* Live Mode Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">Enable Live Trading</div>
            <div className="text-sm text-muted-foreground">
              Use real market data and execute actual trades
            </div>
          </div>
          <Switch
            checked={isLiveMode}
            onCheckedChange={toggleLiveMode}
            disabled={loading}
          />
        </div>

        {/* Warnings and Status */}
        {!hasApiKeys && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              API keys are required for live mode. The system will use demo data until configured.
            </AlertDescription>
          </Alert>
        )}

        {isLiveMode && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>LIVE MODE ACTIVE:</strong> Real trades will be executed. Monitor carefully.
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration Actions */}
        <div className="flex gap-2">
          <ApiConfigurationDialog onConfigurationChange={loadStatus} />
          <Button variant="outline" size="sm" onClick={loadStatus}>
            Refresh Status
          </Button>
        </div>

        {/* Current Mode Info */}
        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          {isLiveMode 
            ? "Live mode: Using real market data and API connections"
            : "Demo mode: Using simulated data for safe testing"
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveModeControl;
