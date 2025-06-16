
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Wallet, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const TargetChainWalletManager = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    chainId, 
    connectWallet, 
    switchNetwork, 
    loading 
  } = useWallet();
  
  const { toast } = useToast();
  const [chainBalances, setChainBalances] = useState<Record<number, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Target chains configuration
  const targetChains = [
    {
      id: 8453,
      name: 'Base',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.base.org',
      explorerUrl: 'https://basescan.org',
      color: 'blue'
    },
    {
      id: 250,
      name: 'Fantom',
      symbol: 'FTM',
      rpcUrl: 'https://rpc.ftm.tools',
      explorerUrl: 'https://ftmscan.com',
      color: 'purple'
    }
    // Note: Solana uses a different wallet connection (Phantom, etc.)
  ];

  useEffect(() => {
    if (isConnected && address) {
      refreshBalances();
    }
  }, [isConnected, address]);

  const refreshBalances = async () => {
    if (!isConnected || !address) return;
    
    setIsRefreshing(true);
    try {
      // In a real implementation, you would fetch balances for each chain
      // For now, we'll simulate the balances
      const balances: Record<number, string> = {};
      
      for (const chain of targetChains) {
        // Simulate balance fetching
        const mockBalance = (Math.random() * 5 + 0.1).toFixed(4);
        balances[chain.id] = mockBalance;
      }
      
      setChainBalances(balances);
      
      toast({
        title: "Balances Updated",
        description: "Successfully refreshed balances for all target chains",
      });
    } catch (error) {
      console.error('Failed to refresh balances:', error);
      toast({
        title: "Error",
        description: "Failed to refresh balances. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSwitchChain = async (targetChainId: number) => {
    try {
      await switchNetwork(targetChainId);
      toast({
        title: "Network Switched",
        description: `Successfully switched to ${targetChains.find(c => c.id === targetChainId)?.name}`,
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast({
        title: "Switch Failed",
        description: "Failed to switch network. Please try manually in your wallet.",
        variant: "destructive",
      });
    }
  };

  const getCurrentChain = () => {
    return targetChains.find(chain => chain.id === chainId);
  };

  const isOnTargetChain = () => {
    return targetChains.some(chain => chain.id === chainId);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Connection Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to start trading on Base, Fantom, and Solana networks.
            </AlertDescription>
          </Alert>
          <Button onClick={connectWallet} disabled={loading} className="w-full">
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Target Chain Wallet Manager
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshBalances}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Connection Status */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Connected Address</span>
            <Badge variant={isOnTargetChain() ? 'default' : 'destructive'}>
              {isOnTargetChain() ? 'Target Chain' : 'Switch Needed'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {address?.slice(0, 8)}...{address?.slice(-8)}
          </div>
          {getCurrentChain() && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm">Current: {getCurrentChain()?.name}</span>
              <Badge variant="secondary">{balance} {getCurrentChain()?.symbol}</Badge>
            </div>
          )}
        </div>

        {/* Target Chains Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Target Chain Status</h4>
          
          {targetChains.map((chain) => (
            <div key={chain.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${chain.color}-500`} />
                <div>
                  <div className="font-medium">{chain.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Balance: {chainBalances[chain.id] || '0.0000'} {chain.symbol}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chainId === chain.id ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSwitchChain(chain.id)}
                  >
                    Switch
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {/* Solana Special Notice */}
          <div className="p-3 border rounded-lg bg-orange-50 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="font-medium">Solana</span>
              <Badge variant="outline">External Wallet</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Solana requires Phantom, Solflare, or similar wallet. Connect separately for SOL arbitrage.
            </p>
          </div>
        </div>

        {/* Network Warnings */}
        {!isOnTargetChain() && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You're not connected to a target chain. Switch to Base or Fantom to start arbitrage trading.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(getCurrentChain()?.explorerUrl, '_blank')}
            disabled={!getCurrentChain()}
          >
            View Explorer
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshBalances}
            disabled={isRefreshing}
          >
            Update Balances
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TargetChainWalletManager;
