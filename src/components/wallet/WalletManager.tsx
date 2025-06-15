
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWallet } from '@/hooks/useWallet';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Copy, 
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const WalletManager = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    chainId, 
    connectWallet, 
    disconnectWallet,
    deposit,
    withdraw,
    switchNetwork,
    loading 
  } = useWallet();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');

  const supportedChains = [
    { id: 1, name: 'Ethereum', symbol: 'ETH' },
    { id: 8453, name: 'Base', symbol: 'ETH' },
    { id: 137, name: 'Polygon', symbol: 'MATIC' },
    { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
    { id: 10, name: 'Optimism', symbol: 'ETH' },
    { id: 250, name: 'Fantom', symbol: 'FTM' }
  ];

  const currentChain = supportedChains.find(chain => chain.id === chainId);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    await deposit(depositAmount, selectedToken);
    setDepositAmount('');
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) <= 0) return;
    await withdraw(withdrawAmount, selectedToken, withdrawAddress);
    setWithdrawAmount('');
    setWithdrawAddress('');
  };

  if (!isConnected) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="w-6 h-6" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Connect your MetaMask wallet to deposit and withdraw crypto for arbitrage trading.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={connectWallet}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Make sure you have MetaMask installed and unlocked
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wallet Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-500" />
              Wallet Connected
            </div>
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Address</Label>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </code>
                <Button variant="ghost" size="sm" onClick={copyAddress}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a 
                    href={`https://etherscan.io/address/${address}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Balance</Label>
              <div className="text-lg font-semibold">
                {balance ? `${parseFloat(balance).toFixed(4)} ${currentChain?.symbol || 'ETH'}` : '0.0000 ETH'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Network</Label>
              <div className="flex items-center gap-2">
                <Badge variant={currentChain ? "default" : "destructive"}>
                  {currentChain?.name || 'Unsupported'}
                </Badge>
                {!currentChain && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => switchNetwork(1)}
                  >
                    Switch to Ethereum
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit/Withdraw Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit" className="flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" />
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                Withdraw
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit" className="space-y-4 mt-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Deposit crypto to fund your arbitrage trading operations. Funds will be available for trading immediately after confirmation.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    step="0.001"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Token</Label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH - Ethereum</SelectItem>
                      <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                      <SelectItem value="USDT">USDT - Tether</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleDeposit}
                disabled={loading || !depositAmount || parseFloat(depositAmount) <= 0}
                className="w-full"
                size="lg"
              >
                {loading ? 'Processing...' : `Deposit ${depositAmount || '0'} ${selectedToken}`}
              </Button>
            </TabsContent>
            
            <TabsContent value="withdraw" className="space-y-4 mt-6">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  Withdrawal requests are processed manually for security. Allow 1-24 hours for processing.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      step="0.001"
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Token</Label>
                    <Select value={selectedToken} onValueChange={setSelectedToken}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH">ETH - Ethereum</SelectItem>
                        <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                        <SelectItem value="USDT">USDT - Tether</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Withdrawal Address</Label>
                  <Input
                    placeholder="0x..."
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the wallet address where you want to receive the funds
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleWithdraw}
                disabled={loading || !withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) <= 0}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {loading ? 'Processing...' : `Request Withdrawal of ${withdrawAmount || '0'} ${selectedToken}`}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletManager;
