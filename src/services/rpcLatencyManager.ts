
export interface RpcEndpoint {
  url: string;
  name: string;
  latency: number;
  isHealthy: boolean;
  lastChecked: number;
  successRate: number;
}

export class RpcLatencyManager {
  private endpoints: RpcEndpoint[] = [
    { url: 'https://api.mainnet-beta.solana.com', name: 'Solana Official', latency: 0, isHealthy: true, lastChecked: 0, successRate: 100 },
    { url: 'https://solana-api.projectserum.com', name: 'Project Serum', latency: 0, isHealthy: true, lastChecked: 0, successRate: 100 },
    { url: 'https://rpc.ankr.com/solana', name: 'Ankr', latency: 0, isHealthy: true, lastChecked: 0, successRate: 100 },
    { url: 'https://solana.publicnode.com', name: 'PublicNode', latency: 0, isHealthy: true, lastChecked: 0, successRate: 100 },
    { url: 'https://mainnet.helius-rpc.com/?api-key=public', name: 'Helius Public', latency: 0, isHealthy: true, lastChecked: 0, successRate: 100 }
  ];
  
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  async initialize(): Promise<void> {
    console.log('🌐 Initializing RPC Latency Manager...');
    
    // Initial health check for all endpoints
    await this.checkAllEndpoints();
    
    // Start continuous monitoring
    this.startMonitoring();
    
    console.log('✅ RPC Latency Manager initialized');
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('📡 Starting RPC endpoint monitoring...');
    
    // Check endpoints every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllEndpoints();
    }, 30000);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('📡 Stopped RPC endpoint monitoring');
  }

  private async checkAllEndpoints(): Promise<void> {
    console.log('🔍 Checking RPC endpoint health and latency...');
    
    const checkPromises = this.endpoints.map(endpoint => this.checkEndpoint(endpoint));
    await Promise.allSettled(checkPromises);
    
    // Sort by latency and health
    this.endpoints.sort((a, b) => {
      if (a.isHealthy && !b.isHealthy) return -1;
      if (!a.isHealthy && b.isHealthy) return 1;
      return a.latency - b.latency;
    });
    
    const healthyCount = this.endpoints.filter(e => e.isHealthy).length;
    console.log(`📊 RPC Health Check: ${healthyCount}/${this.endpoints.length} endpoints healthy`);
  }

  private async checkEndpoint(endpoint: RpcEndpoint): Promise<void> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const latency = Date.now() - startTime;
      const isHealthy = response.ok;
      
      // Update success rate (rolling average)
      const successRate = endpoint.successRate * 0.9 + (isHealthy ? 10 : 0);
      
      Object.assign(endpoint, {
        latency,
        isHealthy,
        lastChecked: Date.now(),
        successRate
      });
      
      console.log(`📡 ${endpoint.name}: ${latency}ms, ${isHealthy ? 'healthy' : 'unhealthy'}`);
    } catch (error) {
      const latency = Date.now() - startTime;
      const successRate = endpoint.successRate * 0.9; // Decrease success rate
      
      Object.assign(endpoint, {
        latency: Math.max(latency, 5000), // Set high latency for failed requests
        isHealthy: false,
        lastChecked: Date.now(),
        successRate
      });
      
      console.log(`❌ ${endpoint.name}: Failed (${latency}ms)`);
    }
  }

  async getBestEndpoint(): Promise<RpcEndpoint> {
    // Return the best performing healthy endpoint
    const healthyEndpoints = this.endpoints.filter(e => e.isHealthy);
    
    if (healthyEndpoints.length === 0) {
      console.warn('⚠️ No healthy RPC endpoints available, using first endpoint');
      return this.endpoints[0];
    }
    
    const bestEndpoint = healthyEndpoints[0];
    console.log(`🚀 Using best RPC: ${bestEndpoint.name} (${bestEndpoint.latency}ms)`);
    
    return bestEndpoint;
  }

  addCustomEndpoint(url: string, name: string): void {
    const endpoint: RpcEndpoint = {
      url,
      name,
      latency: 0,
      isHealthy: true,
      lastChecked: 0,
      successRate: 100
    };
    
    this.endpoints.push(endpoint);
    console.log(`➕ Added custom RPC endpoint: ${name}`);
    
    // Check the new endpoint immediately
    this.checkEndpoint(endpoint);
  }

  removeEndpoint(url: string): void {
    const index = this.endpoints.findIndex(e => e.url === url);
    if (index !== -1) {
      const removed = this.endpoints.splice(index, 1)[0];
      console.log(`➖ Removed RPC endpoint: ${removed.name}`);
    }
  }

  getEndpointStats(): RpcEndpoint[] {
    return [...this.endpoints];
  }

  async shutdown(): Promise<void> {
    this.stopMonitoring();
    console.log('🔴 RPC Latency Manager shutdown');
  }
}
