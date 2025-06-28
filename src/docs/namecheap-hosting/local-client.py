
import requests
import json
import time
import logging
from typing import Dict, List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class MEvApiClient:
    def __init__(self, relay_url: str, api_key: Optional[str] = None):
        self.relay_url = relay_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'X-API-Key': api_key})
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('mev_client.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def get_live_prices(self, tokens: List[str]) -> Dict:
        """Get live prices through the relay server"""
        try:
            url = f"{self.relay_url}/api/live-feed/prices"
            payload = {"tokens": tokens}
            
            response = self.session.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            cache_status = "CACHED" if data.get('cached') else "FRESH"
            self.logger.info(f"Prices fetched for {tokens} - {cache_status}")
            
            return data
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to fetch prices: {e}")
            return {"success": False, "error": str(e)}

    def get_arbitrage_opportunities(self) -> Dict:
        """Get arbitrage opportunities"""
        try:
            url = f"{self.relay_url}/api/live-feed/arbitrage"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            opportunities = data.get('opportunities', [])
            
            self.logger.info(f"Found {len(opportunities)} arbitrage opportunities")
            
            return data
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to fetch opportunities: {e}")
            return {"success": False, "error": str(e)}

    def monitor_prices(self, tokens: List[str], interval: int = 5):
        """Continuously monitor prices"""
        self.logger.info(f"Starting price monitoring for {tokens} (interval: {interval}s)")
        
        while True:
            try:
                # Get prices
                prices = self.get_live_prices(tokens)
                if prices.get('success'):
                    for price_data in prices.get('data', []):
                        symbol = price_data['symbol']
                        price = price_data['price']
                        change = price_data['change24h']
                        
                        print(f"{symbol}: ${price:.4f} ({change:+.2f}%)")
                
                # Get opportunities
                opportunities = self.get_arbitrage_opportunities()
                if opportunities.get('success'):
                    for opp in opportunities.get('opportunities', [])[:3]:  # Top 3
                        profit = opp['profitOpportunity']
                        confidence = opp['confidence']
                        
                        print(f"📈 {opp['tokenA']}-{opp['tokenB']}: {profit:.2f}% profit ({confidence:.1f}% confidence)")
                
                print("-" * 50)
                time.sleep(interval)
                
            except KeyboardInterrupt:
                self.logger.info("Monitoring stopped by user")
                break
            except Exception as e:
                self.logger.error(f"Monitoring error: {e}")
                time.sleep(interval)

    def send_webhook_test(self, webhook_url: str, data: Dict):
        """Send test webhook"""
        try:
            response = requests.post(webhook_url, json=data, timeout=5)
            response.raise_for_status()
            
            self.logger.info("Webhook sent successfully")
            return response.json()
        except Exception as e:
            self.logger.error(f"Webhook failed: {e}")
            return {"success": False, "error": str(e)}

# Example usage and configuration
if __name__ == "__main__":
    # Configuration
    RELAY_URL = os.getenv('RELAY_URL', 'https://your-domain.com')
    API_KEY = os.getenv('API_KEY')
    
    # Initialize client
    client = MEvApiClient(RELAY_URL, API_KEY)
    
    # Test the connection
    health = requests.get(f"{RELAY_URL}/health").json()
    print(f"Relay server status: {health['status']}")
    
    # Monitor specific tokens
    tokens_to_monitor = ['SOL', 'ETH', 'USDC', 'USDT']
    
    try:
        client.monitor_prices(tokens_to_monitor, interval=5)
    except KeyboardInterrupt:
        print("\nMonitoring stopped.")
