
# Namecheap Deployment Guide

## Prerequisites
- Namecheap hosting account with Node.js support
- Domain configured with Namecheap
- SSH access to your hosting server
- Google Drive API credentials (optional)

## Step 1: Server Setup

### Upload Files
1. Upload all files to your Namecheap hosting directory
2. Set up the following structure:
```
/public_html/
├── server.js
├── package.json
├── ecosystem.config.js
├── .htaccess
├── webhook-server.js
├── google-drive-backup.js
└── logs/
```

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```env
NODE_ENV=production
PORT=3000
WEBHOOK_PORT=3001
WEBHOOK_SECRET=your-secure-webhook-secret
GOOGLE_PROJECT_ID=your-google-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NOTIFICATION_EMAIL=alerts@yourdomain.com
```

## Step 2: Domain Configuration

### DNS Settings
Add these DNS records in Namecheap:
```
A Record: api.yourdomain.com → Your Server IP
CNAME: webhook.yourdomain.com → api.yourdomain.com
```

### SSL Certificate
1. Enable SSL through Namecheap cPanel
2. Force HTTPS redirects (included in .htaccess)

## Step 3: Process Management

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
npm run pm2:start

# Check status
pm2 status

# View logs
pm2 logs mev-relay
```

### Manual Start
```bash
# Start main server
node server.js &

# Start webhook server
node webhook-server.js &
```

## Step 4: Testing

### Health Check
```bash
curl https://api.yourdomain.com/health
```

### API Test
```bash
curl -X POST https://api.yourdomain.com/api/live-feed/prices \
  -H "Content-Type: application/json" \
  -d '{"tokens": ["SOL", "ETH"]}'
```

### Webhook Test
```bash
curl -X POST https://webhook.yourdomain.com/webhook/tradeFilled \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=your-signature" \
  -d '{"symbol": "SOL", "amount": 100, "price": 23.45}'
```

## Step 5: Local Client Setup

### Python Client
1. Install dependencies:
```bash
pip install requests python-dotenv
```

2. Create `.env` file:
```env
RELAY_URL=https://api.yourdomain.com
API_KEY=your-api-key
```

3. Run the client:
```bash
python local-client.py
```

### Node.js Client
1. Install dependencies:
```bash
npm install axios dotenv
```

2. Run the client:
```bash
node local-client.js
```

## Step 6: Monitoring & Maintenance

### Log Monitoring
```bash
# View real-time logs
tail -f api-relay.log

# PM2 logs
pm2 logs mev-relay --lines 100
```

### Performance Monitoring
- Check `/admin/cache/stats` for cache performance
- Monitor server resources through Namecheap cPanel
- Set up uptime monitoring (e.g., UptimeRobot)

### Backup System
- Logs are automatically backed up to Google Drive
- Configuration backups run daily
- Monitor backup status in Drive folder

## Step 7: Custom Domain Benefits

### Professional API Endpoints
- `https://api.yourdomain.com/live-feed/prices`
- `https://webhook.yourdomain.com/trade-notification`
- `https://backup.yourdomain.com/api/health`

### Load Balancing
Configure multiple endpoints:
- Primary: `api.yourdomain.com`
- Backup: `api2.yourdomain.com`
- Emergency: `emergency-api.yourdomain.com`

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000/3001 are available
2. **SSL issues**: Verify certificate installation
3. **CORS errors**: Check .htaccess configuration
4. **Memory limits**: Monitor and adjust PM2 settings

### Debug Commands
```bash
# Check process status
ps aux | grep node

# Test port connectivity
telnet your-domain.com 3000

# Check SSL certificate
openssl s_client -connect api.yourdomain.com:443
```

## Security Considerations
- Keep webhook secrets secure
- Use strong API keys
- Regularly update dependencies
- Monitor access logs
- Implement rate limiting
- Use HTTPS only
