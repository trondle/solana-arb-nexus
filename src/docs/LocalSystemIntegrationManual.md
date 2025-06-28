
# Local System Integration Manual
## Connecting Your Local Trading System to Live Feed API

### Overview
This manual explains how to connect your local MEV arbitrage system to our online Jupiter-like API service for live data feeds, reducing browser/computer load while maintaining real-time trading capabilities.

### API Endpoints & Authentication

#### Base URL
- Production: `https://your-app.lovable.app/api/live-feed`
- Development: `http://localhost:3000/api/live-feed`

#### Authentication
- **API Key**: Include in header `X-API-Key: YOUR_API_KEY`
- **Rate Limits**: 60 requests per minute (configurable)
- **CORS**: Enabled for local development

### Core API Endpoints

#### 1. Live Prices Endpoint
```
POST /api/live-feed/prices
Content-Type: application/json
X-API-Key: YOUR_API_KEY

{
  "tokens": ["SOL", "ETH", "USDC", "USDT", "FTM"]
}

Response:
{
  "success": true,
  "data": [
    {
      "symbol": "SOL",
      "price": 23.45,
      "change24h": -2.34,
      "volume24h": 1234567,
      "timestamp": 1640995200000,
      "source": "LiveFeedAPI",
      "chainId": 101
    }
  ],
  "timestamp": 1640995200000,
  "rateLimitRemaining": 59
}
```

#### 2. Arbitrage Opportunities Endpoint
```
GET /api/live-feed/arbitrage
X-API-Key: YOUR_API_KEY

Response:
{
  "success": true,
  "opportunities": [
    {
      "id": "arb-1-1640995200000",
      "tokenA": "SOL",
      "tokenB": "USDC",
      "dexA": "Jupiter",
      "dexB": "Raydium",
      "chainA": 101,
      "chainB": 101,
      "priceA": 23.45,
      "priceB": 23.67,
      "spread": 0.94,
      "profitOpportunity": 0.89,
      "confidence": 92.5,
      "estimatedGas": 0.002,
      "flashLoanFee": 0.0005,
      "netProfit": 0.8875
    }
  ],
  "timestamp": 1640995200000
}
```

#### 3. Health Check Endpoint
```
GET /api/live-feed/health
X-API-Key: YOUR_API_KEY

Response:
{
  "status": "healthy",
  "services": {
    "jupiter": true,
    "oneInch": true,
    "coinGecko": true,
    "database": true
  },
  "uptime": 99.5,
  "requestCount": 1247,
  "rateLimitRemaining": 58
}
```

### Local System Integration Code Examples

#### Python Implementation
```python
import requests
import json
import time
from typing import List, Dict

class LiveFeedAPIClient:
    def __init__(self, api_key: str, base_url: str = "https://your-app.lovable.app/api/live-feed"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Content-Type": "application/json",
            "X-API-Key": api_key
        }
    
    def get_live_prices(self, tokens: List[str]) -> Dict:
        """Get live prices for specified tokens"""
        url = f"{self.base_url}/prices"
        payload = {"tokens": tokens}
        
        response = requests.post(url, json=payload, headers=self.headers)
        return response.json()
    
    def get_arbitrage_opportunities(self) -> Dict:
        """Get current arbitrage opportunities"""
        url = f"{self.base_url}/arbitrage"
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def health_check(self) -> Dict:
        """Check API health status"""
        url = f"{self.base_url}/health"
        response = requests.get(url, headers=self.headers)
        return response.json()

# Usage Example
client = LiveFeedAPIClient("your-api-key-here")

# Get prices every 5 seconds
while True:
    prices = client.get_live_prices(["SOL", "ETH", "USDC"])
    opportunities = client.get_arbitrage_opportunities()
    
    print(f"Current SOL price: ${prices['data'][0]['price']}")
    print(f"Found {len(opportunities['opportunities'])} arbitrage opportunities")
    
    time.sleep(5)
```

#### JavaScript/Node.js Implementation
```javascript
const axios = require('axios');

class LiveFeedAPIClient {
    constructor(apiKey, baseUrl = 'https://your-app.lovable.app/api/live-feed') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
        };
    }

    async getLivePrices(tokens) {
        const response = await axios.post(`${this.baseUrl}/prices`, 
            { tokens }, 
            { headers: this.headers }
        );
        return response.data;
    }

    async getArbitrageOpportunities() {
        const response = await axios.get(`${this.baseUrl}/arbitrage`, 
            { headers: this.headers }
        );
        return response.data;
    }

    async healthCheck() {
        const response = await axios.get(`${this.baseUrl}/health`, 
            { headers: this.headers }
        );
        return response.data;
    }
}

// Usage
const client = new LiveFeedAPIClient('your-api-key-here');

setInterval(async () => {
    try {
        const prices = await client.getLivePrices(['SOL', 'ETH', 'USDC']);
        const opportunities = await client.getArbitrageOpportunities();
        
        console.log(`SOL: $${prices.data[0].price}`);
        console.log(`Opportunities: ${opportunities.opportunities.length}`);
    } catch (error) {
        console.error('API Error:', error.message);
    }
}, 5000);
```

### Integration with Namecheap & Google Drive

#### Namecheap Web Hosting Usage
1. **API Relay Server**: Host a relay server on Namecheap to:
   - Cache API responses locally
   - Reduce latency for your local system
   - Implement custom rate limiting
   - Add data persistence

2. **Webhook Endpoints**: Create webhooks for:
   - Trade execution notifications
   - Error alerts
   - Performance monitoring

#### Google Drive Integration
1. **Configuration Storage**: Store API keys and settings in encrypted files
2. **Trade Logs**: Automatically backup trade history and performance data
3. **Strategy Backups**: Version control your trading algorithms
4. **Alert System**: Use Google Apps Script for email/SMS notifications

### Setup Instructions

#### Step 1: API Key Configuration
1. Access the Live Feed API panel in the dashboard
2. Generate your API key
3. Configure rate limits (default: 60/minute)
4. Test connection with health check endpoint

#### Step 2: Local System Setup
1. Install required dependencies (requests/axios)
2. Configure API client with your key
3. Test basic connectivity
4. Implement error handling and retries

#### Step 3: Namecheap Server Setup (Optional)
```bash
# On your Namecheap hosting
npm install express cors axios
# Create relay server
node relay-server.js
```

#### Step 4: Google Drive Integration (Optional)
```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Setup Google Drive API
service = build('drive', 'v3', credentials=creds)

# Backup trade data
def backup_trades(trade_data):
    # Upload to Google Drive
    pass
```

### Error Handling & Best Practices

#### Rate Limiting
- Monitor `rateLimitRemaining` in responses
- Implement exponential backoff
- Cache responses when possible

#### Connection Resilience
```python
import time
import random

def with_retry(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(2 ** attempt + random.uniform(0, 1))
```

#### Data Validation
- Verify timestamp freshness (< 30 seconds)
- Validate price ranges and changes
- Check opportunity confidence scores

### Monitoring & Alerts

#### Health Monitoring
```python
def monitor_api_health():
    health = client.health_check()
    if health['status'] != 'healthy':
        send_alert(f"API Status: {health['status']}")
        
    for service, status in health['services'].items():
        if not status:
            send_alert(f"Service {service} is down")
```

#### Performance Tracking
- API response times
- Success/failure rates  
- Arbitrage opportunity accuracy
- Profit/loss tracking

### Security Considerations

1. **API Key Security**: Store in environment variables, never in code
2. **HTTPS Only**: Always use encrypted connections
3. **IP Whitelisting**: Configure if needed for production
4. **Audit Logging**: Track all API usage for security

### Troubleshooting

#### Common Issues
1. **Rate Limit Exceeded**: Implement proper delays
2. **Stale Data**: Check timestamp validation
3. **Network Timeouts**: Add retry logic
4. **Authentication Errors**: Verify API key format

#### Debug Mode
Enable verbose logging to track:
- Request/response payloads
- Timing information  
- Error details
- Rate limit status

### Advanced Features

#### Websocket Support (Future)
- Real-time price streams
- Instant opportunity notifications
- Reduced latency for high-frequency trading

#### Custom Filters
- Minimum profit thresholds
- Specific token pairs
- Chain preferences
- Risk tolerance settings

### Support & Updates

- API Documentation: Check dashboard for latest changes
- Error Codes: Reference the troubleshooting section
- Feature Requests: Contact through the dashboard
- Status Page: Monitor uptime and maintenance windows
