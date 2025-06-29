
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  Copy, 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

const WalletDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState({
    SOL: 0,
    USDC: 0,
    ETH: 0
  });
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate wallet connection for demo
  useEffect(() => {
    // Check if wallet was previously connected
    const savedWallet = localStorage.getItem('wallet_connected');
    if (savedWallet) {
      setIsConnected(true);
      setWalletAddress('5FHwKrd...');
      setBalance({
        SOL: 12.456,
        USDC: 1250.89,
        ETH: 0.234
      });
    }
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConnected(true);
      setWalletAddress('5FHwKrdHEGaPrxhFzCFP8mXaHvYFMNmfqgmw4LA1tFW8');
      setBalance({
        SOL: 12.456,
        USDC: 1250.89,
        ETH: 0.234
      });
      
      localStorage.setItem('wallet_connected', 'true');
      console.log('✅ Wallet connected successfully');
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance({ SOL: 0, USDC: 0, ETH: 0 });
    localStorage.removeItem('wallet_connected');
    console.log('🔌 Wallet disconnected');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    console.log('📋 Address copied to clipboard');
  };

  const refreshBalances = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Simulate balance refresh with slight variations
      setBalance(prev => ({
        SOL: prev.SOL + (Math.random() - 0.5) * 0.1,
        USDC: prev.USDC + (Math.random() - 0.5) * 10,
        ETH: prev.ETH + (Math.random() - 0.5) * 0.01
      }));
      console.log('🔄 Balances refreshed');
    } catch (error) {
      console.error('❌ Balance refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to start trading and manage your assets
            </p>
            <Button 
              onClick={connectWallet} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Wallet Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-green-500" />
              Wallet Dashboard
              <Badge variant="default" className="bg-green-500">Connected</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshBalances} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Wallet Address</div>
              <div className="font-mono text-sm">{walletAddress}</div>
            </div>
            <Button variant="outline" size="sm" onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://solscan.io/account/${walletAddress}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SOL Balance</CardTitle>
            <Badge variant="outline">Solana</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.SOL.toFixed(3)} SOL</div>
            <p className="text-xs text-muted-foreground">
              ~${(balance.SOL * 98.5).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USDC Balance</CardTitle>
            <Badge variant="outline">Multi-chain</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.USDC.toFixed(2)} USDC</div>
            <p className="text-xs text-muted-foreground">
              ~${balance.USDC.toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETH Balance</CardTitle>
            <Badge variant="outline">Ethereum</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.ETH.toFixed(4)} ETH</div>
            <p className="text-xs text-muted-foreground">
              ~${(balance.ETH * 3420).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-16 flex-col gap-2" variant="outline">
              <Send className="w-5 h-5" />
              Send
            </Button>
            <Button className="h-16 flex-col gap-2" variant="outline">
              <ArrowDownLeft className="w-5 h-5" />
              Receive
            </Button>
            <Button className="h-16 flex-col gap-2" variant="outline">
              <ArrowUpRight className="w-5 h-5" />
              Swap
            </Button>
            <Button className="h-16 flex-col gap-2" variant="outline">
              <Wallet className="w-5 h-5" />
              Bridge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> This is a demo wallet interface. In a live environment, never share your private keys and always verify transaction details before signing.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default WalletDashboard;
