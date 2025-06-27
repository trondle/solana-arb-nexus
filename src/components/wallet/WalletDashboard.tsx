
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Shield,
  AlertCircle,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useWallet } from '@/hooks/useWallet';

const WalletDashboard = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { toast } = useToast();
  
  const { 
    isConnected, 
    address, 
    balance, 
    chainId, 
    connectWallet, 
    disconnectWallet,
    deposit,
    withdraw,
    loading 
  } = useWallet();

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

  const getChainName = (chainId: number | null) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      8453: 'Base',
      137: 'Polygon', 
      42161: 'Arbitrum',
      10: 'Optimism',
      250: 'Fantom'
    };
    return chainId ? chains[chainId] || 'Unknown Network' : 'Unknown';
  };

  const getExplorerUrl = (address: string, chainId: number | null) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      8453: 'https://basescan.org',
      137: 'https://polygonscan.com',
      42161: 'https://arbiscan.io', 
      10: 'https://optimistic.etherscan.io',
      250: 'https://ftmscan.com'
    };
    const explorer = chainId ? explorers[chainId] || 'https://etherscan.io' : 'https://etherscan.io';
    return `${explorer}/address/${address}`;
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await deposit(depositAmount, 'ETH');
      setDepositAmount('');
      toast({
        title: "Deposit Initiated",
        description: `Deposit of ${depositAmount} initiated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }
    
    if (!withdrawAddress || withdrawAddress.length < 42) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid withdrawal address",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await withdraw(withdrawAmount, 'ETH', withdrawAddress);
      setWithdrawAmount('');
      setWithdrawAddress('');
      toast({
        title: "Withdrawal Initiated",
        description: `Withdrawal of ${withdrawAmount} initiated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Connect MetaMask Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Connect Your MetaMask Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect MetaMask to access low-fee cryptocurrencies and flash loan arbitrage
              </p>
              
              {typeof window !== 'undefined' && !window.ethereum && (
                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 mx-auto mb-2" />
                  <p className="text-red-700 text-sm">
                    MetaMask not detected. Please install MetaMask extension first.
                  </p>
                </div>
              )}
              
              <Button 
                onClick={connectWallet}
                disabled={loading || (typeof window !== 'undefined' && !window.ethereum)}
                size="lg"
                className="bg-blue-500 hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect MetaMask
                  </>
                )}
              </Button>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Supported Networks</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>✓ Base (Low fees, fast transactions)</div>
                  <div>✓ Polygon (MATIC - very low fees)</div>
                  <div>✓ Arbitrum (ETH L2 - reduced fees)</div>
                  <div>✓ Optimism (ETH L2 - low cost)</div>
                  <div>✓ Fantom (FTM - ultra low fees)</div>
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
      {/* Real Wallet Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              MetaMask Connected
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              >
                {isBalanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Real Portfolio Value */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-800">
                {isBalanceVisible ? `${parseFloat(balance || '0').toFixed(4)} ${getChainName(chainId).includes('Ethereum') ? 'ETH' : getChainName(chainId) === 'Polygon' ? 'MATIC' : getChainName(chainId) === 'Fantom' ? 'FTM' : 'ETH'}` : '****'}
              </div>
              <div className="text-sm text-muted-foreground">Wallet Balance</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs">Ready for flash loans</span>
              </div>
            </div>

            {/* Real Wallet Address */}
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Connected Wallet</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{address ? formatAddress(address) : 'Not connected'}</span>
                  {address && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyAddress(address)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={getExplorerUrl(address, chainId)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Current Network</div>
                <div className="flex items-center gap-2">
                  <Badge variant={chainId ? "default" : "destructive"}>
                    {getChainName(chainId)}
                  </Badge>
                  {chainId && [8453, 137, 42161, 10, 250].includes(chainId) && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <Shield className="w-3 h-3 mr-1" />
                      Low Fee
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Real Wallet Actions */}
            <div className="space-y-2">
              <Button className="w-full bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Deposit Crypto
              </Button>
              <Button variant="outline" className="w-full">
                <Minus className="w-4 h-4 mr-2" />
                Withdraw Crypto
              </Button>
              <div className="text-xs text-muted-foreground text-center mt-2">
                Low-fee networks supported
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Address Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Your Deposit Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-2">Send funds to this address:</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                  {address || 'Connect wallet to see address'}
                </code>
                {address && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyAddress(address)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Only send {getChainName(chainId)} network tokens to this address
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit Amount</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="0.0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  step="0.001"
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleDeposit}
                  disabled={loading || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Confirm Deposit'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Address Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Minus className="w-5 h-5" />
            Withdraw Funds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawAddress">Withdrawal Address</Label>
                <Input
                  id="withdrawAddress"
                  placeholder="0x..."
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Enter the wallet address where you want to receive funds
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawAmount">Withdrawal Amount</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    placeholder="0.0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    step="0.001"
                    min="0"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleWithdraw}
                    disabled={loading || !withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) <= 0}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? 'Processing...' : 'Initiate Withdrawal'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle>Network Fee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="font-semibold text-sm">Base Network</div>
              <div className="text-xs text-muted-foreground">ETH transactions</div>
              <div className="text-lg font-bold text-green-600">~$0.01-0.05</div>
              <div className="text-xs">Per transaction</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold text-sm">Polygon</div>
              <div className="text-xs text-muted-foreground">MATIC transactions</div>
              <div className="text-lg font-bold text-green-600">~$0.001-0.01</div>
              <div className="text-xs">Per transaction</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold text-sm">Fantom</div>
              <div className="text-xs text-muted-foreground">FTM transactions</div>
              <div className="text-lg font-bold text-green-600">~$0.0001-0.001</div>
              <div className="text-xs">Per transaction</div>
            </div>
          </div>
          
          {chainId && ![8453, 137, 42161, 10, 250].includes(chainId) && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">High Fee Network Detected</span>
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                Consider switching to Base, Polygon, or Fantom for much lower transaction fees.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard;
