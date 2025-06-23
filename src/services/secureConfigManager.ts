
interface SecureConfig {
  jupiterApiKey?: string;
  oneInchApiKey?: string;
  coinGeckoApiKey?: string;
  encryptionKey?: string;
  lastConfigUpdate: number;
  securityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class SecureConfigManager {
  private static config: SecureConfig = {
    lastConfigUpdate: 0,
    securityLevel: 'HIGH'
  };

  private static readonly STORAGE_KEY = 'personal_api_secure_config';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  // Simple encryption for localStorage (better than plain text)
  private static encrypt(text: string, key: string): string {
    try {
      // Simple XOR encryption (not cryptographically secure, but better than nothing)
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return btoa(result);
    } catch (error) {
      console.error('Encryption failed:', error);
      return text;
    }
  }

  private static decrypt(encrypted: string, key: string): string {
    try {
      const text = atob(encrypted);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encrypted;
    }
  }

  // Generate a simple encryption key based on browser fingerprint
  private static generateEncryptionKey(): string {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '0'
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36) + 'secure_key_2024';
  }

  static setApiKeys(keys: {
    jupiterApiKey?: string;
    oneInchApiKey?: string;
    coinGeckoApiKey?: string;
  }): boolean {
    try {
      this.config = {
        ...this.config,
        ...keys,
        lastConfigUpdate: Date.now(),
        encryptionKey: this.generateEncryptionKey()
      };

      // Save to encrypted localStorage
      const configToSave = {
        jupiterApiKey: keys.jupiterApiKey ? this.encrypt(keys.jupiterApiKey, this.config.encryptionKey!) : undefined,
        oneInchApiKey: keys.oneInchApiKey ? this.encrypt(keys.oneInchApiKey, this.config.encryptionKey!) : undefined,
        coinGeckoApiKey: keys.coinGeckoApiKey ? this.encrypt(keys.coinGeckoApiKey, this.config.encryptionKey!) : undefined,
        lastConfigUpdate: this.config.lastConfigUpdate,
        securityLevel: this.config.securityLevel
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configToSave));
      console.log('✓ API keys securely stored');
      return true;
    } catch (error) {
      console.error('Failed to save API keys:', error);
      return false;
    }
  }

  static loadApiKeys(): SecureConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        console.log('No stored configuration found');
        return this.config;
      }

      const parsedConfig = JSON.parse(stored);
      const encryptionKey = this.generateEncryptionKey();

      // Check if session has expired
      if (Date.now() - parsedConfig.lastConfigUpdate > this.SESSION_TIMEOUT) {
        console.log('Configuration session expired, clearing keys');
        this.clearApiKeys();
        return this.config;
      }

      // Decrypt API keys
      this.config = {
        jupiterApiKey: parsedConfig.jupiterApiKey ? this.decrypt(parsedConfig.jupiterApiKey, encryptionKey) : undefined,
        oneInchApiKey: parsedConfig.oneInchApiKey ? this.decrypt(parsedConfig.oneInchApiKey, encryptionKey) : undefined,
        coinGeckoApiKey: parsedConfig.coinGeckoApiKey ? this.decrypt(parsedConfig.coinGeckoApiKey, encryptionKey) : undefined,
        encryptionKey,
        lastConfigUpdate: parsedConfig.lastConfigUpdate,
        securityLevel: parsedConfig.securityLevel || 'HIGH'
      };

      console.log('✓ API keys loaded from secure storage');
      return this.config;
    } catch (error) {
      console.error('Failed to load API keys:', error);
      return this.config;
    }
  }

  static clearApiKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.config = {
      lastConfigUpdate: 0,
      securityLevel: 'HIGH'
    };
    console.log('✓ API keys cleared from storage');
  }

  static validateApiKey(key: string, service: 'jupiter' | 'oneInch' | 'coinGecko'): boolean {
    if (!key || key.length < 10) return false;

    // Basic validation patterns
    const patterns = {
      jupiter: /^[A-Za-z0-9_-]+$/,
      oneInch: /^[A-Za-z0-9_-]+$/,
      coinGecko: /^CG-[A-Za-z0-9_-]+$/
    };

    return patterns[service].test(key);
  }

  static getSecurityStatus(): {
    hasApiKeys: boolean;
    keyCount: number;
    lastUpdate: string;
    securityLevel: string;
    sessionValid: boolean;
  } {
    const keyCount = [
      this.config.jupiterApiKey,
      this.config.oneInchApiKey,
      this.config.coinGeckoApiKey
    ].filter(Boolean).length;

    const sessionValid = this.config.lastConfigUpdate > 0 && 
      (Date.now() - this.config.lastConfigUpdate) < this.SESSION_TIMEOUT;

    return {
      hasApiKeys: keyCount > 0,
      keyCount,
      lastUpdate: this.config.lastConfigUpdate > 0 ? 
        new Date(this.config.lastConfigUpdate).toLocaleString() : 'Never',
      securityLevel: this.config.securityLevel,
      sessionValid
    };
  }

  static getConfig(): SecureConfig {
    return { ...this.config };
  }

  // Security audit function
  static performSecurityAudit(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check API key security
    if (!this.config.jupiterApiKey) {
      issues.push('No Jupiter API key configured');
      recommendations.push('Add Jupiter API key for Solana price data');
      score -= 20;
    }

    if (!this.config.oneInchApiKey) {
      issues.push('No 1inch API key configured');
      recommendations.push('Add 1inch API key for EVM chain price data');
      score -= 20;
    }

    if (!this.config.coinGeckoApiKey) {
      issues.push('No CoinGecko API key configured');
      recommendations.push('Add CoinGecko API key for backup price data');
      score -= 10;
    }

    // Check session security
    if (this.config.lastConfigUpdate > 0 && 
        (Date.now() - this.config.lastConfigUpdate) > this.SESSION_TIMEOUT) {
      issues.push('Configuration session expired');
      recommendations.push('Re-enter API keys to refresh session');
      score -= 30;
    }

    // Check browser security
    if (!window.crypto || !window.crypto.subtle) {
      issues.push('Browser lacks advanced cryptographic support');
      recommendations.push('Use a modern browser for better security');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }
}
