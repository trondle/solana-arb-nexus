
import { supabase } from '@/integrations/supabase/client';

interface ApiConfiguration {
  jupiterApiKey?: string;
  oneInchApiKey?: string;
  coinGeckoApiKey?: string;
  enableRealTimeMode: boolean;
  enableLiveTrading: boolean;
  localServiceConfig?: {
    enabled: boolean;
    baseUrl: string;
    port: string;
  };
  enableLocalService?: boolean;
}

export class ConfigurationService {
  private static config: ApiConfiguration = {
    enableRealTimeMode: false,
    enableLiveTrading: false
  };

  static async loadConfiguration(): Promise<ApiConfiguration> {
    try {
      // Try to load from Supabase secrets if available
      const { data, error } = await supabase.functions.invoke('get-configuration');
      
      if (!error && data) {
        this.config = { ...this.config, ...data };
      } else {
        // Fallback to environment variables or default config
        console.log('Using default configuration (demo mode)');
      }
    } catch (error) {
      console.log('Configuration service: Using demo mode');
    }

    return this.config;
  }

  static getConfig(): ApiConfiguration {
    return { ...this.config };
  }

  static async updateConfig(updates: Partial<ApiConfiguration>): Promise<void> {
    this.config = { ...this.config, ...updates };
    
    try {
      await supabase.functions.invoke('update-configuration', {
        body: this.config
      });
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  static isLiveModeEnabled(): boolean {
    return this.config.enableRealTimeMode && this.config.enableLiveTrading;
  }

  static hasApiKeys(): boolean {
    return !!(this.config.jupiterApiKey || this.config.oneInchApiKey || this.config.coinGeckoApiKey);
  }

  static isLocalServiceEnabled(): boolean {
    return !!(this.config.enableLocalService && this.config.localServiceConfig?.enabled);
  }

  static hasDataSource(): boolean {
    return this.hasApiKeys() || this.isLocalServiceEnabled();
  }
}
