
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Webhook handlers
const webhookHandlers = {
  async tradeFilled(data) {
    console.log('Trade filled:', data);
    
    // Send email notification
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `Trade Filled: ${data.symbol}`,
      html: `
        <h2>Trade Execution Alert</h2>
        <p><strong>Symbol:</strong> ${data.symbol}</p>
        <p><strong>Amount:</strong> ${data.amount}</p>
        <p><strong>Price:</strong> $${data.price}</p>
        <p><strong>Profit:</strong> $${data.profit}</p>
        <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      `
    });
  },

  async arbitrageOpportunity(data) {
    console.log('Arbitrage opportunity:', data);
    
    // Only notify for high-profit opportunities
    if (data.profitPercent > 2) {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: `High Profit Arbitrage: ${data.profitPercent.toFixed(2)}%`,
        html: `
          <h2>Arbitrage Opportunity Alert</h2>
          <p><strong>Token:</strong> ${data.token}</p>
          <p><strong>Profit:</strong> ${data.profitPercent.toFixed(2)}%</p>
          <p><strong>Buy Chain:</strong> ${data.buyChain}</p>
          <p><strong>Sell Chain:</strong> ${data.sellChain}</p>
          <p><strong>Confidence:</strong> ${data.confidence}%</p>
        `
      });
    }
  },

  async systemAlert(data) {
    console.log('System alert:', data);
    
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `System Alert: ${data.level}`,
      html: `
        <h2>System Alert</h2>
        <p><strong>Level:</strong> ${data.level}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      `
    });
  }
};

// Main webhook endpoint
app.post('/webhook/:type', async (req, res) => {
  const { type } = req.params;
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  try {
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle webhook
    const handler = webhookHandlers[type];
    if (handler) {
      await handler(payload);
      res.json({ success: true, message: `${type} webhook processed` });
    } else {
      res.status(400).json({ error: 'Unknown webhook type' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Health check
app.get('/webhook/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.WEBHOOK_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});

module.exports = app;
