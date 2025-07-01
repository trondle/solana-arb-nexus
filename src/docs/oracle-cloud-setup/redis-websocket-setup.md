# Redis Cache & WebSocket Configuration

## Step 17: Set Up Redis Cache (VM2)

### Configure Redis for High Performance
```bash
# Edit Redis configuration
sudo tee /etc/redis/redis.conf > /dev/null << 'EOF'
# Network
bind 127.0.0.1
port 6379
protected-mode yes

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Performance
tcp-keepalive 300
tcp-backlog 511
timeout 0
databases 16

# Security
requirepass your_redis_password_here

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Advanced
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
stream-node-max-bytes 4096
stream-node-max-entries 100
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
dynamic-hz yes
aof-rewrite-incremental-fsync yes
rdb-save-incremental-fsync yes
EOF

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test Redis connection
redis-cli ping
```

### Create Redis Data Structures for MEV
```bash
# Create Redis setup script
cat > ~/setup-redis-structures.sh << 'EOF'
#!/bin/bash

redis-cli << 'REDIS_COMMANDS'
# Price data structures
HSET prices:SOL price 98.50 change24h 2.34 volume24h 1234567 timestamp $(date +%s)
HSET prices:USDC price 1.0002 change24h 0.01 volume24h 987654 timestamp $(date +%s)
HSET prices:USDT price 0.9998 change24h -0.02 volume24h 876543 timestamp $(date +%s)
HSET prices:RAY price 2.45 change24h 5.67 volume24h 345678 timestamp $(date +%s)

# MEV opportunity queues
LPUSH mev_opportunities '{"type":"arbitrage","profit":15.67,"confidence":0.85}'
LPUSH flash_loan_opportunities '{"type":"flash_loan","profit":45.23,"confidence":0.92}'

# Trading statistics
HSET trading_stats total_volume 0 total_profit 0 total_trades 0 success_rate 0

# Configuration
HSET config max_slippage 0.5 min_profit 10 gas_limit 1000000

REDIS_COMMANDS
EOF

chmod +x ~/setup-redis-structures.sh
./setup-redis-structures.sh
```

---

## Step 18: Configure WebSocket Endpoints (VM2)

### Enhanced WebSocket Server
```javascript
# Update WebSocket implementation in data pipeline
cat > src/websocket-server.js << 'EOF'
const WebSocket = require('ws');
const redis = require('redis');
const { EventEmitter } = require('events');
const winston = require('winston');

class EnhancedWebSocketServer extends EventEmitter {
  constructor(port = 3002) {
    super();
    this.port = port;
    this.wss = null;
    this.clients = new Map();
    this.redisClient = null;
    this.subscriptions = new Map();
    this.heartbeatInterval = null;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'websocket.log' })
      ]
    });

    this.init();
  }

  async init() {
    try {
      // Connect to Redis
      this.redisClient = redis.createClient({ url: 'redis://localhost:6379' });
      await this.redisClient.connect();
      
      // Subscribe to Redis channels
      await this.redisClient.subscribe('mev_channel', (message) => {
        this.broadcastToSubscribers('mev', JSON.parse(message));
      });
      
      await this.redisClient.subscribe('price_channel', (message) => {
        this.broadcastToSubscribers('price', JSON.parse(message));
      });

      this.setupWebSocketServer();
      this.startHeartbeat();
      
      this.logger.info(`Enhanced WebSocket server started on port ${this.port}`);
    } catch (error) {
      this.logger.error('Failed to initialize WebSocket server:', error);
      throw error;
    }
  }

  setupWebSocketServer() {
    this.wss = new WebSocket.Server({ 
      port: this.port,
      host: '0.0.0.0',
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          windowBits: 13,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 1024
        },
        threshold: 1024,
        concurrencyLimit: 10,
        clientMaxWindow: 13,
        serverMaxWindow: 13,
        serverMaxNoContextTakeover: false,
        clientMaxNoContextTakeover: false,
        compress: true,
        deflate: true
      }
    });

    this.wss.on('connection', (ws, req) => {
      this.handleNewConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      this.logger.error('WebSocket server error:', error);
    });
  }

  handleNewConnection(ws, req) {
    const clientId = this.generateClientId();
    const clientInfo = {
      id: clientId,
      ip: req.socket.remoteAddress,
      connectedAt: new Date(),
      subscriptions: new Set(),
      isAlive: true,
      messageCount: 0,
      lastActivity: new Date()
    };

    this.clients.set(ws, clientInfo);
    
    this.logger.info(`Client connected: ${clientId} from ${clientInfo.ip}`);

    // Send welcome message
    this.sendToClient(ws, {
      type: 'connection',
      data: {
        clientId,
        timestamp: Date.now(),
        serverVersion: '1.0.0'
      }
    });

    ws.on('message', (message) => {
      this.handleMessage(ws, message);
    });

    ws.on('pong', () => {
      const client = this.clients.get(ws);
      if (client) {
        client.isAlive = true;
        client.lastActivity = new Date();
      }
    });

    ws.on('close', (code, reason) => {
      this.handleDisconnection(ws, code, reason);
    });

    ws.on('error', (error) => {
      this.logger.error(`Client error (${clientId}):`, error);
      this.handleDisconnection(ws);
    });
  }

  handleMessage(ws, message) {
    const client = this.clients.get(ws);
    if (!client) return;

    client.messageCount++;
    client.lastActivity = new Date();

    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe':
          this.handleSubscription(ws, data.channels);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(ws, data.channels);
          break;
        case 'ping':
          this.sendToClient(ws, { type: 'pong', timestamp: Date.now() });
          break;
        case 'get_opportunities':
          this.sendMevOpportunities(ws);
          break;
        case 'get_prices':
          this.sendCurrentPrices(ws);
          break;
        default:
          this.logger.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      this.logger.error('Error parsing message:', error);
      this.sendToClient(ws, {
        type: 'error',
        data: { message: 'Invalid message format' }
      });
    }
  }

  handleSubscription(ws, channels) {
    const client = this.clients.get(ws);
    if (!client) return;

    channels.forEach(channel => {
      client.subscriptions.add(channel);
      
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());
      }
      this.subscriptions.get(channel).add(ws);
    });

    this.sendToClient(ws, {
      type: 'subscribed',
      data: { channels, timestamp: Date.now() }
    });

    this.logger.info(`Client ${client.id} subscribed to: ${channels.join(', ')}`);
  }

  handleUnsubscription(ws, channels) {
    const client = this.clients.get(ws);
    if (!client) return;

    channels.forEach(channel => {
      client.subscriptions.delete(channel);
      
      const channelSubs = this.subscriptions.get(channel);
      if (channelSubs) {
        channelSubs.delete(ws);
        if (channelSubs.size === 0) {
          this.subscriptions.delete(channel);
        }
      }
    });

    this.sendToClient(ws, {
      type: 'unsubscribed',
      data: { channels, timestamp: Date.now() }
    });
  }

  handleDisconnection(ws, code, reason) {
    const client = this.clients.get(ws);
    if (!client) return;

    // Remove from all subscriptions
    client.subscriptions.forEach(channel => {
      const channelSubs = this.subscriptions.get(channel);
      if (channelSubs) {
        channelSubs.delete(ws);
        if (channelSubs.size === 0) {
          this.subscriptions.delete(channel);
        }
      }
    });

    this.clients.delete(ws);
    
    this.logger.info(`Client disconnected: ${client.id} (code: ${code}, reason: ${reason})`);
  }

  broadcastToSubscribers(channel, data) {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'broadcast',
      channel,
      data,
      timestamp: Date.now()
    };

    const messageStr = JSON.stringify(message);
    
    subscribers.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
        } catch (error) {
          this.logger.error('Error broadcasting to client:', error);
          this.handleDisconnection(ws);
        }
      }
    });
  }

  async sendMevOpportunities(ws) {
    try {
      const opportunities = await this.redisClient.lRange('mev_opportunities', 0, 19);
      const parsed = opportunities.map(op => JSON.parse(op));
      
      this.sendToClient(ws, {
        type: 'mev_opportunities',
        data: parsed,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error('Error fetching MEV opportunities:', error);
    }
  }

  async sendCurrentPrices(ws) {
    try {
      const symbols = ['SOL', 'USDC', 'USDT', 'RAY'];
      const prices = {};
      
      for (const symbol of symbols) {
        const priceData = await this.redisClient.hGetAll(`prices:${symbol}`);
        if (Object.keys(priceData).length > 0) {
          prices[symbol] = priceData;
        }
      }
      
      this.sendToClient(ws, {
        type: 'current_prices',
        data: prices,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error('Error fetching current prices:', error);
    }
  }

  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        this.logger.error('Error sending to client:', error);
      }
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, ws) => {
        if (!client.isAlive) {
          this.logger.info(`Terminating inactive client: ${client.id}`);
          ws.terminate();
          return;
        }
        
        client.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 second heartbeat
  }

  generateClientId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      activeSubscriptions: this.subscriptions.size,
      totalChannels: Array.from(this.subscriptions.keys()),
      uptime: process.uptime()
    };
  }

  async close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.wss) {
      this.wss.close();
    }
    
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    
    this.logger.info('WebSocket server closed');
  }
}

module.exports = EnhancedWebSocketServer;
EOF
```

### WebSocket Client Test Script
```javascript
# Create test client
cat > test-websocket-client.js << 'EOF'
const WebSocket = require('ws');

class TestWebSocketClient {
  constructor(url = 'ws://localhost:3002') {
    this.url = url;
    this.ws = null;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      console.log('Connected to WebSocket server');
      
      // Subscribe to channels
      this.send({
        type: 'subscribe',
        channels: ['mev', 'price', 'arbitrage']
      });
      
      // Request current data
      this.send({ type: 'get_opportunities' });
      this.send({ type: 'get_prices' });
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('Received:', message.type, message.data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.ws.on('close', () => {
      console.log('Disconnected from WebSocket server');
      // Reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

// Start test client
new TestWebSocketClient();
EOF

# Test the WebSocket connection
node test-websocket-client.js
```

Continue to rate limiting and SSL setup...