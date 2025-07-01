# Data Pipeline & Services Implementation

## Step 15: Configure Geyser Streaming

### Update Validator Configuration (VM1)
```bash
# Add geyser plugin to validator startup
sudo systemctl stop solana-validator

# Update service configuration
sudo tee /etc/systemd/system/solana-validator.service > /dev/null << 'EOF'
[Unit]
Description=Solana Validator
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=ubuntu
LimitNOFILE=1000000
LogRateLimitIntervalSec=0
Environment="PATH=/home/ubuntu/.local/share/solana/install/active_release/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/ubuntu/.local/share/solana/install/active_release/bin/solana-validator \
    --identity /home/ubuntu/validator-keypair.json \
    --vote-account /home/ubuntu/vote-account-keypair.json \
    --ledger /home/ubuntu/ledger \
    --accounts /home/ubuntu/accounts \
    --log /home/ubuntu/solana-validator.log \
    --rpc-port 8899 \
    --rpc-bind-address 0.0.0.0 \
    --full-rpc-api \
    --no-voting \
    --enable-rpc-transaction-history \
    --enable-extended-tx-metadata-storage \
    --limit-ledger-size 200000000 \
    --geyser-plugin-config /home/ubuntu/geyser-config/mev-plugin.json

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start solana-validator
```

---

## Step 16: Implement Data Pipeline (VM2)

### Install Node.js and Dependencies
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create data pipeline project
mkdir -p ~/mev-data-pipeline
cd ~/mev-data-pipeline

# Initialize project
npm init -y

# Install dependencies
npm install express redis ws solana-web3.js @solana/spl-token jsonwebtoken bcryptjs helmet cors rate-limit-redis express-rate-limit winston node-cron axios
```

### Create Data Pipeline Service
```javascript
# Create src/index.js
mkdir src
cat > src/index.js << 'EOF'
const express = require('express');
const redis = require('redis');
const WebSocket = require('ws');
const { Connection, PublicKey } = require('@solana/web3.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const winston = require('winston');
const cron = require('node-cron');
const axios = require('axios');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

class MevDataPipeline {
  constructor() {
    this.app = express();
    this.server = null;
    this.wss = null;
    this.redisClient = null;
    this.solanaConnection = null;
    this.clients = new Set();
    this.priceCache = new Map();
    this.mevOpportunities = [];
    
    this.init();
  }

  async init() {
    try {
      // Initialize Redis
      this.redisClient = redis.createClient({
        url: 'redis://localhost:6379'
      });
      await this.redisClient.connect();
      logger.info('Connected to Redis');

      // Initialize Solana connection
      this.solanaConnection = new Connection('http://localhost:8899', 'confirmed');
      logger.info('Connected to Solana RPC');

      // Setup Express middleware
      this.setupMiddleware();
      this.setupRoutes();
      this.setupWebSocket();
      
      // Start background processes
      this.startMevProcessor();
      this.startPriceUpdater();
      
      // Start server
      this.server = this.app.listen(3001, '0.0.0.0', () => {
        logger.info('MEV Data Pipeline running on port 3001');
      });

    } catch (error) {
      logger.error('Failed to initialize:', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // Security
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      store: new RedisStore({
        client: this.redisClient,
        prefix: 'rl:'
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP'
    });
    this.app.use('/api/', limiter);

    this.app.use(express.json({ limit: '10mb' }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        redis: this.redisClient.isReady,
        solana: this.solanaConnection._rpcEndpoint
      });
    });

    // MEV Opportunities API
    this.app.get('/api/mev/opportunities', async (req, res) => {
      try {
        const opportunities = await this.redisClient.lRange('mev_opportunities', 0, 99);
        const parsed = opportunities.map(op => JSON.parse(op));
        res.json({
          success: true,
          data: parsed,
          count: parsed.length
        });
      } catch (error) {
        logger.error('Error fetching opportunities:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Price Data API
    this.app.get('/api/prices/:symbol', async (req, res) => {
      try {
        const { symbol } = req.params;
        const priceData = this.priceCache.get(symbol);
        
        if (!priceData) {
          return res.status(404).json({ 
            success: false, 
            error: 'Symbol not found' 
          });
        }

        res.json({
          success: true,
          data: priceData
        });
      } catch (error) {
        logger.error('Error fetching price:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Transaction submission
    this.app.post('/api/transactions/submit', async (req, res) => {
      try {
        const { transaction } = req.body;
        
        // Submit transaction to Solana
        const signature = await this.solanaConnection.sendRawTransaction(
          Buffer.from(transaction, 'base64'),
          { skipPreflight: false, preflightCommitment: 'confirmed' }
        );

        // Monitor transaction
        const confirmation = await this.solanaConnection.confirmTransaction(signature);
        
        res.json({
          success: true,
          signature,
          confirmation
        });
      } catch (error) {
        logger.error('Transaction submission failed:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // MEV opportunity submission (from geyser plugin)
    this.app.post('/api/mev/opportunities', async (req, res) => {
      try {
        const opportunity = req.body;
        
        // Validate and store opportunity
        await this.storeMevOpportunity(opportunity);
        
        // Broadcast to WebSocket clients
        this.broadcast('mev_opportunity', opportunity);
        
        res.json({ success: true });
      } catch (error) {
        logger.error('Error storing MEV opportunity:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  setupWebSocket() {
    this.wss = new WebSocket.Server({ 
      port: 3002,
      host: '0.0.0.0'
    });

    this.wss.on('connection', (ws, req) => {
      const clientId = Math.random().toString(36).substr(2, 9);
      ws.clientId = clientId;
      this.clients.add(ws);
      
      logger.info(`WebSocket client connected: ${clientId}`);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          logger.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info(`WebSocket client disconnected: ${clientId}`);
      });

      // Send initial data
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: Date.now()
      }));
    });

    logger.info('WebSocket server running on port 3002');
  }

  async handleWebSocketMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
      case 'subscribe_prices':
        ws.subscriptions = payload.symbols;
        break;
      case 'subscribe_mev':
        ws.mevSubscription = true;
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
    }
  }

  broadcast(type, data) {
    const message = JSON.stringify({ type, data, timestamp: Date.now() });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          logger.error('Error broadcasting to client:', error);
          this.clients.delete(client);
        }
      }
    });
  }

  async storeMevOpportunity(opportunity) {
    // Store in Redis
    await this.redisClient.lPush('mev_opportunities', JSON.stringify(opportunity));
    await this.redisClient.lTrim('mev_opportunities', 0, 999); // Keep last 1000

    // Update in-memory cache
    this.mevOpportunities.unshift(opportunity);
    if (this.mevOpportunities.length > 100) {
      this.mevOpportunities = this.mevOpportunities.slice(0, 100);
    }
  }

  startMevProcessor() {
    // Process MEV opportunities from Redis every second
    setInterval(async () => {
      try {
        const opportunities = await this.redisClient.lRange('mev_opportunities', 0, 9);
        
        for (const opportunity of opportunities) {
          const parsed = JSON.parse(opportunity);
          
          // Broadcast new opportunities
          this.broadcast('mev_opportunity', parsed);
          
          // Remove processed opportunity
          await this.redisClient.lPop('mev_opportunities');
        }
      } catch (error) {
        logger.error('MEV processor error:', error);
      }
    }, 1000);
  }

  startPriceUpdater() {
    // Update prices every 5 seconds
    setInterval(async () => {
      try {
        await this.updatePrices();
      } catch (error) {
        logger.error('Price update error:', error);
      }
    }, 5000);

    // Price cleanup every hour
    cron.schedule('0 * * * *', () => {
      this.priceCache.clear();
      logger.info('Price cache cleared');
    });
  }

  async updatePrices() {
    const symbols = ['SOL', 'USDC', 'USDT', 'RAY', 'SRM'];
    
    for (const symbol of symbols) {
      try {
        // Get price from external API (fallback)
        const priceData = await this.fetchPriceData(symbol);
        this.priceCache.set(symbol, priceData);
        
        // Broadcast price update
        this.broadcast('price_update', { symbol, price: priceData });
      } catch (error) {
        logger.error(`Error updating price for ${symbol}:`, error);
      }
    }
  }

  async fetchPriceData(symbol) {
    // Mock price data - replace with actual price fetching
    const basePrice = { SOL: 98.5, USDC: 1.0, USDT: 1.0, RAY: 2.45, SRM: 0.32 }[symbol] || 1.0;
    const variance = (Math.random() - 0.5) * 0.02; // ±1%
    
    return {
      symbol,
      price: basePrice * (1 + variance),
      change24h: (Math.random() - 0.5) * 8,
      volume24h: Math.random() * 1000000,
      timestamp: Date.now(),
      source: 'internal'
    };
  }
}

// Start the pipeline
new MevDataPipeline();
EOF
```

### Create Package.json and Service
```bash
# Update package.json
cat > package.json << 'EOF'
{
  "name": "mev-data-pipeline",
  "version": "1.0.0",
  "description": "MEV Data Pipeline for Solana",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "redis": "^4.6.5",
    "ws": "^8.13.0",
    "@solana/web3.js": "^1.77.3",
    "@solana/spl-token": "^0.3.8",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "helmet": "^6.1.5",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.7.0",
    "rate-limit-redis": "^3.0.1",
    "winston": "^3.8.2",
    "node-cron": "^3.0.2",
    "axios": "^1.4.0"
  }
}
EOF

# Install dependencies
npm install

# Create systemd service
sudo tee /etc/systemd/system/mev-pipeline.service > /dev/null << 'EOF'
[Unit]
Description=MEV Data Pipeline
After=network.target redis.service
Requires=redis.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/mev-data-pipeline
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable mev-pipeline
sudo systemctl start mev-pipeline
```

Continue to Redis and WebSocket setup...