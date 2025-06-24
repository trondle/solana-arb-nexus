
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Plus, 
  Minus, 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const WalletDashboard = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock wallet data - will be replaced with real wallet integration
  const mockWalletData = {
    address: '0x742d35Cc6A123456789abcdef0123456789abcdef',
    solanaAddress: 'DemoSolanaWallet123456789ABCDEFGHIJK',
    balances: [
      { symbol: 'ETH', balance: 0.0, value: 0.0, chain: 'Base' },
      { symbol: 'SOL', balance: 0.0, value: 0.0, chain: 'Solana' },
      { symbol: 'FTM', balance: 0.0, value: 0.0, chain: 'Fantom' },
      { symbol: 'USDC', balance: 0.0, value: 0.0, chain: 'Multi-Chain' }
    ],
    totalValue: 0.0
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to multi-chain wallet",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Multi-Chain Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to manage funds across Solana, Base, and Fantom networks
              </p>
              <Button 
                onClick={connectWallet}
                disabled={isLoading}
                size="lg"
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Supported Features</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>✓ Multi-chain wallet management (Solana, Base, Fantom)</div>
                  <div>✓ Secure deposit and withdrawal functionality</div>
                  <div>✓ Flash loan arbitrage execution</div>
                  <div>✓ Low-fee cryptocurrency support</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Multi-Chain Wallet Dashboard
              <Badge variant="default" className="bg-green-500">Connected</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              >
                {isBalanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Portfolio Value */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-800">
                {isBalanceVisible ? `$${mockWalletData.totalValue.toFixed(2)}` : '****'}
              </div>
              <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs">Ready for arbitrage</span>
              </div>
            </div>

            {/* Wallet Addresses */}
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">EVM Chains (Base, Fantom)</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(mockWalletData.address)}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyAddress(mockWalletData.address)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Solana</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(mockWalletData.solanaAddress)}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyAddress(mockWalletData.solanaAddress)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button className="w-full bg-green-500 hover:bg-green-600" disabled>
                <Plus className="w-4 h-4 mr-2" />
                Deposit (Coming Soon)
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <Minus className="w-4 h-4 mr-2" />
                Withdraw (Coming Soon)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockWalletData.balances.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold">{token.symbol}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.chain}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {isBalanceVisible ? token.balance.toFixed(4) : '****'} {token.symbol}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isBalanceVisible ? `$${token.value.toFixed(2)}` : '****'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> Deposit and withdrawal functionality will be implemented in the next phase. 
              The system will support low-fee cryptocurrencies for optimal cost efficiency.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard;
