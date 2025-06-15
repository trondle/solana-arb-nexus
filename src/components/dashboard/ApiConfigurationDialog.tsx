
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { ConfigurationService } from '@/services/configurationService';
import { useToast } from '@/hooks/use-toast';

interface ApiConfigurationDialogProps {
  onConfigurationChange?: () => void;
}

const ApiConfigurationDialog = ({ onConfigurationChange }: ApiConfigurationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState({
    jupiter: false,
    oneInch: false,
    coinGecko: false
  });
  const [formData, setFormData] = useState({
    jupiterApiKey: '',
    oneInchApiKey: '',
    coinGeckoApiKey: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCurrentConfig();
    }
  }, [open]);

  const loadCurrentConfig = async () => {
    try {
      const config = await ConfigurationService.loadConfiguration();
      setFormData({
        jupiterApiKey: config.jupiterApiKey || '',
        oneInchApiKey: config.oneInchApiKey || '',
        coinGeckoApiKey: config.coinGeckoApiKey || ''
      });
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await ConfigurationService.updateConfig(formData);
      toast({
        title: "Configuration saved",
        description: "API keys have been successfully updated.",
      });
      setOpen(false);
      onConfigurationChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (key: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configure APIs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Configuration</DialogTitle>
          <DialogDescription>
            Configure your API keys for live trading data. Leave fields empty to use demo data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Jupiter API Key */}
          <div className="grid gap-2">
            <Label htmlFor="jupiter-key">Jupiter API Key (Optional)</Label>
            <div className="relative">
              <Input
                id="jupiter-key"
                type={showKeys.jupiter ? "text" : "password"}
                placeholder="Enter Jupiter API key..."
                value={formData.jupiterApiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, jupiterApiKey: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => toggleShowKey('jupiter')}
              >
                {showKeys.jupiter ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              For Solana token prices and DEX data
            </p>
          </div>

          {/* 1inch API Key */}
          <div className="grid gap-2">
            <Label htmlFor="oneinch-key">1inch API Key (Optional)</Label>
            <div className="relative">
              <Input
                id="oneinch-key"
                type={showKeys.oneInch ? "text" : "password"}
                placeholder="Enter 1inch API key..."
                value={formData.oneInchApiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, oneInchApiKey: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => toggleShowKey('oneInch')}
              >
                {showKeys.oneInch ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              For Ethereum and EVM chain prices
            </p>
          </div>

          {/* CoinGecko API Key */}
          <div className="grid gap-2">
            <Label htmlFor="coingecko-key">CoinGecko API Key (Optional)</Label>
            <div className="relative">
              <Input
                id="coingecko-key"
                type={showKeys.coinGecko ? "text" : "password"}
                placeholder="Enter CoinGecko API key..."
                value={formData.coinGeckoApiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, coinGeckoApiKey: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => toggleShowKey('coinGecko')}
              >
                {showKeys.coinGecko ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              For comprehensive market data and analytics
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiConfigurationDialog;
