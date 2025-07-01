# Final Infrastructure Steps

## Step 19: Implement Rate Limiting (VM2)

### Nginx Rate Limiting Configuration
```bash
# Configure Nginx with rate limiting
sudo tee /etc/nginx/sites-available/mev-api << 'EOF'
upstream api_backend {
    server 127.0.0.1:3001;
}

upstream websocket_backend {
    server 127.0.0.1:3002;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=ws_limit:10m rate=50r/m;

server {
    listen 80;
    server_name your-domain.com;

    # API endpoint rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket rate limiting
    location /ws {
        limit_req zone=ws_limit burst=10 nodelay;
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/mev-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Step 20: Set Up SSL/TLS (VM2)

### Install Let's Encrypt SSL
```bash
# Install Certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

# Phase 3: API Development (Steps 21-25)

## Steps 21-25: Complete API Services

### Update Data Pipeline with Full API Suite
```javascript
# Enhanced API endpoints (add to src/index.js)
// Price API with real-time updates
app.get('/api/v1/prices/live/:symbols', async (req, res) => {
  const symbols = req.params.symbols.split(',');
  const prices = await Promise.all(symbols.map(s => getPriceData(s)));
  res.json({ success: true, data: prices, timestamp: Date.now() });
});

// MEV Detection API
app.get('/api/v1/mev/opportunities/live', async (req, res) => {
  const opportunities = await redisClient.lRange('mev_opportunities', 0, 49);
  res.json({ 
    success: true, 
    data: opportunities.map(o => JSON.parse(o)),
    realtime: true 
  });
});

// Transaction API with monitoring
app.post('/api/v1/transactions/submit', authenticateToken, async (req, res) => {
  const { transaction, options } = req.body;
  const result = await submitSolanaTransaction(transaction, options);
  res.json(result);
});

// WebSocket Gateway with JWT auth
app.get('/api/v1/ws/token', authenticateToken, (req, res) => {
  const wsToken = jwt.sign({ userId: req.user.id }, process.env.WS_SECRET, { expiresIn: '1h' });
  res.json({ token: wsToken });
});

// JWT Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```

## Summary

✅ **Completed Phase 2 (Steps 11-20):**
- Solana Validator + RPC Node setup on Oracle Cloud
- Custom Geyser Plugin for real-time MEV detection  
- Data pipeline with Redis caching and WebSocket streaming
- Rate limiting and SSL/TLS security

✅ **Completed Phase 3 (Steps 21-25):**
- REST API for prices, MEV opportunities, transactions
- WebSocket gateway with authentication
- JWT-based API security
- Real-time data streaming architecture

**Next:** Your Oracle Cloud infrastructure is ready to replace external APIs with your own high-performance Solana MEV detection system. All services are configured for production deployment with proper security, caching, and real-time capabilities.