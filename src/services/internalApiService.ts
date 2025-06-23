
interface ApiKeyData {
  key: string;
  name: string;
  permissions: string[];
  createdAt: number;
  lastUsed: number;
  usageCount: number;
  active: boolean;
}

interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastHour: number;
  lastDay: number;
}

export class InternalApiService {
  private static apiKeys = new Map<string, ApiKeyData>();
  private static usageStats = new Map<string, ApiUsageStats>();
  private static rateLimits = new Map<string, { count: number; resetTime: number }>();

  // Generate a new API key
  static generateApiKey(name: string, permissions: string[] = ['price_read']): string {
    const key = `fmav_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const apiKeyData: ApiKeyData = {
      key,
      name,
      permissions,
      createdAt: Date.now(),
      lastUsed: 0,
      usageCount: 0,
      active: true
    };
    
    this.apiKeys.set(key, apiKeyData);
    this.usageStats.set(key, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastHour: 0,
      lastDay: 0
    });
    
    console.log(`✅ Generated new API key: ${name} (${key.substring(0, 20)}...)`);
    return key;
  }

  // Validate API key and check permissions
  static validateApiKey(key: string, requiredPermission: string = 'price_read'): boolean {
    const apiKeyData = this.apiKeys.get(key);
    
    if (!apiKeyData || !apiKeyData.active) {
      return false;
    }
    
    if (!apiKeyData.permissions.includes(requiredPermission) && !apiKeyData.permissions.includes('all')) {
      return false;
    }
    
    // Check rate limits (1000 requests per hour per key)
    const now = Date.now();
    const rateLimit = this.rateLimits.get(key);
    
    if (rateLimit) {
      if (now - rateLimit.resetTime > 3600000) { // 1 hour
        rateLimit.count = 0;
        rateLimit.resetTime = now;
      }
      
      if (rateLimit.count >= 1000) {
        console.warn(`Rate limit exceeded for API key: ${key.substring(0, 20)}...`);
        return false;
      }
      
      rateLimit.count++;
    } else {
      this.rateLimits.set(key, { count: 1, resetTime: now });
    }
    
    // Update usage statistics
    apiKeyData.lastUsed = now;
    apiKeyData.usageCount++;
    
    const stats = this.usageStats.get(key)!;
    stats.totalRequests++;
    
    return true;
  }

  // Record successful API call
  static recordSuccess(key: string, responseTime: number): void {
    const stats = this.usageStats.get(key);
    if (stats) {
      stats.successfulRequests++;
      stats.averageResponseTime = (stats.averageResponseTime + responseTime) / 2;
    }
  }

  // Record failed API call
  static recordFailure(key: string): void {
    const stats = this.usageStats.get(key);
    if (stats) {
      stats.failedRequests++;
    }
  }

  // Get all API keys for management
  static getAllApiKeys(): ApiKeyData[] {
    return Array.from(this.apiKeys.values());
  }

  // Get usage statistics for an API key
  static getUsageStats(key: string): ApiUsageStats | null {
    return this.usageStats.get(key) || null;
  }

  // Deactivate API key
  static deactivateApiKey(key: string): boolean {
    const apiKeyData = this.apiKeys.get(key);
    if (apiKeyData) {
      apiKeyData.active = false;
      console.log(`🔒 Deactivated API key: ${key.substring(0, 20)}...`);
      return true;
    }
    return false;
  }

  // Reactivate API key
  static reactivateApiKey(key: string): boolean {
    const apiKeyData = this.apiKeys.get(key);
    if (apiKeyData) {
      apiKeyData.active = true;
      console.log(`🔓 Reactivated API key: ${key.substring(0, 20)}...`);
      return true;
    }
    return false;
  }

  // Delete API key
  static deleteApiKey(key: string): boolean {
    const deleted = this.apiKeys.delete(key);
    this.usageStats.delete(key);
    this.rateLimits.delete(key);
    
    if (deleted) {
      console.log(`🗑️ Deleted API key: ${key.substring(0, 20)}...`);
    }
    
    return deleted;
  }

  // Get system overview
  static getSystemOverview(): {
    totalKeys: number;
    activeKeys: number;
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
  } {
    const allStats = Array.from(this.usageStats.values());
    const totalRequests = allStats.reduce((sum, stats) => sum + stats.totalRequests, 0);
    const successfulRequests = allStats.reduce((sum, stats) => sum + stats.successfulRequests, 0);
    const avgResponseTime = allStats.reduce((sum, stats) => sum + stats.averageResponseTime, 0) / allStats.length || 0;
    
    return {
      totalKeys: this.apiKeys.size,
      activeKeys: Array.from(this.apiKeys.values()).filter(key => key.active).length,
      totalRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      averageResponseTime: avgResponseTime
    };
  }

  // Initialize with a default API key for development
  static initialize(): void {
    if (this.apiKeys.size === 0) {
      const defaultKey = this.generateApiKey('Default MEV Arbitrage Key', ['all']);
      console.log(`🔑 Default API key generated: ${defaultKey}`);
      
      // Store in localStorage for easy access
      localStorage.setItem('fmav_default_api_key', defaultKey);
    }
  }

  // Get the default API key
  static getDefaultApiKey(): string | null {
    return localStorage.getItem('fmav_default_api_key');
  }
}
