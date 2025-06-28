
const axios = require('axios');
const EventEmitter = require('events');
require('dotenv').config();

class MEvApiClient extends EventEmitter {
  constructor(relayUrl, apiKey = null) {
    super();
    this.relayUrl = relayUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.isMonitoring = false;
    
    this.client = axios.create({
      baseURL: this.relayUrl,
      timeout: 10000,
      headers: apiKey ? { 'X-API-Key': apiKey } : {}
    });
  }

  async getLivePrices(tokens) {
    try {
      const response = await this.client.post('/api/live-feed/prices', { tokens });
      
      const cacheStatus = response.data.cached ? 'CACHED' : 'FRESH';
      console.log(`✅ Prices fetched for ${tokens.join(', ')} - ${cacheStatus}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch prices:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getArbitrageOpportunities() {
    try {
      const response = await this.client.get('/api/live-feed/arbitrage');
      
      const opportunities = response.data.opportunities || [];
      console.log(`🔍 Found ${opportunities.length} arbitrage opportunities`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch opportunities:', error.message);
      return { success: false, error: error.message };
    }
  }

  async startMonitoring(tokens, interval = 5000) {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log(`🚀 Starting price monitoring for ${tokens.join(', ')} (interval: ${interval}ms)`);

    const monitor = async () => {
      if (!this.isMonitoring) return;

      try {
        // Fetch prices
        const prices = await this.getLivePrices(tokens);
        if (prices.success) {
          this.emit('prices', prices.data);
          
          prices.data.forEach(priceData => {
            const { symbol, price, change24h } = priceData;
            const changeColor = change24h >= 0 ? '🟢' : '🔴';
            console.log(`${changeColor} ${symbol}: $${price.toFixed(4)} (${change24h.toFixed(2)}%)`);
          });
        }

        // Fetch opportunities
        const opportunities = await this.getArbitrageOpportunities();
        if (opportunities.success) {
          this.emit('opportunities', opportunities.opportunities);
          
          opportunities.opportunities.slice(0, 3).forEach(opp => {
            const { tokenA, tokenB, profitOpportunity, confidence } = opp;
            console.log(`📈 ${tokenA}-${tokenB}: ${profitOpportunity.toFixed(2)}% profit (${confidence.toFixed(1)}% confidence)`);
          });
        }

        console.log('-'.repeat(50));
        
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
        this.emit('error', error);
      }

      setTimeout(monitor, interval);
    };

    monitor();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ Monitoring stopped');
  }

  async sendWebhook(webhookUrl, data) {
    try {
      const response = await axios.post(webhookUrl, data, { timeout: 5000 });
      console.log('📤 Webhook sent successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Webhook failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/health');
      console.log(`✅ Relay server healthy - Uptime: ${response.data.uptime}s`);
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
  }
}

// Example usage
async function main() {
  const RELAY_URL = process.env.RELAY_URL || 'https://your-domain.com';
  const API_KEY = process.env.API_KEY;
  
  const client = new MEvApiClient(RELAY_URL, API_KEY);
  
  // Event listeners
  client.on('prices', (prices) => {
    // Handle price updates
    console.log('📊 Price update received');
  });
  
  client.on('opportunities', (opportunities) => {
    // Handle arbitrage opportunities
    const highProfitOpps = opportunities.filter(opp => opp.profitOpportunity > 1);
    if (highProfitOpps.length > 0) {
      console.log(`🚨 ${highProfitOpps.length} high-profit opportunities detected!`);
    }
  });
  
  client.on('error', (error) => {
    console.error('Client error:', error.message);
  });
  
  // Test connection
  const isConnected = await client.testConnection();
  if (!isConnected) {
    console.error('Failed to connect to relay server');
    process.exit(1);
  }
  
  // Start monitoring
  const tokensToMonitor = ['SOL', 'ETH', 'USDC', 'USDT'];
  await client.startMonitoring(tokensToMonitor, 5000);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    client.stopMonitoring();
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MEvApiClient;
