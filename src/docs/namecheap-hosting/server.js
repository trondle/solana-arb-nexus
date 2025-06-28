
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Middleware
app.use(cors({
  origin: ['https://your-domain.com', 'http://localhost:3000', 'https://your-app.lovable.app'],
  credentials: true
}));
app.use(express.json());

// Configuration
const CONFIG = {
  MAIN_API_URL: 'https://your-app.lovable.app/api/live-feed',
  BACKUP_API_URLS: [
    'https://backup1.your-domain.com/api',
    'https://backup2.your-domain.com/api'
  ],
  CACHE_DURATION: 300, // 5 minutes
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || 'your-webhook-secret',
  LOG_FILE: 'api-relay.log'
};

// Logging function
async function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logEntry.trim());
  
  try {
    await fs.appendFile(CONFIG.LOG_FILE, logEntry);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cache_stats: cache.getStats()
  });
});

// Main API relay endpoint with caching
app.post('/api/live-feed/prices', async (req, res) => {
  const { tokens, apiKey } = req.body;
  const cacheKey = `prices_${JSON.stringify(tokens)}_${apiKey || 'no_key'}`;
  
  try {
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      await log(`Cache HIT for ${tokens.join(',')}`);
      return res.json({
        ...cachedData,
        cached: true,
        cache_timestamp: Date.now()
      });
    }

    await log(`Cache MISS for ${tokens.join(',')}, fetching from API`);

    // Try main API first
    let response;
    try {
      response = await axios.post(`${CONFIG.MAIN_API_URL}/prices`, 
        { tokens }, 
        { 
          headers: apiKey ? { 'X-API-Key': apiKey } : {},
          timeout: 5000 
        }
      );
    } catch (mainApiError) {
      await log(`Main API failed: ${mainApiError.message}`, 'ERROR');
      
      // Try backup APIs
      for (const backupUrl of CONFIG.BACKUP_API_URLS) {
        try {
          response = await axios.post(`${backupUrl}/prices`, 
            { tokens }, 
            { 
              headers: apiKey ? { 'X-API-Key': apiKey } : {},
              timeout: 5000 
            }
          );
          await log(`Backup API ${backupUrl} succeeded`);
          break;
        } catch (backupError) {
          await log(`Backup API ${backupUrl} failed: ${backupError.message}`, 'ERROR');
        }
      }
    }

    if (!response) {
      throw new Error('All API endpoints failed');
    }

    const data = response.data;
    
    // Cache the response
    cache.set(cacheKey, data, CONFIG.CACHE_DURATION);
    await log(`Cached response for ${tokens.join(',')}`);

    res.json({
      ...data,
      cached: false,
      relay_timestamp: Date.now()
    });

  } catch (error) {
    await log(`API relay error: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      error: 'API relay server error',
      message: error.message
    });
  }
});

// Arbitrage opportunities endpoint
app.get('/api/live-feed/arbitrage', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const cacheKey = `arbitrage_${apiKey || 'no_key'}`;
  
  try {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({ ...cachedData, cached: true });
    }

    const response = await axios.get(`${CONFIG.MAIN_API_URL}/arbitrage`, {
      headers: apiKey ? { 'X-API-Key': apiKey } : {},
      timeout: 5000
    });

    const data = response.data;
    cache.set(cacheKey, data, 30); // Cache for 30 seconds (more frequent updates)
    
    res.json({ ...data, cached: false });
  } catch (error) {
    await log(`Arbitrage API error: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch arbitrage opportunities'
    });
  }
});

// Webhook endpoint for trade notifications
app.post('/webhooks/trade-notification', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  try {
    // Verify webhook signature (basic example)
    const expectedSignature = require('crypto')
      .createHmac('sha256', CONFIG.WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
      await log('Invalid webhook signature', 'ERROR');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    await log(`Trade notification received: ${JSON.stringify(payload)}`);
    
    // Process the trade notification
    // You can add your custom logic here:
    // - Send email notifications
    // - Update local database
    // - Trigger other webhooks
    // - Log to Google Drive
    
    res.json({ success: true, message: 'Notification processed' });
  } catch (error) {
    await log(`Webhook error: ${error.message}`, 'ERROR');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Cache management endpoints
app.get('/admin/cache/stats', (req, res) => {
  res.json(cache.getStats());
});

app.post('/admin/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ success: true, message: 'Cache cleared' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  log(`Unhandled error: ${error.message}`, 'ERROR');
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  log(`API Relay Server running on port ${PORT}`);
  log(`Main API: ${CONFIG.MAIN_API_URL}`);
  log(`Backup APIs: ${CONFIG.BACKUP_API_URLS.join(', ')}`);
});

module.exports = app;
