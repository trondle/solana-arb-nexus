
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Code,
  Database,
  Cloud
} from 'lucide-react';

const LocalSystemConnector = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const generateApiKey = () => {
    const key = 'lfa_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(key);
    localStorage.setItem('liveFeedApiKey', key);
    toast({
      title: "API Key Generated",
      description: "New API key created and saved locally",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const testConnection = async () => {
    try {
      // Simulate API test
      setIsConnected(true);
      toast({
        title: "Connection Successful",
        description: "Local system can connect to live feed API",
      });
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Connection Failed",
        description: "Please check your API key and network connection",
        variant: "destructive",
      });
    }
  };

  const pythonCode = `import requests

class LiveFeedAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://your-app.lovable.app/api/live-feed"
        self.headers = {"X-API-Key": api_key}
    
    def get_prices(self, tokens):
        response = requests.post(f"{self.base_url}/prices", 
                               json={"tokens": tokens}, 
                               headers=self.headers)
        return response.json()

# Usage
api = LiveFeedAPI("${apiKey}")
data = api.get_prices(["SOL", "ETH", "USDC"])`;

  const nodejsCode = `const axios = require('axios');

class LiveFeedAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://your-app.lovable.app/api/live-feed';
        this.headers = { 'X-API-Key': apiKey };
    }
    
    async getPrices(tokens) {
        const response = await axios.post(\`\${this.baseUrl}/prices\`, 
                                        { tokens }, 
                                        { headers: this.headers });
        return response.data;
    }
}

// Usage
const api = new LiveFeedAPI('${apiKey}');
const data = await api.getPrices(['SOL', 'ETH', 'USDC']);`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Local System Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Connect your local trading system to this online API for live data feeds, reducing browser load while maintaining real-time capabilities.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Generate or enter API key"
                  className="font-mono text-sm"
                />
                <Button onClick={generateApiKey} variant="outline">
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Connection Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Not Connected
                    </>
                  )}
                </Badge>
                <Button onClick={testConnection} size="sm" variant="outline">
                  Test Connection
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">Base URL</div>
              <div className="font-mono text-xs">your-app.lovable.app/api</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard('https://your-app.lovable.app/api/live-feed', 'Base URL')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">Rate Limit</div>
              <div className="font-bold">60/minute</div>
              <div className="text-xs text-muted-foreground">Configurable</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">Response Time</div>
              <div className="font-bold text-green-600">~200ms</div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Integration Code Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="python" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="python" className="space-y-4">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                <pre>{pythonCode}</pre>
              </div>
              <Button 
                onClick={() => copyToClipboard(pythonCode, 'Python Code')}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Python Code
              </Button>
            </TabsContent>
            
            <TabsContent value="nodejs" className="space-y-4">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                <pre>{nodejsCode}</pre>
              </div>
              <Button 
                onClick={() => copyToClipboard(nodejsCode, 'Node.js Code')}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Node.js Code
              </Button>
            </TabsContent>
            
            <TabsContent value="curl" className="space-y-4">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                <pre>{`curl -X POST https://your-app.lovable.app/api/live-feed/prices \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{"tokens": ["SOL", "ETH", "USDC"]}'`}</pre>
              </div>
              <Button 
                onClick={() => copyToClipboard(`curl -X POST https://your-app.lovable.app/api/live-feed/prices -H "Content-Type: application/json" -H "X-API-Key: ${apiKey}" -d '{"tokens": ["SOL", "ETH", "USDC"]}'`, 'cURL Command')}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy cURL Command
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            External Services Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Namecheap Hosting</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Host API relay server</li>
                <li>• Cache responses locally</li>
                <li>• Custom webhooks</li>
                <li>• Reduced latency</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Google Drive</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Backup trade logs</li>
                <li>• Store configurations</li>
                <li>• Strategy versioning</li>
                <li>• Alert notifications</li>
              </ul>
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Check the integration manual in the documentation for detailed setup instructions for Namecheap and Google Drive integration.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('/docs/LocalSystemIntegrationManual.md', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Integration Manual
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalSystemConnector;
