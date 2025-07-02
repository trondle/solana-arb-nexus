
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
  AlertTriangle
} from 'lucide-react';
import { PhantomWalletService, WalletBalance } from '../../services/phantomWalletService';
import { LiveTradingEngine } from '../../services/liveTradingEngine';
import SolanaDepositWithdraw from './SolanaDepositWithdraw';
import SolanaFlashLoan from './SolanaFlashLoan';

const WalletDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState<WalletBalance>({
    sol: 0,
    usdc: 0,
    usdt: 0,
    totalUSD: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTradingEngineActive, setIsTradingEngineActive] = useState(false);

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      const isInitialized = await PhantomWalletService.initialize();
      if (isInitialized) {
        const publicKey = PhantomWalletService.getPublicKey();
        if (publicKey) {
          setIsConnected(true);
          setWalletAddress(publicKey);
          await refreshBalances();
        }
      }
    } catch (error) {
      console.error('Wallet initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Wallet initialization failed');
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await PhantomWalletService.connect();
      
      if (result.success) {
        setIsConnected(true);
        setWalletAddress(result.publicKey);
        await refreshBalances();
        
        // Initialize trading engine
        const engineInitialized = await LiveTradingEngine.initialize();
        setIsTradingEngineActive(engineInitialized);
        
        console.log('✅ Wallet connected and trading engine initialized');
      } else {
        setError(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      setError(error instanceof Error ? error.message : 'Wallet connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await PhantomWalletService.disconnect();
      await LiveTradingEngine.shutdown();
      
      setIsConnected(false);
      setWalletAddress('');
      setBalance({ sol: 0, usdc: 0, usdt: 0, totalUSD: 0 });
      setIsTradingEngineActive(false);
      setError(null);
      
      console.log('🔌 Wallet disconnected and trading engine shutdown');
    } catch (error) {
      console.error('❌ Wallet disconnect failed:', error);
      setError('Failed to disconnect wallet');
    }
  };

  const refreshBalances = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const walletBalance = await PhantomWalletService.getBalance();
      setBalance(walletBalance);
      console.log('🔄 Wallet balance refreshed:', walletBalance);
    } catch (error) {
      console.error('❌ Balance refresh failed:', error);
      setError('Failed to refresh balance');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      console.log('📋 Address copied to clipboard');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Connect Phantom Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            {error && (
              <Alert className="mb-6 text-left">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Connection Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}
            
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Phantom Wallet</h3>
            <p className="text-muted-foreground mb-6">
              Connect your Phantom wallet to access live trading features, flash loans, and real-time MEV opportunities.
            </p>
            <Button 
              onClick={connectWallet} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Phantom Wallet
                </>
              )}
            </Button>
            
            <div className="mt-4 text-sm text-muted-foreground">
              Don't have Phantom? <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Download here</a>
            </div>
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
              Phantom Wallet Connected
              <Badge variant="default" className="bg-green-500">Live</Badge>
              {isTradingEngineActive && (
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  Trading Active
                </Badge>
              )}
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
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Wallet Address</div>
              <div className="font-mono text-sm break-all">{walletAddress}</div>
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

      {/* Real Token Balances */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SOL Balance</CardTitle>
            <Badge variant="outline">Solana</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.sol.toFixed(4)} SOL</div>
            <p className="text-xs text-muted-foreground">
              ~${(balance.sol * 100).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USDC Balance</CardTitle>
            <Badge variant="outline">SPL Token</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.usdc.toFixed(2)} USDC</div>
            <p className="text-xs text-muted-foreground">
              ~${balance.usdc.toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USDT Balance</CardTitle>
            <Badge variant="outline">SPL Token</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.usdt.toFixed(2)} USDT</div>
            <p className="text-xs text-muted-foreground">
              ~${balance.usdt.toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <Badge variant="outline">USD Value</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.totalUSD.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Real-time valuation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Requirements Alert */}
      {balance.totalUSD < 10 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Minimum Balance Required:</strong> You need at least $10 worth of assets to access trading features. 
            Current balance: ${balance.totalUSD.toFixed(2)}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="h-16 flex-col gap-2" 
              variant="outline"
              disabled={balance.totalUSD < 10}
            >
              <Send className="w-5 h-5" />
              Send Tokens
            </Button>
            <Button 
              className="h-16 flex-col gap-2" 
              variant="outline"
              disabled={balance.totalUSD < 10}
            >
              <ArrowDownLeft className="w-5 h-5" />
              Deposit
            </Button>
            <Button 
              className="h-16 flex-col gap-2" 
              variant="outline"
              disabled={balance.totalUSD < 10}
            >
              <ArrowUpRight className="w-5 h-5" />
              Flash Loan
            </Button>
            <Button 
              className="h-16 flex-col gap-2" 
              variant="outline"
              disabled={balance.totalUSD < 10}
            >
              <Wallet className="w-5 h-5" />
              Arbitrage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deposit & Withdraw */}
      <SolanaDepositWithdraw 
        balance={balance}
        onBalanceUpdate={refreshBalances}
      />

      {/* Flash Loans */}
      <SolanaFlashLoan 
        balance={balance}
        onBalanceUpdate={refreshBalances}
        isEngineActive={isTradingEngineActive}
      />

      {/* Live Trading Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Live Trading Status
            {isTradingEngineActive ? (
              <Badge variant="default" className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isTradingEngineActive 
              ? 'Your wallet is connected and ready for live trading. All transactions will be processed on-chain.'
              : 'Connect your wallet and ensure sufficient balance to activate live trading features.'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard;
